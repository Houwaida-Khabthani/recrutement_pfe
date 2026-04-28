import { useState } from 'react';
import { Mic, Video, Brain, CheckCircle, ChevronRight, Star, Clock, Play, Calendar, MapPin, Building } from 'lucide-react';
import { useGetInterviewsQuery } from '../../store/api/interviewApi';

const categories = [
  { id: 'behavioral', label: 'Behavioral', icon: Brain, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', questions: 12 },
  { id: 'technical', label: 'Technical', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', questions: 18 },
  { id: 'situational', label: 'Situational', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', questions: 10 },
  { id: 'hr', label: 'HR Questions', icon: Mic, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', questions: 8 },
];

const sampleQuestions: Record<string, string[]> = {
  behavioral: [
    'Tell me about a time you demonstrated leadership under pressure.',
    'Describe a situation where you had to adapt to a sudden change.',
    'Give an example of how you handled a conflict within a team.',
    'Tell me about your biggest professional failure and what you learned.',
    'Describe a time when you had to work with a difficult colleague.',
    'Tell me about a project where you exceeded expectations.',
    'Describe a time you had to meet a tight deadline.',
    'Tell me about a time you took initiative to improve a process.',
    'Describe a situation where you had to learn something new quickly.',
    'Tell me about a time you received constructive criticism.',
    'Describe a situation where you had to prioritize multiple tasks.',
    'Tell me about a time you helped a colleague succeed.',
  ],
  technical: [
    'Explain the difference between REST and GraphQL APIs.',
    'What is the virtual DOM and how does React use it?',
    'How would you design a scalable microservices architecture?',
    'Walk me through how you would debug a production issue.',
    'Explain the concept of asynchronous programming.',
    'What is the difference between SQL and NoSQL databases?',
    'How would you optimize a slow database query?',
    'Describe your approach to version control and git workflows.',
    'What design patterns are you familiar with?',
    'Explain the concept of dependency injection.',
    'How would you implement caching in your application?',
    'What is the framework you\'re most comfortable with and why?',
    'Explain how you would secure an API.',
    'Describe your testing strategy.',
    'What is your experience with cloud platforms?',
    'How would you approach refactoring legacy code?',
    'Explain containerization and Docker.',
    'What CI/CD tools have you used?',
  ],
  situational: [
    'How would you handle a client demanding an unrealistic deadline?',
    'What would you do if you disagreed with your manager\'s decision?',
    'How would you prioritize tasks when everything is urgent?',
    'Describe how you would handle a sudden team member departure mid-project.',
    'What would you do if you discovered a major bug right before release?',
    'How would you handle performance issues in production?',
    'What would you do if a colleague was underperforming?',
    'How would you approach learning a new technology you\'ve never used?',
    'What would you do if you made a mistake that affected the team?',
    'How would you handle working with a remote team?',
  ],
  hr: [
    'Where do you see yourself in 5 years?',
    'Why do you want to work for our company?',
    'What are your salary expectations?',
    'Why are you leaving your current position?',
    'What are your greatest strengths?',
    'What are your weaknesses and how do you address them?',
    'Tell us about a time you faced a challenge at work.',
    'How do you handle work-life balance?',
  ],
};

const tips = [
  { label: 'Use STAR method', desc: 'Situation, Task, Action, Result — structure all behavioral answers this way.' },
  { label: 'Prepare your questions', desc: 'Always have 3–5 smart questions ready to ask the interviewer.' },
  { label: 'Research the company', desc: 'Know the company\'s mission, recent news, and key products.' },
  { label: 'Practice out loud', desc: 'Your brain processes differently when you speak. Practice aloud, not just mentally.' },
];

const CandidateMockInterviews = () => {
  const { data: interviews = [] } = useGetInterviewsQuery(undefined);
  const [activeCategory, setActiveCategory] = useState('behavioral');
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  console.log('[MockInterviews] Interviews data:', interviews);
  console.log('[MockInterviews] Interviews length:', Array.isArray(interviews) ? interviews.length : 'not array');

  const questions = sampleQuestions[activeCategory] || [];

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-100';
      case 'passed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'failed': return 'bg-red-50 text-red-700 border-red-100';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl">

      {/* ── Header ── */}
      <div>
        <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
          <Mic className="w-3.5 h-3.5" /> Practice Mode
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Mock Interviews</h1>
        <p className="text-slate-400 font-medium text-base mt-1">Sharpen your answers and ace your next interview with AI-powered practice.</p>
      </div>

      {/* ── Your Interviews Section ── */}
      {Array.isArray(interviews) && interviews.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-transparent">
            <h2 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Your Scheduled Interviews
            </h2>
            <p className="text-slate-400 text-xs font-bold mt-0.5">{interviews.length} interview{interviews.length !== 1 ? 's' : ''} scheduled</p>
          </div>
          <div className="divide-y divide-slate-50">
            {interviews.map((interview: any, idx: number) => (
              <div key={idx} className="p-6 hover:bg-slate-50/50 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Round {interview.step}</p>
                    <p className="font-bold text-slate-900 text-sm">{interview.jobTitle || 'Interview'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled</p>
                      <p className="font-bold text-slate-700 text-sm">{new Date(interview.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                      <p className="font-bold text-slate-700 text-sm">{interview.location?.includes('http') ? 'Online' : interview.location || 'TBD'}</p>
                    </div>
                  </div>
                  <div>
                    <p className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[4px] mb-3">Pro Feature</p>
            <h2 className="text-2xl font-black tracking-tighter mb-2">Live AI Video Interview Simulation</h2>
            <p className="text-white/50 font-medium max-w-md">Practice with a real-time AI interviewer that adapts to your responses and gives detailed feedback.</p>
          </div>
          <button className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-indigo-900 hover:-translate-y-1 hover:bg-indigo-500 transition-all active:scale-95">
            <Video className="w-5 h-5" /> Start Live Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Questions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category selection */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">Practice by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setActiveQuestion(null); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${activeCategory === cat.id ? `${cat.bg} ${cat.border}` : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-10 h-10 ${cat.bg} rounded-xl flex items-center justify-center`}>
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-black ${activeCategory === cat.id ? cat.color : 'text-slate-700'}`}>{cat.label}</p>
                    <p className="text-[9px] font-bold text-slate-400">{cat.questions} questions</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Questions list */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900 tracking-tight">
                {categories.find(c => c.id === activeCategory)?.label} Questions
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-0.5">Click a question to practice answering it</p>
            </div>
            <div className="divide-y divide-slate-50">
              {questions.map((q, i) => (
                <div key={i}>
                  <button
                    className="w-full text-left px-6 py-5 hover:bg-slate-50/50 transition-all group"
                    onClick={() => setActiveQuestion(activeQuestion === i ? null : i)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 flex-shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">{q}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-300 flex-shrink-0 transition-transform ${activeQuestion === i ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {activeQuestion === i && (
                    <div className="mx-6 mb-5 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">💡 How to Answer</p>
                      <div className="space-y-2">
                        <p className="text-indigo-800 text-sm font-medium">Use the <strong>STAR method</strong>:</p>
                        {['Situation — Set the context', 'Task — Describe what was needed', 'Action — Explain what you did', 'Result — Share the outcome'].map((step) => (
                          <div key={step} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span className="text-indigo-700 text-xs font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:-translate-y-0.5 transition-all">
                        <Play className="w-3 h-3" /> Practice This Question
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tips + Stats */}
        <div className="space-y-5">
          {/* Interview tips */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-5">Interview Success Tips</h3>
            <div className="space-y-5">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-xs mb-1">{tip.label}</p>
                    <p className="text-white/40 text-xs font-medium leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation checklist */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-sm mb-4">Pre-Interview Checklist</h3>
            <div className="space-y-3">
              {[
                { task: 'Research the company', done: true },
                { task: 'Review job description', done: true },
                { task: 'Prepare STAR answers', done: false },
                { task: 'Practice common questions', done: false },
                { task: 'Prepare your questions', done: false },
                { task: 'Test tech setup (video)', done: false },
              ].map(({ task, done }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                    {done && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm font-medium ${done ? 'line-through text-slate-300' : 'text-slate-600'}`}>{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule mock */}
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[3px] mb-3">Ready to Practice?</p>
            <p className="text-white font-black text-lg tracking-tight mb-4">Schedule a 1-on-1 mock interview session</p>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-700 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg">
              <Clock className="w-4 h-4" /> Book a Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateMockInterviews;