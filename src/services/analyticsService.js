const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

class AnalyticsService {
  // Platform overview stats
  static async getPlatformOverview(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const queries = {
      newUsers: `
        SELECT COUNT(*) FROM users WHERE created_at >= :since
      `,
      newJobs: `
        SELECT COUNT(*) FROM jobs WHERE created_at >= :since
      `,
      newApplications: `
        SELECT COUNT(*) FROM applications WHERE created_at >= :since
      `,
      activeJobs: `
        SELECT COUNT(*) FROM jobs WHERE is_active = true
      `,
      totalUsers: `
        SELECT role, COUNT(*) as count FROM users GROUP BY role
      `,
      applicationsByStatus: `
        SELECT status, COUNT(*) as count FROM applications GROUP BY status
      `,
      jobsByType: `
        SELECT job_type, COUNT(*) as count FROM jobs WHERE is_active = true GROUP BY job_type
      `,
      dailyApplications: `
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM applications 
        WHERE created_at >= :since 
        GROUP BY DATE(created_at) 
        ORDER BY date
      `,
      dailyRegistrations: `
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM users 
        WHERE created_at >= :since 
        GROUP BY DATE(created_at) 
        ORDER BY date
      `,
      topSkills: `
        SELECT UNNEST(required_skills) as skill, COUNT(*) as count
        FROM jobs 
        WHERE is_active = true 
        GROUP BY skill 
        ORDER BY count DESC 
        LIMIT 20
      `,
      topCompanies: `
        SELECT company_name, COUNT(*) as job_count 
        FROM jobs 
        GROUP BY company_name 
        ORDER BY job_count DESC 
        LIMIT 10
      `,
      locationDistribution: `
        SELECT 
          CASE 
            WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'Has Location'
            ELSE 'No Location'
          END as has_location,
          COUNT(*) as count
        FROM jobs 
        WHERE is_active = true 
        GROUP BY has_location
      `,
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const [data] = await sequelize.query(query, {
        replacements: { since },
      });
      results[key] = data;
    }

    return {
      overview: {
        newUsers: results.newUsers[0].count,
        newJobs: results.newJobs[0].count,
        newApplications: results.newApplications[0].count,
        activeJobs: results.activeJobs[0].count,
        period: `${days} days`,
      },
      users: results.totalUsers,
      applications: results.applicationsByStatus,
      jobs: results.jobsByType,
      trends: {
        dailyApplications: results.dailyApplications,
        dailyRegistrations: results.dailyRegistrations,
      },
      insights: {
        topSkills: results.topSkills,
        topCompanies: results.topCompanies,
        locationDistribution: results.locationDistribution,
      },
    };
  }

  // Employer analytics
  static async getEmployerAnalytics(employerId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [jobStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN is_active THEN 1 END) as active_jobs,
        COUNT(CASE WHEN created_at >= :since THEN 1 END) as new_jobs,
        SUM(views_count) as total_views,
        SUM(applications_count) as total_applications
      FROM jobs 
      WHERE employer_id = :employerId
    `, {
      replacements: { employerId, since },
    });

    const [applicationStats] = await sequelize.query(`
      SELECT 
        status, COUNT(*) as count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.employer_id = :employerId
        AND a.created_at >= :since
      GROUP BY status
    `, {
      replacements: { employerId, since },
    });

    return {
      jobStats: jobStats[0],
      applicationStats,
      period: `${days} days`,
    };
  }
}

module.exports = AnalyticsService;
