import os
import re
import unicodedata
from typing import Dict, List
from docx import Document
from PyPDF2 import PdfReader
from pdfminer.high_level import extract_text as extract_pdf_text

class CVParser:
    """
    A class to parse CVs in various formats (PDF, DOCX) and extract text and sections.
    """

    def __init__(self):
        # Canonical section aliases (English + French).
        # Matching is done on normalized text without accents.
        self.section_aliases = {
            "experience": {
                "experience", "professional experience", "work experience", "employment history",
                "work history", "career history", "expériences", "experience professionnelle",
                "parcours professionnel"
            },
            "education": {
                "education", "academic background", "academic history", "qualifications",
                "formation", "education et formation", "diplomes", "etudes"
            },
            "skills": {
                "skills", "technical skills", "core competencies", "competencies",
                "expertise", "tech stack", "stack", "competences", "aptitudes", "savoir faire"
            },
            "summary": {
                "summary", "professional summary", "objective", "career objective", "profile",
                "professional profile", "about me", "resume summary", "profil", "objectif", "resume"
            },
            "projects": {
                "projects", "personal projects", "key projects", "selected projects",
                "portfolio", "projets", "realisations"
            },
            "awards": {
                "awards", "honors", "achievements", "recognitions", "prix", "recompenses", "distinctions"
            },
            "certifications": {
                "certifications", "certificates", "licenses", "courses", "training",
                "formations", "certificats"
            },
            "contact": {
                "contact", "contact details", "personal information", "coordonnees", "informations personnelles"
            },
        }

    def _normalize(self, value: str) -> str:
        norm = unicodedata.normalize("NFD", value or "")
        norm = "".join(ch for ch in norm if unicodedata.category(ch) != "Mn")
        norm = re.sub(r"[^a-zA-Z0-9\s]", " ", norm.lower())
        return re.sub(r"\s+", " ", norm).strip()

    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        return (
            text.replace("\u200b", " ")
            .replace("â€‹", " ")
            .replace("â€™", "'")
            .replace("â€œ", '"')
            .replace("â€", '"')
            .replace("â€“", "-")
            .replace("\r", "\n")
        )

    def _is_header_candidate(self, line: str) -> bool:
        if not line:
            return False
        if len(line) > 60:
            return False
        # Header lines are typically short and have few separators.
        return line.count(",") <= 1 and line.count(".") <= 1 and line.count(":") <= 2

    def _match_section_name(self, line: str) -> str:
        normalized = self._normalize(line)
        if not normalized:
            return ""
        for section_name, aliases in self.section_aliases.items():
            for alias in aliases:
                # strict equality or startswith to avoid false positives in paragraph lines
                if normalized == alias or normalized.startswith(f"{alias} "):
                    return section_name
        return ""

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extracts text from a PDF file."""
        try:
            # Try pdfminer first for better text extraction
            text = extract_pdf_text(file_path)
            if not text.strip():
                # Fallback to PyPDF2 if pdfminer fails or returns empty
                reader = PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def extract_text_from_docx(self, file_path: str) -> str:
        """Extracts text from a DOCX file."""
        try:
            doc = Document(file_path)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return ""

    def extract_text(self, file_path: str) -> str:
        """Extracts text based on file extension."""
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        if ext == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif ext == ".docx":
            return self.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def identify_sections(self, text: str) -> Dict[str, str]:
        """Identifies and extracts sections from the CV text."""
        sections = {}
        lines = self._clean_text(text).split("\n")
        current_section = "unknown"
        section_content = []

        # First pass: detect section headers with normalized aliases
        for line in lines:
            line_stripped = line.strip(" \t:-|")
            if not line_stripped:
                continue

            found_section = False
            if self._is_header_candidate(line_stripped):
                matched_section = self._match_section_name(line_stripped)
                if matched_section:
                    if current_section != "unknown" and section_content:
                        sections[current_section] = "\n".join(section_content).strip()
                    current_section = matched_section
                    section_content = []
                    found_section = True

            if not found_section:
                section_content.append(line_stripped)

        # Save the last section
        if current_section != "unknown" and section_content:
            sections[current_section] = "\n".join(section_content).strip()

        # Second pass: if sections are sparse, recover by keyword-based slicing.
        if not sections:
            norm_lines = [self._normalize(line) for line in lines]

            def slice_from_keywords(target: str, keywords: List[str], span: int) -> None:
                for i, norm_line in enumerate(norm_lines):
                    if any(kw in norm_line for kw in keywords):
                        content = [line for line in lines[i:i + span] if line.strip()]
                        if content:
                            sections[target] = "\n".join(content).strip()
                        return

            slice_from_keywords(
                "experience",
                ["experience", "work", "emploi", "professionnel", "developer", "engineer", "manager"],
                12,
            )
            slice_from_keywords(
                "skills",
                ["skills", "competences", "stack", "technologies", "outils", "langages"],
                10,
            )
            slice_from_keywords(
                "education",
                ["education", "formation", "diplome", "universite", "school", "master", "licence", "bachelor"],
                8,
            )
            slice_from_keywords(
                "summary",
                ["summary", "profile", "objective", "profil", "objectif", "about"],
                6,
            )

        return sections

if __name__ == "__main__":
    # Basic test
    parser = CVParser()
    # This is just a placeholder for testing
    test_text = """
    John Doe
    Contact: john.doe@example.com
    
    Summary
    Experienced software engineer with a passion for building scalable applications.
    
    Experience
    Software Engineer at Tech Corp (2020-Present)
    - Led a team of 5 developers.
    - Increased system performance by 30%.
    
    Education
    BS in Computer Science, University of Technology (2016-2020)
    
    Skills
    Python, Java, SQL, AWS
    """
    sections = parser.identify_sections(test_text)
    for name, content in sections.items():
        print(f"--- {name.upper()} ---")
        print(content)
        print()
