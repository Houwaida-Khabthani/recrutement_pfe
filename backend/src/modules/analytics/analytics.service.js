const pool = require('../../config/db');

const acceptedCondition = (column) => `${column} IN ('ACCEPTED', 'ACCEPTEE', 'EMBAUCHE')`;

const getJobFilterSQL = (jobId, alias = 'c') => {
  return jobId ? `AND ${alias}.id_offre = ?` : '';
};

const getJobFilterParams = (jobId) => {
  return jobId ? [jobId] : [];
};

const normalizeJobStatus = (status) => {
  if (!status) return 'open';
  const normalized = status.toString().trim().toUpperCase();
  if (normalized === 'FERME' || normalized === 'CLOSED') return 'closed';
  return 'open';
};

const getKPIs = async (companyId, dateRange = 'month', jobId) => {
  try {
    const dateCondition = getDateRangeCondition(dateRange, 'c');
    const previousCondition = getPreviousPeriodCondition(dateRange, 'c');
    const jobFilter = getJobFilterSQL(jobId, 'c');
    const currentParams = [companyId, ...getJobFilterParams(jobId)];
    const previousParams = [companyId, ...getJobFilterParams(jobId)];

    const totalOffersQuery = `
      SELECT COUNT(*) as totalOffers
      FROM offre
      WHERE id_entreprise = ?
      ${jobId ? 'AND id_offre = ?' : ''}
    `;

    const totalAppsQuery = `
      SELECT
        COUNT(*) as totalApplications,
        SUM(CASE WHEN ${acceptedCondition('c.statut')} THEN 1 ELSE 0 END) as successfulHires
      FROM candidature c
      WHERE c.id_offre IN (SELECT id_offre FROM offre WHERE id_entreprise = ?)
      AND ${dateCondition}
      ${jobFilter}
    `;

    const previousAppsQuery = `
      SELECT
        COUNT(*) as previousApplications,
        SUM(CASE WHEN ${acceptedCondition('c.statut')} THEN 1 ELSE 0 END) as previousHires
      FROM candidature c
      WHERE c.id_offre IN (SELECT id_offre FROM offre WHERE id_entreprise = ?)
      AND ${previousCondition}
      ${jobFilter}
    `;

    const [totalOffersResult] = await pool.query(totalOffersQuery, currentParams);
    const [currentResult] = await pool.query(totalAppsQuery, currentParams);
    const [previousResult] = await pool.query(previousAppsQuery, previousParams);

    const totalOffers = totalOffersResult[0]?.totalOffers || 0;
    const totalApplications = currentResult[0]?.totalApplications || 0;
    const successfulHires = currentResult[0]?.successfulHires || 0;
    const previousApplications = previousResult[0]?.previousApplications || 0;
    const previousHires = previousResult[0]?.previousHires || 0;

    const conversionRate = totalApplications > 0
      ? `${Math.round((successfulHires / totalApplications) * 100)}%`
      : '0%';

    const applicationsChange = previousApplications > 0
      ? Math.round(((totalApplications - previousApplications) / previousApplications) * 100)
      : totalApplications > 0 ? 100 : 0;

    const hiresChange = previousHires > 0
      ? Math.round(((successfulHires - previousHires) / previousHires) * 100)
      : successfulHires > 0 ? 100 : 0;

    return {
      totalApplications,
      totalOffers,
      successfulHires,
      conversionRate,
      trends: {
        applicationsChange,
        hiresChange,
      },
    };
  } catch (error) {
    console.error('Error calculating KPIs:', error);
    throw error;
  }
};

/**
 * Get timeline data (applications over time)
 */
const getTimeline = async (companyId, dateRange = 'month', jobId) => {
  try {
    const dateCondition = getDateRangeCondition(dateRange, 'c');
    const groupFormat = getGroupDateFormat(dateRange);
    const jobFilter = getJobFilterSQL(jobId, 'c');
    const params = [companyId, ...getJobFilterParams(jobId)];

    const query = `
      SELECT
        DATE_FORMAT(c.date_postule, '${groupFormat}') as date,
        COUNT(*) as applications,
        SUM(CASE WHEN ${acceptedCondition('c.statut')} THEN 1 ELSE 0 END) as hires
      FROM candidature c
      WHERE c.id_offre IN (SELECT id_offre FROM offre WHERE id_entreprise = ?)
      AND ${dateCondition}
      ${jobFilter}
      GROUP BY DATE_FORMAT(c.date_postule, '${groupFormat}')
      ORDER BY MIN(c.date_postule) ASC
    `;

    const [results] = await pool.query(query, params);
    return results;
  } catch (error) {
    console.error('Error getting timeline:', error);
    throw error;
  }
};

/**
 * Get job performance data
 */
const getJobPerformance = async (companyId, dateRange = 'month', jobId) => {
  try {
    const dateCondition = getDateRangeCondition(dateRange, 'c');
    const jobFilter = getJobFilterSQL(jobId, 'o');
    const params = [companyId, ...getJobFilterParams(jobId)];

    const query = `
      SELECT
        o.id_offre as id,
        o.titre as title,
        o.statut as rawStatus,
        COALESCE(o.type_contrat, '') as contractType,
        COALESCE(o.date_pub, CURDATE()) as createdAt,
        COUNT(c.id_candidature) as applications,
        SUM(CASE WHEN ${acceptedCondition('c.statut')} THEN 1 ELSE 0 END) as hired
      FROM offre o
      LEFT JOIN candidature c ON o.id_offre = c.id_offre AND ${dateCondition}
      WHERE o.id_entreprise = ?
      ${jobFilter}
      GROUP BY o.id_offre, o.titre, o.statut, o.type_contrat, o.date_pub
      ORDER BY applications DESC
      LIMIT 10
    `;

    const [results] = await pool.query(query, params);
    return results.map(row => ({
      id: row.id,
      title: row.title,
      applications: row.applications || 0,
      interviews: 0,
      offers: 0,
      hired: row.hired || 0,
      avgDaysToFill: 0,
      status: normalizeJobStatus(row.rawStatus),
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
      filledAt: null,
    }));
  } catch (error) {
    console.error('Error getting job performance:', error);
    throw error;
  }
};

/**
 * Get application sources breakdown (mock data since no source field exists)
 */
const getApplicationSources = async (companyId, dateRange = 'month', jobId) => {
  try {
    const dateCondition = getDateRangeCondition(dateRange, 'c');
    const jobFilter = getJobFilterSQL(jobId, 'c');
    const params = [companyId, ...getJobFilterParams(jobId)];

    const [sourceColumn] = await pool.query("SHOW COLUMNS FROM candidature LIKE 'source'");
    const hasSourceColumn = Array.isArray(sourceColumn) && sourceColumn.length > 0;
    const field = hasSourceColumn ? 'c.source' : 'o.type_contrat';
    const fallbackLabel = hasSourceColumn ? 'source' : 'type_contrat';

    const query = `
      SELECT
        IFNULL(${field}, 'Autre') as name,
        COUNT(*) as value
      FROM candidature c
      JOIN offre o ON c.id_offre = o.id_offre
      WHERE o.id_entreprise = ?
      AND ${dateCondition}
      ${jobFilter}
      GROUP BY ${field}
      ORDER BY value DESC
      LIMIT 6
    `;

    const [results] = await pool.query(query, params);
    const totalApplications = results.reduce((sum, row) => sum + (row.value || 0), 0);

    return results.map(row => ({
      name: row.name || fallbackLabel,
      value: row.value || 0,
      percentage: totalApplications > 0 ? Math.round(((row.value || 0) / totalApplications) * 100) : 0,
    }));
  } catch (error) {
    console.error('Error getting application sources:', error);
    throw error;
  }
};

/**
 * Get skills distribution from candidate profiles
 */
const getSkillsDistribution = async (companyId, dateRange = 'month', jobId) => {
  try {
    const dateCondition = getDateRangeCondition(dateRange, 'c');
    const jobFilter = getJobFilterSQL(jobId, 'c');
    const params = [companyId, ...getJobFilterParams(jobId)];

    const query = `
      SELECT
        TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.specialite, ',', n.n), ',', -1)) as skill,
        COUNT(*) as count
      FROM user u
      JOIN candidature c ON u.id_user = c.id_user
      CROSS JOIN (
        SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      ) n
      WHERE c.id_offre IN (SELECT id_offre FROM offre WHERE id_entreprise = ?)
      AND ${dateCondition}
      ${jobFilter}
      AND u.specialite IS NOT NULL
      AND u.specialite != ''
      AND LENGTH(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.specialite, ',', n.n), ',', -1))) > 0
      GROUP BY skill
      ORDER BY count DESC
      LIMIT 10
    `;

    const [results] = await pool.query(query, params);

    return results.map(row => ({
      skill: row.skill.trim(),
      count: row.count,
      percentage: 0,
    })).filter(row => row.skill.length > 0);
  } catch (error) {
    console.error('Error getting skills distribution:', error);
    throw error;
  }
};

/**
 * Get experience level distribution
 */
const getExperienceDistribution = async (companyId, dateRange = 'month', jobId) => {
  try {
    const dateCondition = getDateRangeCondition(dateRange, 'c');
    const jobFilter = getJobFilterSQL(jobId, 'c');
    const params = [companyId, ...getJobFilterParams(jobId)];

    const query = `
      SELECT
        CASE
          WHEN u.niveau_etude IN ('Bac', 'Bac+1', 'Bac+2') OR u.experience = '1' THEN 'Junior'
          WHEN u.niveau_etude IN ('Bac+3', 'Bac+4') OR u.experience IN ('2', '3', '4') THEN 'Mid-Level'
          WHEN u.niveau_etude IN ('Bac+5', 'Doctorat', 'Master') OR CAST(u.experience AS UNSIGNED) >= 5 THEN 'Senior'
          ELSE 'Other'
        END as name,
        COUNT(DISTINCT u.id_user) as count
      FROM user u
      JOIN candidature c ON u.id_user = c.id_user
      WHERE c.id_offre IN (SELECT id_offre FROM offre WHERE id_entreprise = ?)
      AND ${dateCondition}
      ${jobFilter}
      GROUP BY name
      ORDER BY count DESC
    `;

    const [results] = await pool.query(query, params);

    return results.map(row => ({
      name: row.name,
      count: row.count,
      percentage: 0,
    }));
  } catch (error) {
    console.error('Error getting experience distribution:', error);
    throw error;
  }
};

/**
 * Get insights and recommendations
 */
const getInsights = async (companyId, dateRange = 'month', jobId) => {
  try {
    const kpis = await getKPIs(companyId, dateRange, jobId);
    const jobPerformance = await getJobPerformance(companyId, dateRange, jobId);

    const insights = [];

    if (kpis.conversionRate >= 15) {
      insights.push({
        title: 'Taux de conversion solide',
        description: `Votre conversion est à ${kpis.conversionRate}%. Continuez sur cette dynamique.`,
        icon: 'TrendingUp',
        color: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
      });
    }

    if (jobPerformance.length > 0) {
      const topJob = jobPerformance[0];
      insights.push({
        title: 'Offre la plus populaire',
        description: `${topJob.title} a reçu ${topJob.applications} candidatures.`,
        icon: 'Award',
        color: 'bg-sky-50 dark:bg-sky-950/30',
        borderColor: 'border-sky-200 dark:border-sky-800',
      });
    }

    if (kpis.trends.hiresChange > 10) {
      insights.push({
        title: 'Hausse des embauches',
        description: `Les embauches ont augmenté de ${kpis.trends.hiresChange}% par rapport à la période précédente.`,
        icon: 'Zap',
        color: 'bg-yellow-50 dark:bg-yellow-950/30',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
      });
    }

    if (kpis.trends.applicationsChange < -10) {
      insights.push({
        title: 'Baisse des candidatures',
        description: 'Les candidatures diminuent. Pensez à relancer vos offres.',
        icon: 'Target',
        color: 'bg-rose-50 dark:bg-rose-950/30',
        borderColor: 'border-rose-200 dark:border-rose-800',
      });
    }

    while (insights.length < 4) {
      insights.push({
        title: 'Analyse disponible',
        description: 'Les données de recrutement ont été mises à jour pour la période sélectionnée.',
        icon: 'Sparkles',
        color: 'bg-slate-50 dark:bg-slate-950/30',
        borderColor: 'border-slate-200 dark:border-slate-800',
      });
    }

    return insights.slice(0, 4);
  } catch (error) {
    console.error('Error getting insights:', error);
    return [];
  }
};

/**
 * Generate complete rapport analytics
 */
const generateRapport = async (companyId, filters = {}) => {
  try {
    const { dateRange = 'month', jobId } = filters;

    const [kpis, timeline, jobPerformance, applicationSources, skillsDistribution, experienceDistribution, insights] = await Promise.all([
      getKPIs(companyId, dateRange, jobId),
      getTimeline(companyId, dateRange, jobId),
      getJobPerformance(companyId, dateRange, jobId),
      getApplicationSources(companyId, dateRange, jobId),
      getSkillsDistribution(companyId, dateRange, jobId),
      getExperienceDistribution(companyId, dateRange, jobId),
      getInsights(companyId, dateRange, jobId),
    ]);

    return {
      kpis,
      timeline,
      jobPerformance,
      applicationSources,
      skillsDistribution,
      experienceDistribution,
      insights,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating rapport:', error);
    throw error;
  }
};

/**
 * Convert rapport data to CSV format
 */
const convertToCSV = (rapport) => {
  let csv = "Rapport d'Analyse de Recrutement\n";
  csv += `Généré le: ${new Date().toLocaleDateString('fr-FR')}\n\n`;

  csv += 'KPIs,Valeur\n';
  csv += `Candidatures totales,${rapport.kpis.totalApplications}\n`;
  csv += `Offres d'emploi,${rapport.kpis.totalOffers}\n`;
  csv += `Embauches réussies,${rapport.kpis.successfulHires}\n`;
  csv += `Taux de conversion,${rapport.kpis.conversionRate}%\n\n`;

  csv += 'Historique,Candidatures,Embauches\n';
  rapport.timeline.forEach(entry => {
    csv += `${entry.date},${entry.applications},${entry.hires || 0}\n`;
  });
  csv += '\n';

  csv += 'Poste,Candidatures,Embauches\n';
  rapport.jobPerformance.forEach(job => {
    csv += `${job.title},${job.applications},${job.hired || 0}\n`;
  });
  csv += '\n';

  csv += 'Source,Candidatures\n';
  rapport.applicationSources.forEach(source => {
    csv += `${source.name},${source.value}\n`;
  });
  csv += '\n';

  csv += 'Compétence,Nombre de candidatures\n';
  rapport.skillsDistribution.forEach(skill => {
    csv += `${skill.skill},${skill.count}\n`;
  });
  csv += '\n';

  csv += 'Niveau d\'expérience,Nombre de candidats\n';
  rapport.experienceDistribution.forEach(entry => {
    csv += `${entry.name},${entry.count}\n`;
  });

  return csv;
};

// ─────────────────────────────────────────────────
// HELPER FUNCTIONS FOR DATE RANGES
// ─────────────────────────────────────────────────

const getDateRangeCondition = (dateRange, alias = 'c') => {
  const now = new Date();
  let startDate;

  switch (dateRange) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'month':
    default:
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
  }

  return `${alias}.date_postule >= '${startDate.toISOString().split('T')[0]}'`;
};

const getPreviousPeriodCondition = (dateRange, alias = 'c') => {
  const now = new Date();
  let previousStart;
  const previousEnd = new Date(now);

  switch (dateRange) {
    case 'week':
      previousEnd.setDate(previousEnd.getDate() - 7);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 7);
      break;
    case 'year':
      previousEnd.setFullYear(previousEnd.getFullYear() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setFullYear(previousStart.getFullYear() - 1);
      break;
    case 'quarter':
      previousEnd.setMonth(previousEnd.getMonth() - 3);
      previousStart = new Date(previousEnd);
      previousStart.setMonth(previousStart.getMonth() - 3);
      break;
    case 'month':
    default:
      previousEnd.setMonth(previousEnd.getMonth() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setMonth(previousStart.getMonth() - 1);
  }

  return `${alias}.date_postule BETWEEN '${previousStart.toISOString().split('T')[0]}' AND '${previousEnd.toISOString().split('T')[0]}'`;
};

const getGroupDateFormat = (dateRange) => {
  switch (dateRange) {
    case 'week':
    case 'month':
      return '%Y-%m-%d';
    case 'quarter':
    case 'year':
      return '%Y-%m';
    default:
      return '%Y-%m-%d';
  }
};

module.exports = {
  getKPIs,
  getTimeline,
  getJobPerformance,
  getApplicationSources,
  getSkillsDistribution,
  getExperienceDistribution,
  generateRapport,
  convertToCSV,
};
