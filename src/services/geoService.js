const { sequelize } = require('../config/database');

class GeoService {
  // Find jobs within radius using Earthdistance extension
  static async findJobsInRadius(latitude, longitude, radiusKm = 10, filters = {}) {
    const query = `
      SELECT 
        j.*,
        point($1, $2) <@> point(j.latitude, j.longitude) * 1.609344 AS distance_km,
        u.full_name AS employer_name,
        u.company_name
      FROM jobs j
      JOIN users u ON j.employer_id = u.id
      WHERE 
        j.is_active = true
        AND j.latitude IS NOT NULL
        AND j.longitude IS NOT NULL
        AND point($1, $2) <@> point(j.latitude, j.longitude) * 1.609344 <= $3
        ${filters.jobType ? "AND j.job_type = :jobType" : ''}
        ${filters.searchTerm ? "AND (j.title ILIKE :searchTerm OR j.description ILIKE :searchTerm)" : ''}
        ${filters.companyName ? "AND j.company_name ILIKE :companyName" : ''}
        ${filters.skills ? "AND j.required_skills && :skills::text[]" : ''}
      ORDER BY distance_km
      LIMIT :limit OFFSET :offset
    `;

    const replacements = {
      latitude,
      longitude,
      radiusKm,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };

    if (filters.jobType) replacements.jobType = filters.jobType;
    if (filters.searchTerm) replacements.searchTerm = `%${filters.searchTerm}%`;
    if (filters.companyName) replacements.companyName = `%${filters.companyName}%`;
    if (filters.skills) replacements.skills = filters.skills;

    const jobs = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      WHERE 
        j.is_active = true
        AND j.latitude IS NOT NULL
        AND j.longitude IS NOT NULL
        AND point(:latitude, :longitude) <@> point(j.latitude, j.longitude) * 1.609344 <= :radiusKm
        ${filters.jobType ? "AND j.job_type = :jobType" : ''}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { latitude, longitude, radiusKm },
      type: sequelize.QueryTypes.SELECT,
    });

    return {
      jobs,
      total: parseInt(total),
      radius: radiusKm,
      center: { latitude, longitude },
    };
  }

  // Find job seekers within radius
  static async findJobSeekersInRadius(latitude, longitude, radiusKm = 10, filters = {}) {
    const query = `
      SELECT 
        jsp.*,
        point(:latitude, :longitude) <@> point(jsp.latitude, jsp.longitude) * 1.609344 AS distance_km,
        u.full_name,
        u.email
      FROM job_seeker_profiles jsp
      JOIN users u ON jsp.user_id = u.id
      WHERE 
        jsp.is_public = true
        AND jsp.is_profile_complete = true
        AND jsp.latitude IS NOT NULL
        AND jsp.longitude IS NOT NULL
        AND point(:latitude, :longitude) <@> point(jsp.latitude, jsp.longitude) * 1.609344 <= :radiusKm
        ${filters.skills ? "AND jsp.skills && :skills::text[]" : ''}
        ${filters.title ? "AND jsp.title ILIKE :title" : ''}
      ORDER BY distance_km
      LIMIT :limit OFFSET :offset
    `;

    const replacements = {
      latitude,
      longitude,
      radiusKm,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };

    if (filters.skills) replacements.skills = filters.skills;
    if (filters.title) replacements.title = `%${filters.title}%`;

    return await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  // Calculate distance between two points
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static toRad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = GeoService;
