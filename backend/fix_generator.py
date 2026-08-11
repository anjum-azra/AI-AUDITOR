import os
import json
import logging
from typing import Dict, Any, List, Optional
import requests

logger = logging.getLogger("fix_generator")

# Built-in intelligent rule fallback remediator for reliable out-of-the-box operation
RULE_FALLBACKS = {
    "image-alt": {
        "explanation": "Image elements without an 'alt' attribute cannot be read by screen readers. Visually impaired users will hear generic filenames or missing image announcements.",
        "why_it_matters": "Screen reader users rely on alt text to understand visual content, context, and function of images.",
        "generate_fix": lambda html, node: (
            html.replace("<img", '<img alt="Descriptive image text"') if "<img" in html and "alt=" not in html 
            else '<img src="image.jpg" alt="Descriptive label for screen readers">'
        ),
        "steps": [
            "Added descriptive `alt` attribute to the `<img>` element.",
            "Ensured alt text describes the image function or content concisely."
        ]
    },
    "button-name": {
        "explanation": "Buttons without discernible text or ARIA labels cannot be announced by screen readers, leaving visually impaired users unable to determine the button's action.",
        "why_it_matters": "Assistive tech relies on accessible button names to announce interactive controls during keyboard navigation.",
        "generate_fix": lambda html, node: (
            html.replace("<button>", '<button aria-label="Perform action">')
            .replace('type="submit">', 'type="submit" aria-label="Submit form">')
            if "<button" in html
            else '<button type="button" aria-label="Submit Form">Submit</button>'
        ),
        "steps": [
            "Added an explicit `aria-label` or visible button text.",
            "Ensured assistive tools can announce the button's purpose clearly."
        ]
    },
    "label": {
        "explanation": "Form controls (`<input>`, `<select>`, `<textarea>`) must have associated `<label>` elements or ARIA labels. Without them, screen readers announce 'Edit text' without context.",
        "why_it_matters": "Form field labels guide users on what information is required when filling out inputs.",
        "generate_fix": lambda html, node: (
            f'<label for="input-field">Field Name</label>\n' + html.replace("<input", '<input id="input-field"')
            if "<input" in html and 'id=' not in html
            else html.replace("<input", '<input aria-label="Input description"')
        ),
        "steps": [
            "Associated an explicit `<label for=\"...\">` or `aria-label` attribute with the form input.",
            "Provided accessible text context for screen reader focus."
        ]
    },
    "color-contrast": {
        "explanation": "Text color contrast ratio is below the WCAG AA minimum threshold (4.5:1 for standard text, 3:1 for large text). Users with low vision or color blindness cannot read the text comfortably.",
        "why_it_matters": "Sufficient color contrast ensures legibility across different lighting conditions and visual abilities.",
        "generate_fix": lambda html, node: (
            html.replace('style="', 'style="color: #111827; background-color: #FFFFFF; ') if 'style="' in html
            else f'<span style="color: #0F172A; background-color: #FFFFFF; font-weight: 500;">{html}</span>'
        ),
        "steps": [
            "Increased text contrast ratio to exceed WCAG 2.1 AA standard (min 4.5:1).",
            "Adjusted foreground text color to `#0F172A` against light background `#FFFFFF`."
        ]
    },
    "link-name": {
        "explanation": "Links must have discernible text. Generic text like 'click here', 'read more', or empty icon links break context when screen reader users navigate using a links list.",
        "why_it_matters": "Screen reader users jump between links out of context. Distinct link text makes destination purpose clear.",
        "generate_fix": lambda html, node: (
            html.replace("<a>", '<a aria-label="Read full report article">')
            .replace('href="#"', 'href="/target-page" aria-label="Detailed information page"')
            if "<a" in html else '<a href="#" aria-label="Navigate to destination">Learn more about our services</a>'
        ),
        "steps": [
            "Added descriptive link text or `aria-label` describing the link target destination.",
            "Avoided ambiguous link names."
        ]
    },
    "document-title": {
        "explanation": "The document lacks a `<title>` element or title is empty. Page titles are the first item announced by screen readers when navigating pages or browser tabs.",
        "why_it_matters": "Allows users to quickly identify page content without reading the entire document body.",
        "generate_fix": lambda html, node: "<head>\n  <title>Dashboard & Audit Report - AI Accessibility Auditor</title>\n</head>",
        "steps": [
            "Added a concise, meaningful `<title>` tag inside the `<head>` block."
        ]
    },
    "html-has-lang": {
        "explanation": "The `<html>` element does not specify a valid `lang` attribute. Screen readers cannot choose the correct pronunciation engine, resulting in garbled text playback.",
        "why_it_matters": "Enables text-to-speech synthesizers to pronounce words correctly according to natural language rules.",
        "generate_fix": lambda html, node: '<html lang="en">',
        "steps": [
            "Added `lang=\"en\"` to the top-level `<html>` element."
        ]
    }
}

def generate_ai_fix(violation: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Generates plain-English explanation, real-world impact, and corrected HTML snippet
    using LLM API (Anthropic / Gemini / OpenAI) with intelligent rule fallback.
    """
    rule_id = violation.get("rule_id", "")
    html_snippet = violation.get("html_snippet", "")
    impact = violation.get("impact", "moderate")
    failure_summary = violation.get("failure_summary", "")
    help_text = violation.get("help", "")

    # Check environment variables for API keys if not explicitly passed
    anthropic_key = api_key or os.getenv("ANTHROPIC_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # If Anthropic key present, call Anthropic Claude API
    if anthropic_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=anthropic_key)
            prompt = f"""You are a WCAG 2.1 accessibility specialist. Fix the following accessibility violation:
Rule ID: {rule_id}
Severity: {impact}
Failure Details: {failure_summary}
Help: {help_text}
Broken HTML Snippet:
{html_snippet}

Respond strictly in valid JSON format:
{{
  "plain_english_explanation": "2-3 sentences explanation of why this breaks accessibility",
  "why_it_matters": "1-2 sentences on screen reader / assistive technology impact",
  "corrected_code": "Exact corrected production HTML snippet",
  "remediation_steps": ["Step 1", "Step 2"]
}}"""
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response.content[0].text
            parsed = json.loads(content[content.find('{'):content.rfind('}')+1])
            return parsed
        except Exception as e:
            logger.warning(f"Anthropic API call failed: {e}. Falling back to rule generator.")

    # If Gemini API key present
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            prompt_text = f"""Fix WCAG violation:
Rule: {rule_id}
Snippet: {html_snippet}
Failure: {failure_summary}
Return JSON with keys: plain_english_explanation, why_it_matters, corrected_code, remediation_steps."""
            res = requests.post(url, json={"contents": [{"parts": [{"text": prompt_text}]}]}, timeout=10)
            if res.status_code == 200:
                raw_txt = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_txt[raw_txt.find('{'):raw_txt.rfind('}')+1])
                return parsed
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Falling back to rule generator.")

    # If OpenAI API key present
    if openai_key:
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            prompt = f"Fix WCAG violation rule '{rule_id}' in HTML snippet '{html_snippet}'. Return JSON keys: plain_english_explanation, why_it_matters, corrected_code, remediation_steps."
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(resp.choices[0].message.content)
        except Exception as e:
            logger.warning(f"OpenAI API call failed: {e}. Falling back to rule generator.")

    # Intelligent Fallback Generator
    fallback_info = RULE_FALLBACKS.get(rule_id)
    if fallback_info:
        corrected_code = fallback_info["generate_fix"](html_snippet, violation)
        return {
            "plain_english_explanation": fallback_info["explanation"],
            "why_it_matters": fallback_info["why_it_matters"],
            "corrected_code": corrected_code,
            "remediation_steps": fallback_info["steps"]
        }
        
    # Generic rule fallback
    clean_snippet = html_snippet if html_snippet else "<!-- Element selector: " + violation.get("target_selector", "") + " -->"
    corrected_code = clean_snippet
    if "<img" in clean_snippet and "alt=" not in clean_snippet:
        corrected_code = clean_snippet.replace("<img", '<img alt="Accessible image description"')
    elif "<a" in clean_snippet and "aria-label=" not in clean_snippet:
        corrected_code = clean_snippet.replace("<a", '<a aria-label="Accessible link description"')
    elif "<button" in clean_snippet and "aria-label=" not in clean_snippet:
        corrected_code = clean_snippet.replace("<button", '<button aria-label="Accessible button action"')
    else:
        corrected_code = f'<!-- Remediation for {rule_id} -->\n' + clean_snippet

    return {
        "plain_english_explanation": f"The element flagged for rule '{rule_id}' violates WCAG guidelines ({help_text}). It prevents assistive technology from correctly interpreting page structure.",
        "why_it_matters": "Users relying on screen readers or keyboard navigation encounter barriers when interacting with this component.",
        "corrected_code": corrected_code,
        "remediation_steps": [
            f"Review WCAG specification for `{rule_id}`.",
            "Apply accessible markup attributes and ensure proper semantic HTML nesting."
        ]
    }
