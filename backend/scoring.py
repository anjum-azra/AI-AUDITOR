from typing import List, Dict, Any

def calculate_score_and_grade(violations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes an accessibility score from 0 to 100 and estimates WCAG conformance grade.
    """
    severity_counts = {
        "critical": 0,
        "serious": 0,
        "moderate": 0,
        "minor": 0
    }
    
    total_impact_penalty = 0
    weights = {
        "critical": 15,
        "serious": 8,
        "moderate": 3,
        "minor": 1
    }
    
    for v in violations:
        impact = (v.get("impact") or "moderate").lower()
        if impact in severity_counts:
            severity_counts[impact] += 1
            total_impact_penalty += weights[impact]
        else:
            severity_counts["moderate"] += 1
            total_impact_penalty += weights["moderate"]

    # Calculate raw score (100 base)
    score = max(0, 100 - total_impact_penalty)
    
    # Estimate WCAG Conformance Grade based on severity & score
    if severity_counts["critical"] == 0 and severity_counts["serious"] == 0 and score >= 95:
        grade = "AAA"
        grade_label = "WCAG 2.1 AAA (Excellent)"
    elif severity_counts["critical"] == 0 and score >= 85:
        grade = "AA"
        grade_label = "WCAG 2.1 AA (Compliant)"
    elif score >= 70:
        grade = "A"
        grade_label = "WCAG 2.1 A (Basic Compliance)"
    else:
        grade = "F"
        grade_label = "Non-Compliant (Requires Remediation)"
        
    return {
        "score": score,
        "grade": grade,
        "grade_label": grade_label,
        "severity_counts": severity_counts,
        "total_violations": len(violations)
    }
