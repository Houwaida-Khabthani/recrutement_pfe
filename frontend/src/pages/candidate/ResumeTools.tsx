import { useState } from 'react';
import { Upload, FileText, Zap, CheckCircle, AlertCircle, Download, Sparkles, Loader, BarChart3 } from 'lucide-react';
import { useParseCVMutation } from '../../store/api/candidateApi';

const CandidateResumeTools = () => {
  const [parseCV, { isLoading: parsing }] = useParseCVMutation();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    setCvFile(file);
    setParsedData(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!cvFile) return;
    const formData = new FormData();
    formData.append('cv', cvFile);
    try {
      const result = await parseCV(formData).unwrap();
      setParsedData(result);
    } catch (e) {
      console.error(e);
    }
  };

  const score = parsedData?.score ?? null;
  const scoreColor = score !== null ? (score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600') : '';
  const scoreBar = score !== null ? (score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500') : 'bg-slate-300';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl">

      {/* ── Header ── */}
      <div>
        <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> AI Powered
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Resume Tools</h1>
        <p className="text-slate-400 font-medium text-base mt-1">Upload your CV for AI analysis, scoring, and improvement tips.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Upload Zone ── */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" /> Upload Your CV
            </h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cv-input')?.click()}
              className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${dragOver ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' : cvFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
            >
              {cvFile ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-black text-emerald-700 text-lg">{cvFile.name}</p>
                  <p className="text-emerald-500 text-sm font-bold mt-1">{(cvFile.size / 1024).toFixed(1)} KB · Click to replace</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="font-black text-slate-700 text-lg mb-1">Drop your CV here</p>
                  <p className="text-slate-400 text-sm font-medium">or click to browse · PDF, DOCX</p>
                </>
              )}
              <input id="cv-input" type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            {cvFile && (
              <button
                onClick={handleAnalyze}
                disabled={parsing}
                className="w-full mt-5 flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:-translate-y-0.5 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
              >
                {parsing ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Analyze My CV</>
                )}
              </button>
            )}
          </div>

          {/* ── Resume Example ── */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Resume Example
              </h2>
              <a
                href="/resume-example.txt"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-slate-800 transition-all"
              >
                <Download className="w-4 h-4" /> Download Example
              </a>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
              <p className="font-black text-slate-900 mb-2">Recommended CV structure:</p>
              <p><span className="font-bold">1.</span> Header: Full name, email, phone, LinkedIn, GitHub/Portfolio</p>
              <p><span className="font-bold">2.</span> Professional Summary: 2-3 lines focused on your value</p>
              <p><span className="font-bold">3.</span> Skills: Technical + tools + soft skills</p>
              <p><span className="font-bold">4.</span> Experience: Results with numbers and impact</p>
              <p><span className="font-bold">5.</span> Education + Certifications + Projects</p>
            </div>
          </div>

          {/* ── Analysis Results ── */}
          {parsedData && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" /> Analysis Results
              </h2>

              {/* Score */}
              {score !== null && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">CV Score</p>
                    <span className={`text-4xl font-black ${scoreColor}`}>{score}/100</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${scoreBar} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
                  </div>
                  <p className="mt-3 text-slate-400 text-xs font-bold">
                    {score >= 80 ? '🎉 Excellent CV! You\'re in the top tier.' : score >= 60 ? '👍 Good CV but there\'s room for improvement.' : '⚠️ Your CV needs significant improvements.'}
                  </p>
                </div>
              )}

              {/* Extracted data */}
              {parsedData && parsedData.name && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Name', value: parsedData.name },
                    { label: 'Email', value: parsedData.email },
                    { label: 'Phone', value: parsedData.phone || 'Not found' },
                    { label: 'Skills Found', value: parsedData.skills?.length ? `${parsedData.skills.length} skills` : 'N/A' },
                    { label: 'Years of Experience', value: parsedData.years_of_experience || 'N/A' },
                    { label: 'LinkedIn', value: parsedData.linkedin || 'Not found' },
                    { label: 'GitHub', value: parsedData.github || 'Not found' },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="font-bold text-slate-700 text-sm">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              )}

              {parsedData?.experience && (
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience Summary</p>
                  <p className="font-bold text-slate-700 text-sm">{parsedData.experience}</p>
                </div>
              )}

              {parsedData?.sections_found?.length > 0 && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Sections Detected</p>
                  <p className="text-xs font-bold text-indigo-700">{parsedData.sections_found.join(', ')}</p>
                </div>
              )}

              {/* Tips from AI */}
              {parsedData.suggestions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4">AI Suggestions</p>
                  <div className="space-y-3">
                    {parsedData.suggestions.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-amber-800 text-sm font-medium">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — Tips + Download template */}
        <div className="space-y-5">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[4px] mb-5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Pro Tips
            </h3>
            <div className="space-y-4">
              {(parsedData?.pro_tips ? Object.entries(parsedData.pro_tips) : []).map(([category, text], index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{category}</p>
                    <p className="text-white/70 text-xs font-medium leading-relaxed">{String(text)}</p>
                  </div>
                </div>
              ))}
              {!parsedData?.pro_tips && (
                <p className="text-white/60 text-xs font-medium">
                  Upload and analyze your CV to get personalized AI tips.
                </p>
              )}
            </div>
          </div>

          {/* ATS check */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-1">ATS Compatibility</h3>
            <p className="text-slate-400 text-xs font-medium mb-4">Is your CV readable by automated tracking systems?</p>
            <div className="space-y-3">
              {parsedData?.ats_compatibility ? (
                Object.entries(parsedData.ats_compatibility).map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-500">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-slate-700">{value.score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${value.score}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs font-medium">
                  Analyze your CV to see real ATS scores.
                </p>
              )}
            </div>
          </div>

          {/* Download template */}
          <a
            href="/resume-example.txt"
            download
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Resume Example
          </a>
        </div>
      </div>
    </div>
  );
};

export default CandidateResumeTools;