// Query filters
export interface AnalyticsFilters {
  dateRange?: 'week' | 'month' | 'quarter' | 'year';
  jobId?: number;
  startDate?: string;
  endDate?: string;
}

// Timeline entry for applications over time
export interface TimelineEntry {
  date: string;
  applications: number;
  hires: number;
}

// Job performance metrics
export interface JobPerformance {
  id: number;
  title: string;
  applications: number;
  interviews: number;
  offers: number;
  hired: number;
  avgDaysToFill: number;
  status: 'open' | 'filled' | 'closed';
  createdAt: string;
  filledAt?: string;
}

// Application source breakdown
export interface ApplicationSource {
  name: string;
  value: number;
  percentage: number;
}

// Skill demand
export interface SkillData {
  skill: string;
  count: number;
  percentage: number;
}

// Experience level distribution
export interface ExperienceLevel {
  name: string;
  value: number;
  percentage: number;
}

// KPI metrics
export interface KPIs {
  totalApplications: number;
  totalOffers: number;
  successfulHires: number;
  conversionRate: string;
  trends: {
    applicationsChange: number;
    hiresChange: number;
  };
}

// Insights
export interface Insight {
  icon: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
}

// Main Rapport API Response
export interface RapportAnalytics {
  kpis: KPIs;
  timeline: TimelineEntry[];
  jobPerformance: JobPerformance[];
  applicationSources: ApplicationSource[];
  skillsDistribution: SkillData[];
  experienceDistribution: ExperienceLevel[];
  insights: Insight[];
  generatedAt: string;
}