import spacy
import re
import unicodedata
from typing import Dict, List, Any

class CVAnalyzer:
    """
    A class to analyze CV text, score it, and provide improvement tips.
    """

    def __init__(self):
        # Load spaCy model for NLP tasks
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback when spaCy model is unavailable
            self.nlp = None

        # Define common action verbs for scoring (English and French)
        self.action_verbs = {
            # English
            "led", "managed", "developed", "built", "increased", "decreased", "improved",
            "designed", "implemented", "coordinated", "collaborated", "achieved",
            "delivered", "launched", "optimized", "streamlined", "spearheaded",
            "mentored", "trained", "negotiated", "presented", "wrote", "created",
            # French
            "dirigé", "géré", "développé", "construit", "augmenté", "diminué", "amélioré",
            "conçu", "implémenté", "coordonné", "collaboré", "réalisé", "accompli",
            "livré", "lancé", "optimisé", "rationalisé", "mené", "formé", "négocié",
            "présenté", "rédigé", "créé", "organisé", "supervisé"
        }

        # Define common CV keywords for ATS check (English and French)
        self.common_keywords = {
            # English
            "python", "java", "javascript", "sql", "aws", "docker", "kubernetes",
            "agile", "scrum", "project management", "leadership", "communication",
            "problem solving", "analytical", "teamwork", "git", "ci/cd", "rest api",
            "machine learning", "data analysis", "cloud computing", "devops",
            # French
            "python", "java", "javascript", "sql", "aws", "docker", "kubernetes",
            "agile", "scrum", "gestion de projet", "leadership", "communication",
            "résolution de problèmes", "analytique", "travail d'équipe", "git", "ci/cd", "api rest",
            "apprentissage automatique", "analyse de données", "informatique en nuage", "devops"
        }

    def _normalize(self, value: str) -> str:
        norm = unicodedata.normalize("NFD", value or "")
        norm = "".join(ch for ch in norm if unicodedata.category(ch) != "Mn")
        norm = re.sub(r"[^a-zA-Z0-9\s/+.-]", " ", norm.lower())
        return re.sub(r"\s+", " ", norm).strip()

    def analyze_language(self, text: str) -> Dict[str, Any]:
        """Analyzes the language quality of the CV."""
        text_norm = self._normalize(text)

        if self.nlp:
            doc = self.nlp(text.lower())
            verbs = [token.text.lower() for token in doc if token.pos_ == "VERB"]
            strong_verbs = [v for v in verbs if v in self.action_verbs]
        else:
            tokens = re.findall(r"\b[a-zA-ZÀ-ÿ'-]+\b", text_norm)
            strong_verbs = [t for t in tokens if t in self.action_verbs]
        
        score = min(100, len(set(strong_verbs)) * 8)  # Reward diversity of action verbs
        
        tips = []
        if score < 70:
            tips.append({
                "category": "Language",
                "tip": "Use more strong action verbs like 'Led', 'Built', 'Increased', 'Designed' to describe your achievements."
            })
        
        return {"score": score, "tips": tips, "strong_verbs_count": len(strong_verbs)}

    def analyze_impact(self, text: str) -> Dict[str, Any]:
        """Analyzes the impact and quantification of achievements."""
        # Look for numbers and percentages
        percentages = re.findall(r'\b\d{1,3}\s?%', text)
        currencies = re.findall(r'(?:\$|€|£|dt|tnd)\s?\d[\d,\.]*', text, flags=re.IGNORECASE)
        plain_numbers = re.findall(r'\b\d+\b', text)
        
        score = min(100, (len(percentages) * 18) + (len(currencies) * 12) + (len(plain_numbers) * 2))
        
        tips = []
        if score < 60:
            tips.append({
                "category": "Impact",
                "tip": "Quantify your achievements where possible. For example, 'Reduced loading time by 40%' or 'Managed a budget of $50k'."
            })
            
        return {"score": score, "tips": tips, "quantifiers_count": len(percentages) + len(currencies) + len(plain_numbers)}

    def analyze_ats_compatibility(self, text: str, sections: Dict[str, str]) -> Dict[str, Any]:
        """Assesses ATS compatibility based on formatting, keywords, and section clarity."""
        text_lower = self._normalize(text)
        
        # 1. Simple Formatting Check (Simplified: check for complex characters or layout hints)
        # In a real scenario, this would involve checking the file structure more deeply.
        bullet_like = len(re.findall(r'[\u2022•\-\*]\s+\w+', text))
        long_lines = len([ln for ln in text.splitlines() if len(ln.strip()) > 180])
        simple_formatting_score = max(50, min(95, 90 + min(5, bullet_like) - min(25, long_lines)))
        
        # 2. Keyword Density Check
        found_keywords = [kw for kw in self.common_keywords if self._normalize(kw) in text_lower]
        keyword_density_score = min(100, int((len(set(found_keywords)) / len(self.common_keywords)) * 250))
        
        # 3. Section Clarity Check
        expected_sections = ["experience", "education", "skills", "summary"]
        found_sections = [s for s in expected_sections if s in sections]
        section_clarity_score = min(100, (len(found_sections) / len(expected_sections)) * 100)
        
        return {
            "simple_formatting": {
                "score": simple_formatting_score,
                "feedback": "Your CV uses clear and simple formatting, which is highly compatible with ATS."
            },
            "keyword_density": {
                "score": int(keyword_density_score),
                "feedback": f"Found {len(found_keywords)} relevant keywords. Consider adding more specific industry terms."
            },
            "section_clarity": {
                "score": int(section_clarity_score),
                "feedback": f"Identified {len(found_sections)} out of {len(expected_sections)} key sections clearly."
            }
        }

    def get_pro_tips(self) -> Dict[str, str]:
        """Returns standard pro tips for CV improvement."""
        return {
            "language": "Use strong action verbs: 'Led', 'Built', 'Increased', 'Designed'",
            "impact": "Quantify achievements: 'Reduced loading time by 40%'",
            "format": "Keep it to 1-2 pages maximum for best results",
            "ats_optimization": "Include relevant keywords from the job description",
            "design": "Use consistent formatting — one font family, clear hierarchy",
            "presence": "Add LinkedIn & GitHub links for technical roles"
        }

    def analyze_cv(self, text: str, sections: Dict[str, str]) -> Dict[str, Any]:
        """Performs a full analysis of the CV."""
        language_analysis = self.analyze_language(text)
        impact_analysis = self.analyze_impact(text)
        ats_analysis = self.analyze_ats_compatibility(text, sections)
        text_norm = self._normalize(text)
        
        # Weighted score gives more value to content quality and ATS readiness.
        overall_score = int(
            language_analysis["score"] * 0.20 +
            impact_analysis["score"] * 0.25 +
            ats_analysis["simple_formatting"]["score"] * 0.15 +
            ats_analysis["keyword_density"]["score"] * 0.20 +
            ats_analysis["section_clarity"]["score"] * 0.20
        )
        
        improvement_tips = language_analysis["tips"] + impact_analysis["tips"]
        if "linkedin.com" not in text_norm:
            improvement_tips.append({
                "category": "Presence",
                "tip": "Add your LinkedIn profile URL to strengthen your professional presence."
            })
        if "github.com" not in text_norm and "portfolio" not in text_norm:
            improvement_tips.append({
                "category": "Portfolio",
                "tip": "Include a GitHub or portfolio link to showcase projects and technical work."
            })
        if "experience" not in sections and "education" not in sections:
            improvement_tips.append({
                "category": "Structure",
                "tip": "Use clear section headers (Experience, Education, Skills) so ATS can parse your CV correctly."
            })
        
        return {
            "overall_score": overall_score,
            "improvement_tips": improvement_tips,
            "ats_compatibility": ats_analysis,
            "pro_tips": self.get_pro_tips()
        }

if __name__ == "__main__":
    # Basic test
    analyzer = CVAnalyzer()
    test_text = """
    John Doe
    Contact: john.doe@example.com
    
    Summary
    Experienced software engineer with a passion for building scalable applications.
    
    Experience
    Software Engineer at Tech Corp (2020-Present)
    - Led a team of 5 developers.
    - Increased system performance by 30%.
    - Developed new features using Python and AWS.
    
    Education
    BS in Computer Science, University of Technology (2016-2020)
    
    Skills
    Python, Java, SQL, AWS, Docker, Kubernetes
    """
    test_sections = {
        "summary": "Experienced software engineer with a passion for building scalable applications.",
        "experience": "Software Engineer at Tech Corp (2020-Present)\n- Led a team of 5 developers.\n- Increased system performance by 30%.\n- Developed new features using Python and AWS.",
        "education": "BS in Computer Science, University of Technology (2016-2020)",
        "skills": "Python, Java, SQL, AWS, Docker, Kubernetes"
    }
    
    results = analyzer.analyze_cv(test_text, test_sections)
    import json
    print(json.dumps(results, indent=2))
