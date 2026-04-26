# CV Analysis Service API Contract

## Endpoint: `/analyze-cv`

### Method: `POST`

### Description:
Analyzes an uploaded CV, providing a score, improvement tips, and ATS compatibility assessment.

### Request:

**Header:**
`Content-Type: multipart/form-data`

**Body:**
`file`: (File) The CV file to be analyzed. Supported formats: PDF, DOC, DOCX.

### Response:

**Status Code:** `200 OK`

**Body (JSON):**
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

**Status Code:** `400 Bad Request`

**Body (JSON):**
```json
{
  "detail": "Invalid file format. Only PDF, DOC, DOCX are supported."
}
```

**Status Code:** `500 Internal Server Error`

**Body (JSON):**
```json
{
  "detail": "An unexpected error occurred during CV processing."
}
```
