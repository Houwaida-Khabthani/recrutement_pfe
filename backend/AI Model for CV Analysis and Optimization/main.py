import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from cv_parser import CVParser
from cv_analyzer import CVAnalyzer

app = FastAPI(title="CV Analysis Service", description="AI-powered CV analysis and scoring API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CV parser and analyzer
parser = CVParser()
analyzer = CVAnalyzer()

# Directory to temporarily store uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze-cv")
async def analyze_cv_endpoint(file: UploadFile = File(...)):
    """
    Analyzes an uploaded CV and returns scores, tips, and ATS compatibility.
    """
    # 1. Validate file format
    filename = file.filename
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF and DOCX are supported.")
    
    # 2. Save file temporarily
    file_path = os.path.join(UPLOAD_DIR, filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 3. Extract text and sections
        text = parser.extract_text(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the file. Please ensure it's not an image-only PDF.")
            
        print(f"Extracted text length: {len(text)}")
        print(f"First 500 chars: {text[:500]}")
        
        sections = parser.identify_sections(text)
        print(f"Identified sections: {list(sections.keys())}")
        for section_name, content in sections.items():
            print(f"{section_name}: {content[:200]}...")
        
        # 4. Perform AI analysis
        analysis_results = analyzer.analyze_cv(text, sections)
        
        print(f"Analysis score: {analysis_results['overall_score']}")
        print(f"Improvement tips: {len(analysis_results['improvement_tips'])}")
        
        # 5. Return analysis with sections
        return {
            **analysis_results,
            "sections": sections,
            "extracted_text": text[:6000]  # Provide enough content for downstream extraction
        }
        
    except Exception as e:
        print(f"Error during CV analysis: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during CV processing: {str(e)}")
    finally:
        # 5. Clean up: remove the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get("/")
async def root():
    return {"message": "CV Analysis Service is running. Use POST /analyze-cv to analyze your CV."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
