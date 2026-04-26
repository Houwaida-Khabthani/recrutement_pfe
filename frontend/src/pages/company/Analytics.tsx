import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart as ReBarChart, Bar, Legend } from 'recharts';
import StatCard from '../../components/StatCard';
import { Users, Briefcase, Calendar, Award, BarChart, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useGetCompanyApplicationsQuery } from '../../store/api/applicationApi';
import { useGetMyJobsQuery } from '../../store/api/jobApi';

const CompanyAnalytics = () => {
  const { data: applications = [], isLoading: appsLoading } = useGetCompanyApplicationsQuery({});
  const { data: jobs = [], isLoading: jobsLoading } = useGetMyJobsQuery({});

  const isLoading = appsLoading || jobsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] italic text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold animate-pulse">Calculating Talent Intelligence...</p>
      </div>
    );
  }

  // --- DATA PROCESSING ENGINE ---
  
  // 1. KPI Metrics
  const totalCandidates = new Set(applications.map((a: any) => a.id_user)).size;
  const activeOffers = jobs.filter((j: any) => j.statut === 'OUVERT' || j.statut === 'Active').length;
  const interviewCount = applications.filter((a: any) => {
    const s = String(a.statut || '').toUpperCase();
    return s === 'INTERVIEW' || s === 'ENTRETIEN' || !!a.entretien_date;
  }).length;
  const avgMatch = applications.length > 0
    ? Math.round(applications.reduce((acc: number, curr: any) => acc + (curr.matching_score || 0), 0) / applications.length)
    : 0;

  // 2. Applications Over Time (Last 6 Months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { 
      month: monthNames[d.getMonth()], 
      rawMonth: d.getMonth(),
      year: d.getFullYear(),
      applications: 0 
    };
  });

  applications.forEach((app: any) => {
    const appDate = new Date(app.date_postule);
    const monthIndex = last6Months.findIndex(m => m.rawMonth === appDate.getMonth() && m.year === appDate.getFullYear());
    if (monthIndex > -1) last6Months[monthIndex].applications++;
  });

  const getCandidateSkillsText = (app: any) => {
    const direct = String(app.candidate_skills || '').trim();
    if (direct) return direct;
    const specialty = String(app.candidate_specialty || '').trim();
    // In some profiles, users paste comma-separated skills into "specialite"
    if (specialty.includes(',') && specialty.split(',').length >= 3) return specialty;
    const bio = String(app.candidate_bio || '').trim();
    // Try to pull "Skills:" style lines from bio as a fallback
    const m = bio.match(/skills?\s*:\s*([^\n]+)/i);
    return m?.[1]?.trim() || '';
  };

  // 3. Skills Distribution (Extracted from candidate profiles)
  const skillCounts: Record<string, number> = {};
  applications.forEach((app: any) => {
    const skillsText = getCandidateSkillsText(app);
    if (skillsText) {
      const skills = skillsText.split(',').map((s: string) => s.trim());
      skills.forEach((s: string) => {
        if (s) skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    }
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
  const skillsData = Object.entries(skillCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value], i) => ({ 
      name, 
      value: Math.round((value / applications.length) * 100),
      color: colors[i % colors.length]
    }));

  const skillsCoverage = applications.length > 0
    ? Math.round((applications.filter((a: any) => getCandidateSkillsText(a).length > 0).length / applications.length) * 100)
    : 0;

  // 4. Top Performing Jobs
  const jobPerformance = jobs.map((job: any) => ({
    title: job.titre,
    count: applications.filter((a: any) => a.id_offre === job.id_offre).length
  })).sort((a: any, b: any) => b.count - a.count).slice(0, 4);

  // 5. Funnel Data
  const funnel = {
    total: applications.length,
    screening: applications.filter((a: any) => ['PENDING', 'UNDER_REVIEW'].includes(a.statut)).length,
    interviews: applications.filter((a: any) => a.statut === 'INTERVIEW').length,
    offers: applications.filter((a: any) => a.statut === 'ACCEPTED').length
  };

  // 6. Offer Decisions (only when offer sent)
  const offerApps = applications.filter((a: any) => String(a.statut || '').toUpperCase() === 'ACCEPTED');
  const offerDecision = {
    pending: offerApps.filter((a: any) => !a.offer_status || String(a.offer_status).toUpperCase() === 'PENDING').length,
    accepted: offerApps.filter((a: any) => String(a.offer_status || '').toUpperCase() === 'ACCEPTED').length,
    declined: offerApps.filter((a: any) => String(a.offer_status || '').toUpperCase() === 'REJECTED').length,
  };

  const offerDecisionPie = [
    { name: 'Pending', value: offerDecision.pending, color: '#64748b' },
    { name: 'Accepted', value: offerDecision.accepted, color: '#10b981' },
    { name: 'Declined', value: offerDecision.declined, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // 7. Match score distribution
  const matchBuckets = [
    { name: '0-49', value: 0, color: '#94a3b8' },
    { name: '50-69', value: 0, color: '#f59e0b' },
    { name: '70-84', value: 0, color: '#3b82f6' },
    { name: '85-100', value: 0, color: '#10b981' },
  ];
  applications.forEach((a: any) => {
    const score = Number(a.matching_score || 0);
    if (score >= 85) matchBuckets[3].value++;
    else if (score >= 70) matchBuckets[2].value++;
    else if (score >= 50) matchBuckets[1].value++;
    else matchBuckets[0].value++;
  });

  // 8. Top locations (candidate locations)
  const locationCounts: Record<string, number> = {};
  applications.forEach((a: any) => {
    const loc = (a.candidate_location || '').trim();
    if (!loc) return;
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // 9. Recent offers table
  const recentOffers = offerApps
    .slice()
    .sort((a: any, b: any) => {
      const da = new Date(a.offer_sent_at || a.date_reponse || a.date_postule || 0).getTime();
      const db = new Date(b.offer_sent_at || b.date_reponse || b.date_postule || 0).getTime();
      return db - da;
    })
    .slice(0, 6);

  const offerBadge = (status?: string) => {
    const s = String(status || 'PENDING').toUpperCase();
    if (s === 'ACCEPTED') return { label: 'ACCEPTED', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle className="w-3.5 h-3.5" /> };
    if (s === 'REJECTED') return { label: 'DECLINED', cls: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle className="w-3.5 h-3.5" /> };
    return { label: 'PENDING', cls: 'bg-slate-50 text-slate-600 border-slate-100', icon: <Clock className="w-3.5 h-3.5" /> };
  };

  // 10. AI Fit (jobs ↔ candidates) - uses matching_score if available, fallback to skill overlap.
  const normalizeTokens = (text: string) =>
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s+#.]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const toSkillSet = (skills: string) =>
    new Set(
      String(skills || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );

  const calcSkillFit = (candidateSkills: string, jobText: string) => {
    const skillSet = toSkillSet(candidateSkills);
    if (skillSet.size === 0) return 0;
    const tokens = new Set(normalizeTokens(jobText));
    let hits = 0;
    for (const sk of skillSet) {
      const parts = sk.split(/\s+/).filter(Boolean);
      if (parts.length === 0) continue;
      const found = parts.some((p) => tokens.has(p));
      if (found) hits++;
    }
    return Math.min(100, Math.round((hits / Math.max(skillSet.size, 1)) * 100));
  };

  const activeJobs = jobs.filter((j: any) => j.statut === 'OUVERT' || j.statut === 'Active');
  const jobCandidateShortlist = activeJobs.slice(0, 4).map((job: any) => {
    const pool = applications
      .filter((a: any) => a.id_offre === job.id_offre)
      .map((a: any) => {
        const baseScore = Number(a.matching_score || 0);
        const skillsText = getCandidateSkillsText(a);
        const fallbackScore = calcSkillFit(skillsText, `${job.titre || ''} ${(job.description || '')}`);
        const score = baseScore > 0 ? baseScore : fallbackScore;
        return { ...a, ai_fit_score: score };
      })
      .sort((a: any, b: any) => (b.ai_fit_score || 0) - (a.ai_fit_score || 0))
      .slice(0, 3);

    return { job, pool };
  });
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            Intelligence Center
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase">Live Insights</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-lg italic">"Deciphering your recruitment data into strategic momentum."</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Talent Pool"
          value={totalCandidates}
          change={`+${applications.length} apps total`}
          icon={<Users size={20} className="text-blue-600" />}
        />
        <StatCard
          title="Active Opportunities"
          value={activeOffers}
          change="Real-time listing"
          icon={<Briefcase size={20} className="text-indigo-600" />}
        />
        <StatCard
          title="Pipeline Velocity"
          value={interviewCount}
          change="Interviews stage"
          icon={<Calendar size={20} className="text-amber-600" />}
        />
        <StatCard
          title="Match Intelligence"
          value={`${avgMatch}%`}
          change="AI Average"
          icon={<Award size={20} className="text-emerald-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications Over Time */}
        <div className="lg:col-span-2 bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Acquisition Velocity</h3>
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                <BarChart className="w-3 h-3" />
                Live Feed
             </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#2563eb"
                strokeWidth={4}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 6, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Skill Saturation</h3>
          {skillsData.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-slate-300 italic font-bold">No skills found in candidate profiles yet.</p>
              <p className="text-slate-400 text-xs font-bold mt-3">
                Skills coverage: <span className="text-slate-900">{skillsCoverage}%</span>
              </p>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Tip: ask candidates to fill the <span className="font-black">Skills / Competences</span> field in their profile.
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={skillsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {skillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {skillsData.slice(0, 4).map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: skill.color }}></div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{skill.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{skill.value}%</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[3px] text-slate-400">
                Skills coverage: <span className="text-slate-900">{skillsCoverage}%</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Performing Jobs */}
        <div className="bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Magnet Listings</h3>
          <div className="space-y-4">
            {jobPerformance.map((job: any) => (
              <div key={job.title} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-900 truncate pr-4">{job.title}</span>
                  <span className="shrink-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest">{job.count}</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                   <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(job.count / applications.length) * 100}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment Funnel */}
        <div className="bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Strategic Funnel</h3>
          <div className="space-y-6">
            {[
              { label: 'Applications', value: funnel.total, color: 'bg-slate-900' },
              { label: 'Screening', value: funnel.screening, color: 'bg-indigo-600' },
              { label: 'Interviews', value: funnel.interviews, color: 'bg-blue-600' },
              { label: 'Successful Offers', value: funnel.offers, color: 'bg-emerald-600' },
            ].map((step: any) => (
              <div key={step.label} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{step.label}</span>
                  <span className="text-lg font-black text-slate-900">{step.value}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className={`${step.color} h-full rounded-full shadow-lg transition-all duration-1000`}
                    style={{ width: `${(step.value / funnel.total) * 100 || 0}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Time to Hire */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl rounded-[32px] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
             <Calendar className="w-40 h-40" />
          </div>
          <h3 className="text-xl font-black mb-8 relative z-10">Board Velocity</h3>
          <div className="text-center relative z-10 py-4">
            <div className="text-6xl font-black text-blue-400 mb-2 drop-shadow-lg leading-none">21</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[4px]">Average Days to Hire</div>
            <div className="mt-10 flex items-center justify-center p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <BarChart className="w-5 h-5 text-emerald-400 mr-3" />
              <span className="text-xs font-bold text-slate-300">Sustainable recruitment pace maintained.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deeper Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Offer Decisions */}
        <div className="bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Offer Decisions</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offer sent: {offerApps.length}</span>
          </div>
          {offerApps.length === 0 ? (
            <div className="py-14 text-center text-slate-300 italic font-bold">No offers sent yet.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={offerDecisionPie.length ? offerDecisionPie : [{ name: 'Pending', value: 1, color: '#64748b' }]} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={8}>
                    {(offerDecisionPie.length ? offerDecisionPie : [{ name: 'Pending', value: 1, color: '#64748b' }]).map((entry, index) => (
                      <Cell key={`offer-cell-${index}`} fill={(entry as any).color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'Pending', value: offerDecision.pending, color: 'bg-slate-500' },
                  { label: 'Accepted', value: offerDecision.accepted, color: 'bg-emerald-500' },
                  { label: 'Declined', value: offerDecision.declined, color: 'bg-red-500' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{row.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Match distribution */}
        <div className="bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Match Score Distribution</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">All applicants</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ReBarChart data={matchBuckets}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: '#94a3b8' }} />
              <Bar dataKey="value" name="Applicants" radius={[12, 12, 0, 0]}>
                {matchBuckets.map((b, i) => (
                  <Cell key={`match-cell-${i}`} fill={b.color} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
          <p className="mt-4 text-[11px] text-slate-400 font-bold italic">
            "85%+ matches are your fastest wins. Prioritize them for interviews."
          </p>
        </div>

        {/* Geo + recent offer feed */}
        <div className="space-y-8">
          <div className="bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Talent Geography</h3>
            {topLocations.length === 0 ? (
              <div className="py-10 text-center text-slate-300 italic font-bold">No locations detected yet.</div>
            ) : (
              <div className="space-y-3">
                {topLocations.map((loc) => (
                  <div key={loc.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-black text-slate-700 truncate">{loc.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{loc.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white shadow-xl shadow-slate-100 rounded-[32px] border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Offers</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live</span>
            </div>
            {recentOffers.length === 0 ? (
              <div className="py-10 text-center text-slate-300 italic font-bold">No offers to display.</div>
            ) : (
              <div className="space-y-3">
                {recentOffers.map((o: any) => {
                  const b = offerBadge(o.offer_status);
                  return (
                    <div key={o.id_candidature} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{o.candidate_name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{o.job_title}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase border tracking-[2px] ${b.cls}`}>
                          {b.icon}
                          {b.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Matching Panel */}
      <div className="bg-white shadow-xl shadow-slate-100 rounded-[40px] border border-slate-100 p-8 overflow-hidden">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">AI Job Fit Radar</h3>
            <p className="text-slate-400 text-sm font-medium">
              Best-fit candidates per active job, using match score + skills overlap fallback.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">
            Active jobs: {activeJobs.length}
          </span>
        </div>

        {activeJobs.length === 0 ? (
          <div className="py-16 text-center text-slate-300 italic font-bold">No active jobs available.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobCandidateShortlist.map(({ job, pool }: any) => (
              <div key={job.id_offre} className="rounded-[32px] border border-slate-100 bg-slate-50/40 p-6 hover:bg-white transition-all">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-2">Job</p>
                    <p className="text-lg font-black text-slate-900 truncate">{job.titre}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                    {applications.filter((a: any) => a.id_offre === job.id_offre).length} applicants
                  </span>
                </div>

                {pool.length === 0 ? (
                  <div className="py-10 text-center text-slate-300 italic font-bold">No applicants for this job yet.</div>
                ) : (
                  <div className="space-y-3">
                    {pool.map((c: any) => (
                      <div key={c.id_candidature} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{c.candidate_name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                              {c.candidate_location || 'REMOTE'} • {c.candidate_specialty || 'Candidate'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-black ${(c.ai_fit_score || 0) >= 85 ? 'text-emerald-600' : (c.ai_fit_score || 0) >= 70 ? 'text-blue-600' : 'text-slate-400'}`}>
                              {c.ai_fit_score || 0}%
                            </p>
                            <p className="text-[9px] font-black uppercase tracking-[3px] text-slate-400">AI FIT</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyAnalytics;
