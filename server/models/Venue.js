const db = require("../db/connect");

class Venue {
  static async findAll({ amenity, age, postcode } = {}) {
    let query = `
      SELECT v.*, COALESCE(json_agg(a.name) FILTER (WHERE a.name IS NOT NULL), '[]') AS amenities
      FROM venues v
      LEFT JOIN venue_amenities va ON va.venue_id = v.id
      LEFT JOIN amenities a ON a.id = va.amenity_id
    `;
    const conditions = [];
    const values = [];

    if (age) {
      values.push(age);
      conditions.push(`v.age_suitability = $${values.length}`);
    }
    if (postcode) {
      values.push(postcode);
      conditions.push(`v.postcode = $${values.length}`);
    }
    if (conditions.length) query += ` WHERE ${conditions.join(" AND ")}`;
    query += " GROUP BY v.id";
    if (amenity) {
      values.push(amenity);
      query += ` HAVING $${values.length} = ANY(array_agg(a.name))`;
    }
    query += " ORDER BY v.id";

    const result = await db.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query("SELECT * FROM venues WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create({ name, description, latitude, longitude, postcode, ageSuitability, ownerId }) {
    const result = await db.query(
      `INSERT INTO venues (name, description, latitude, longitude, postcode, age_suitability, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, latitude, longitude, postcode, ageSuitability, ownerId]
    );
    return result.rows[0];
  }

  static async seed(venues) {
    const imported = [];

    for (const venue of venues) {
      const result = await db.query(
        `
        INSERT INTO venues (
          geoapify_place_id,
          category,
          address,
          borough,
          website,
          opening_hours,
          name,
          latitude,
          longitude,
          postcode
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10
        )

        ON CONFLICT (geoapify_place_id)
        DO UPDATE SET
          category = EXCLUDED.category,
          address = EXCLUDED.address,
          borough = EXCLUDED.borough,
          website = EXCLUDED.website,
          opening_hours = EXCLUDED.opening_hours,
          name = EXCLUDED.name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          postcode = EXCLUDED.postcode

        RETURNING *;
        `,
        [
          venue.geoapify_place_id,
          venue.category,
          venue.address,
          venue.borough,
          venue.website,
          venue.opening_hours,
          venue.name,
          venue.latitude,
          venue.longitude,
          venue.postcode
        ]
      );

      imported.push(result.rows[0]);
    }

    return imported;
  }

  static async update(id, ownerId, fields) {
    const result = await db.query(
      `UPDATE venues SET name = $1, description = $2, postcode = $3, age_suitability = $4
       WHERE id = $5 AND owner_id = $6 RETURNING *`,
      [fields.name, fields.description, fields.postcode, fields.ageSuitability, id, ownerId]
    );
    return result.rows[0];
  }
}

module.exports = Venue;