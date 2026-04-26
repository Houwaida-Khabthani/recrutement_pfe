# AI Model Architecture for CV Analysis

This document outlines the architecture for the AI model designed to analyze CVs, provide scores, improvement tips, and assess ATS compatibility. The system will be composed of several interconnected modules, each responsible for a specific aspect of the CV analysis.

## 1. CV Parsing and Text Extraction Module

This module is responsible for ingesting various CV formats (PDF, DOC, DOCX) and extracting raw text content. It will also identify and structure key sections of the CV.

### Components:
*   **File Handler:** Detects file type and routes to appropriate parser.
*   **PDF Parser:** Extracts text from PDF documents.
*   **DOC/DOCX Parser:** Extracts text from Word documents.
*   **Section Extractor:** Identifies common CV sections (e.g., Experience, Education, Skills, Summary/Objective, Projects, Awards, Certifications, Contact Information) using rule-based patterns and potentially machine learning models for more complex layouts.

## 2. Natural Language Processing (NLP) Module

This module processes the extracted text to derive meaningful insights, identify keywords, and assess language quality.

### Components:
*   **Text Cleaner:** Removes noise, special characters, and performs basic normalization.
*   **Tokenization and Lemmatization:** Breaks down text into words and reduces them to their base forms.
*   **Named Entity Recognition (NER):** Identifies entities like company names, job titles, dates, and locations.
*   **Keyword Extractor:** Identifies important keywords and phrases, potentially comparing them against a database of common job-related terms or job description keywords (if provided).
*   **Action Verb Detector:** Identifies and scores the usage of strong action verbs.
*   **Quantifiable Achievement Detector:** Identifies phrases indicating quantifiable achievements (e.g., 
"Increased by X%", "Reduced by Y").

## 3. Scoring and Feedback Generation Module

This module takes the processed information and generates scores, improvement tips, and ATS compatibility assessments.

### Components:
*   **Overall Score Calculator:** Combines scores from various sub-modules (language, impact, format, ATS) to produce a single overall score.
*   **Language Analyzer:** Scores the usage of action verbs, clarity, and conciseness. Provides tips for improvement.
*   **Impact Analyzer:** Scores the presence and quantification of achievements. Provides tips for quantifying impact.
*   **Format Analyzer:** Assesses CV length, consistency in formatting (e.g., font usage, heading styles), and readability. Provides tips for optimal formatting.
*   **ATS Compatibility Assessor:**
    *   **Simple Formatting Check:** Evaluates the simplicity and standard adherence of the CV's layout.
    *   **Keyword Density Check:** Compares extracted keywords against a general database of common job-related terms or, ideally, against keywords from a provided job description. Scores keyword relevance and density.
    *   **Section Clarity Check:** Verifies the clear demarcation and labeling of CV sections.
*   **Tip Generator:** Formulates actionable improvement tips based on the analysis results, categorized by areas like Language, Impact, Format, ATS Optimization, Design, and Presence.

## 4. API Layer (FastAPI)

This layer will expose the functionality of the AI model as a RESTful API, allowing the frontend to interact with the backend.

### Components:
*   **Endpoint Definition:** Defines the `/analyze-cv` endpoint with `POST` method.
*   **Request Handler:** Validates incoming CV files, passes them to the CV Parsing module.
*   **Response Formatter:** Structures the analysis results into the defined JSON format for the frontend.

## Data Flow:

1.  User uploads CV via frontend.
2.  Frontend sends CV file to `/analyze-cv` endpoint.
3.  API Layer receives file and passes to CV Parsing Module.
4.  CV Parsing Module extracts text and structures sections.
5.  NLP Module processes text for keywords, action verbs, quantifiable achievements.
6.  Scoring and Feedback Generation Module calculates scores and generates tips.
7.  API Layer formats the results and sends them back to the frontend.

## Technologies:

*   **Backend Framework:** FastAPI (Python)
*   **CV Parsing:** `python-docx` for DOCX, `PyPDF2` or `pdfminer.six` for PDF.
*   **NLP:** `spaCy`, `NLTK`, or custom models for specific tasks.
*   **Machine Learning (Optional):** For advanced section extraction or keyword matching, `scikit-learn` or `Hugging Face Transformers` could be used.
