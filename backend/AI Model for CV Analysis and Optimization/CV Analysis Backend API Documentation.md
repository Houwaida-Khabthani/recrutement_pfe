d# CV Analysis Backend API Documentation

This document provides comprehensive documentation for the AI-powered CV analysis backend API. It covers the API contract, setup instructions, and details of the underlying AI model architecture.

## 1. API Contract

### Endpoint: `/analyze-cv`

This endpoint is used to upload a CV for analysis and receive a detailed assessment, including an overall score, improvement tips, and ATS compatibility metrics.

*   **Method:** `POST`
*   **Description:** Analyzes an uploaded CV, providing a score, improvement tips, and ATS compatibility assessment.

#### Request

*   **Header:** `Content-Type: multipart/form-data`
*   **Body:**
    *   `file`: (File) The CV file to be analyzed. Supported formats: PDF, DOC, DOCX.

#### Response

**Status Code: `200 OK`**

```json
{
  "overall_score": 85, // Overall score out of 100
  "improvement_tips": [
    {
      "category": "Language",
      "tip": "Use stronger action verbs. Consider replacing 'Responsible for' with 'Led' or 'Managed'."
    },
    {
      "category": "Impact",
      "tip": "Quantify achievements where possible. For example, 'Increased sales' could become 'Increased sales by 20% in Q3 2025'."
    }
  ],
  "ats_compatibility": {
    "simple_formatting": {
      "score": 90,
      "feedback": "Your CV uses clear and simple formatting, which is highly compatible with ATS."
    },
    "keyword_density": {
      "score": 75,
      "feedback": "Consider adding more relevant keywords from job descriptions to improve visibility."
    },
    "section_clarity": {
      "score": 85,
      "feedback": "Sections are generally well-defined, but ensure consistent headings throughout."
    }
  },
  "pro_tips": {
    "language": "Use strong action verbs: 'Led', 'Built', 'Increased', 'Designed'",
    "impact": "Quantify achievements: 'Reduced loading time by 40%'",
    "format": "Keep it to 1-2 pages maximum for best results",
    "ats_optimization": "Include relevant keywords from the job description",
    "design": "Use consistent formatting — one font family, clear hierarchy",
    "presence": "Add LinkedIn & GitHub links for technical roles"
  }
}
```

**Status Code: `400 Bad Request`**

```json
{
  "detail": "Invalid file format. Only PDF, DOC, DOCX are supported."
}
```

**Status Code: `500 Internal Server Error`**

```json
{
  "detail": "An unexpected error occurred during CV processing."
}
```

## 2. Setup and Installation

To set up and run the CV analysis backend, follow these steps:

### Prerequisites

*   Python 3.8+
*   `pip` (Python package installer)

### Installation

1.  **Clone the repository (if applicable):**
    ```bash
    # Assuming your project is in a git repository
    # git clone <your-repo-url>
    # cd <your-repo-name>
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: A `requirements.txt` file should be created containing `fastapi`, `uvicorn`, `python-multipart`, `python-docx`, `PyPDF2`, `pdfminer.six`, `spacy`, and `en_core_web_sm`.)*

3.  **Download spaCy language model:**
    ```bash
    python -m spacy download en_core_web_sm
    ```

### Running the Application

To start the FastAPI server, execute the following command from the project root directory:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be accessible at `http://localhost:8000`.

## 3. AI Model Architecture

The AI model for CV analysis is designed with a modular architecture, ensuring robust processing and accurate feedback generation. It comprises the following key modules:

### 3.1. CV Parsing and Text Extraction Module

This module handles the ingestion of various CV formats and the extraction of raw text content, along with the identification and structuring of key CV sections.

*   **File Handler:** Detects the file type (PDF, DOCX) and routes it to the appropriate parser.
*   **PDF Parser:** Extracts text from PDF documents using `pdfminer.six` with a fallback to `PyPDF2` for comprehensive coverage.
*   **DOC/DOCX Parser:** Extracts text from Word documents using the `python-docx` library.
*   **Section Extractor:** Identifies common CV sections such as Experience, Education, Skills, Summary/Objective, Projects, Awards, Certifications, and Contact Information using rule-based patterns and regular expressions.

### 3.2. Natural Language Processing (NLP) Module

This module processes the extracted text to derive meaningful insights, identify critical keywords, and assess the quality of language used.

*   **Text Cleaner:** Performs initial cleaning by removing noise, special characters, and normalizing the text.
*   **Tokenization and Lemmatization:** Breaks down text into individual words and reduces them to their base forms using `spaCy`.
*   **Named Entity Recognition (NER):** Identifies and categorizes entities like company names, job titles, dates, and locations.
*   **Keyword Extractor:** Identifies important keywords and phrases, comparing them against a predefined list of common job-related terms.
*   **Action Verb Detector:** Specifically identifies and scores the usage of strong action verbs, crucial for impactful CV writing.
*   **Quantifiable Achievement Detector:** Detects phrases that indicate quantifiable achievements (e.g., 
"Increased by X%", "Reduced by Y").

### 3.3. Scoring and Feedback Generation Module

This module integrates the processed information to generate comprehensive scores, actionable improvement tips, and a detailed ATS compatibility assessment.

*   **Overall Score Calculator:** Aggregates scores from various sub-modules (language, impact, format, ATS) to produce a single, holistic overall score for the CV.
*   **Language Analyzer:** Evaluates the usage of action verbs, clarity, and conciseness, providing targeted tips for linguistic enhancement.
*   **Impact Analyzer:** Assesses the presence and quantification of achievements, offering guidance on how to better articulate professional impact.
*   **Format Analyzer:** Examines CV length, consistency in formatting (e.g., font usage, heading styles), and overall readability, suggesting improvements for presentation.
*   **ATS Compatibility Assessor:**
    *   **Simple Formatting Check:** Evaluates the simplicity and standard adherence of the CV's layout, crucial for machine readability.
    *   **Keyword Density Check:** Compares extracted keywords against a general database of common job-related terms, providing feedback on keyword relevance and density.
    *   **Section Clarity Check:** Verifies the clear demarcation and consistent labeling of CV sections, ensuring easy navigation for ATS.
*   **Tip Generator:** Formulates specific, actionable improvement tips based on the analysis results, categorized by areas such as Language, Impact, Format, ATS Optimization, Design, and Professional Presence.

## 4. File Structure

```
. 
├── main.py             # FastAPI application entry point
├── cv_parser.py        # Module for CV text extraction and section identification
├── cv_analyzer.py      # Module for AI-powered CV analysis, scoring, and tip generation
├── requirements.txt    # Python dependencies
├── backend_documentation.md # This documentation file
└── uploads/            # Directory for temporary file storage
```

## 5. Usage Example

To use the API, send a `POST` request to `/analyze-cv` with your CV file. Below is an example using `curl`:

```bash
curl -X POST "http://localhost:8000/analyze-cv" -F "file=@/path/to/your/cv.docx"
```

Replace `/path/to/your/cv.docx` with the actual path to your CV file. The API will return a JSON object containing the analysis results.

## References

[1] FastAPI Documentation: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
[2] spaCy Documentation: [https://spacy.io/](https://spacy.io/)
[3] python-docx Documentation: [https://python-docx.readthedocs.io/](https://python-docx.readthedocs.io/)
[4] PyPDF2 Documentation: [https://pypdf2.readthedocs.io/](https://pypdf2.readthedocs.io/)
[5] PDFMiner.six Documentation: [https://pdfminersix.readthedocs.io/](https://pdfminersix.readthedocs.io/)
