import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Briefcase,
  Award,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Sparkles,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Target,
  Zap,
} from 'lucide-react';
import { analyticsApi } from '../../services/analyticsApi';
import type { RapportAnalytics } from '../../types/analytics-new';

const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

type ApplicationSource = {
  name: string;
  value: number;
  percentage?: number;
};

type SkillDistribution = {
  skill: string;
  count: number;
  percentage?: number;
};

type ExperienceDistribution = {
  name: string;
  value: number;
  percentage?: number;
};

const dateRangeOptions: Array<{ value: DateRangeOption; label: string }> = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
];

type DateRangeOption = 'week' | 'month' | 'quarter' | 'year';

const iconMap: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="h-7 w-7 text-slate-900" />,
  Award: <Award className="h-7 w-7 text-slate-900" />,
  Zap: <Zap className="h-7 w-7 text-slate-900" />,
  Target: <Target className="h-7 w-7 text-slate-900" />,
  Sparkles: <Sparkles className="h-7 w-7 text-slate-900" />,
};

const Rapport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('month');
  const [analyticsData, setAnalyticsData] = useState<RapportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const rapport = await analyticsApi.getRapport({ dateRange });
        setAnalyticsData(rapport);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Échec du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const applicationSources = useMemo<ApplicationSource[]>(() => {
    const sources = analyticsData?.applicationSources ?? [];
    const total = sources.reduce((sum, source) => sum + source.value, 0);
    return sources.map((source) => ({
      ...source,
      percentage: source.percentage ?? (total > 0 ? Math.round((source.value / total) * 100) : 0),
    }));
  }, [analyticsData]);

  const skillsDistribution = useMemo<SkillDistribution[]>(() => {
    const skills = analyticsData?.skillsDistribution ?? [];
    const total = skills.reduce((sum, skill) => sum + skill.count, 0);
    return skills.map((skill) => ({
      ...skill,
      percentage: skill.percentage ?? (total > 0 ? Math.round((skill.count / total) * 100) : 0),
    }));
  }, [analyticsData]);

  const experienceDistribution = useMemo<ExperienceDistribution[]>(() => {
    const experience = analyticsData?.experienceDistribution ?? [];
    const total = experience.reduce((sum, item) => sum + item.value, 0);
    return experience.map((item) => ({
      ...item,
      percentage: item.percentage ?? (total > 0 ? Math.round((item.value / total) * 100) : 0),
    }));
  }, [analyticsData]);

  const stats = useMemo(() => {
    if (!analyticsData) return [];
    return [
      {
        title: 'Candidatures totales',
        value: analyticsData.kpis.totalApplications,
        trend: analyticsData.kpis.trends.applicationsChange,
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: 'Offres d\'emploi',
        value: analyticsData.kpis.totalOffers,
        trend: 0,
        icon: <Briefcase className="w-5 h-5" />,
      },
      {
        title: 'Embauches réussies',
        value: analyticsData.kpis.successfulHires,
        trend: analyticsData.kpis.trends.hiresChange,
        icon: <Award className="w-5 h-5" />,
      },
      {
        title: 'Taux de conversion',
        value: analyticsData.kpis.conversionRate,
        trend: 0,
        icon: <TrendingUp className="w-5 h-5" />,
      },
    ];
  }, [analyticsData]);

  const timelineData = analyticsData?.timeline ?? [];
  const jobPerformance = analyticsData?.jobPerformance ?? [];
  const insights = analyticsData?.insights ?? [];

  const topJob = jobPerformance[0];
  const lowJob = jobPerformance[jobPerformance.length - 1];
  const averageFill = jobPerformance.length > 0
    ? Math.round(jobPerformance.reduce((sum, job) => sum + job.applications, 0) / jobPerformance.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Chargement des données...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Erreur de chargement</h2>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Tableau de bord recruteur</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">Rapport de Recrutement</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Calendar className="h-4 w-4" />
              <select
                className="bg-transparent outline-none"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-4 mb-8">
          {stats.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item.icon}</div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.trend >= 0 ? `+${item.trend}%` : `${item.trend}%`}
                </span>
              </div>
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3 mb-8">
          <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Candidatures au fil du temps</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tendance des candidatures sur la période sélectionnée</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <LineChartIcon className="h-4 w-4" /> Vue
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} name="Candidatures" />
                <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} name="Embauches" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="mb-5 flex items-center gap-3">
              <PieChartIcon className="h-5 w-5 text-violet-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sources des candidatures</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">LinkedIn, direct, référence, etc.</p>
              </div>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={applicationSources} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {applicationSources.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value ?? 0} candidatures`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid gap-3">
              {applicationSources.map((source, idx) => (
                <div key={source.name} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[idx] }} />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{source.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{source.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2 mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="mb-5 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance des postes</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Analyse des offres les plus performantes</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={jobPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="title" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="applications" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Résumé rapide</h2>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Poste le plus appliqué</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{topJob?.title || 'N/A'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{topJob?.applications || 0} candidatures</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Poste à améliorer</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{lowJob?.title || 'N/A'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{lowJob?.applications || 0} candidatures</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Moyenne de candidatures</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{averageFill}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2 mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-fuchsia-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Compétences clés</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Les compétences les plus recherchées</p>
              </div>
            </div>
            <div className="space-y-4">
              {skillsDistribution.map((skill) => (
                <div key={skill.skill}>
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>{skill.skill}</span>
                    <span>{skill.percentage}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600" style={{ width: `${skill.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-5 w-5 text-cyan-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Niveaux d'expérience</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Junior / Mid / Senior</p>
              </div>
            </div>
            <div className="space-y-4">
              {experienceDistribution.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>{item.name}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Insights</h2>
          <div className="grid gap-6 xl:grid-cols-4">
            {insights.map((insight) => {
              const iconElement = iconMap[insight.icon] ?? <Sparkles className="h-7 w-7 text-slate-900" />;
              return (
                <div key={insight.title} className={`rounded-3xl border p-6 shadow-sm ${insight.color} ${insight.borderColor}`}>
                  <p className="text-3xl">{iconElement}</p>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{insight.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{insight.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="rounded-3xl bg-slate-800 p-6 text-center text-sm text-slate-300">
          Données en temps réel – Connecté à votre base de données de recrutement.
        </footer>
      </div>
    </div>
  );
};

export default Rapport;
