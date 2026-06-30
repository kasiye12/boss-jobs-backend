const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Job = require('../models/Job');
const JobSeekerProfile = require('../models/JobSeekerProfile');

class SearchService {
  // Full-text search for jobs
  static async searchJobsFullText(searchTerm, filters = {}) {
    const query = `
      SELECT 
        j.*,
        ts_rank(
          to_tsvector('english', j.title || ' ' || j.description),
          plainto_tsquery('english', :searchTerm)
        ) AS relevance
      FROM jobs j
      WHERE 
        j.is_active = true
        AND (
          to_tsvector('english', j.title || ' ' || j.description) @@ 
          plainto_tsquery('english', :searchTerm)
          OR j.title ILIKE :patternMatch
          OR j.description ILIKE :patternMatch
          OR j.company_name ILIKE :patternMatch
        )
        ${filters.jobType ? "AND j.job_type = :jobType" : ''}
        ${filters.salaryMin ? "AND j.salary_range >= :salaryMin" : ''}
        ${filters.location ? "AND (j.latitude IS NOT NULL AND j.longitude IS NOT NULL)" : ''}
      ORDER BY 
        CASE WHEN j.is_featured THEN 0 ELSE 1 END,
        relevance DESC,
        j.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    const replacements = {
      searchTerm,
      patternMatch: `%${searchTerm}%`,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };

    if (filters.jobType) replacements.jobType = filters.jobType;
    if (filters.salaryMin) replacements.salaryMin = filters.salaryMin;

    return await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  // Skill-based matching algorithm
  static async findMatchingJobs(skills, experience = 0, location = null) {
    // Calculate skill match percentage
    const query = `
      SELECT 
        j.*,
        array_length(
          ARRAY(
            SELECT UNNEST(j.required_skills)
            INTERSECT
            SELECT UNNEST(:skills::text[])
          ),
          1
        ) AS matched_skills_count,
        CASE 
          WHEN array_length(j.required_skills, 1) > 0 
          THEN (array_length(
            ARRAY(
              SELECT UNNEST(j.required_skills)
              INTERSECT
              SELECT UNNEST(:skills::text[])
            ),
            1
          )::float / array_length(j.required_skills, 1)::float) * 100
          ELSE 0
        END AS match_percentage
      FROM jobs j
      WHERE 
        j.is_active = true
        AND j.required_skills && :skills::text[]
        ${experience ? "AND (j.required_experience IS NULL OR j.required_experience <= :experience)" : ''}
        ${location ? `
          AND j.latitude IS NOT NULL 
          AND j.longitude IS NOT NULL
          AND point(:lat, :lng) <@> point(j.latitude, j.longitude) * 1.609344 <= 50
        ` : ''}
      ORDER BY match_percentage DESC, j.created_at DESC
      LIMIT 20
    `;

    const replacements = {
      skills,
      experience,
    };

    if (location) {
      replacements.lat = location.latitude;
      replacements.lng = location.longitude;
    }

    return await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  // Smart recommendations based on user profile
  static async getRecommendations(userId) {
    // Get user's profile and application history
    const profile = await JobSeekerProfile.findOne({
      where: { userId },
    });

    if (!profile) {
      return [];
    }

    // Get jobs user hasn't applied to
    const appliedJobIds = await sequelize.query(`
      SELECT job_id FROM applications WHERE seeker_id = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    const excludeIds = appliedJobIds.map(a => a.job_id);

    // Find matching jobs based on skills and preferences
    const recommendations = await sequelize.query(`
      SELECT 
        j.*,
        array_length(
          ARRAY(
            SELECT UNNEST(j.required_skills)
            INTERSECT
            SELECT UNNEST(:skills::text[])
          ),
          1
        ) AS matched_skills,
        CASE 
          WHEN j.job_type = ANY(:preferredTypes::text[]) THEN 10
          ELSE 0
        END AS type_preference_score,
        CASE 
          WHEN j.salary_range ILIKE '%' || :expectedSalary || '%' THEN 5
          ELSE 0
        END AS salary_match_score
      FROM jobs j
      WHERE 
        j.is_active = true
        ${excludeIds.length ? 'AND j.id NOT IN (:excludeIds)' : ''}
        AND (
          j.required_skills && :skills::text[]
          OR j.job_type = ANY(:preferredTypes::text[])
          OR j.title ILIKE '%' || :title || '%'
        )
      ORDER BY 
        (matched_skills * 3 + type_preference_score + salary_match_score) DESC,
        j.created_at DESC
      LIMIT 10
    `, {
      replacements: {
        skills: profile.skills || [],
        preferredTypes: profile.preferredJobTypes || ['Full-time'],
        expectedSalary: profile.expectedSalaryRange || '',
        title: profile.title || '',
        excludeIds,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    return recommendations;
  }
}

module.exports = SearchService;
