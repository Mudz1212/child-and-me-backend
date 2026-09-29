const db = require("../db/connect");

class Geoapify {
  static async findByPlaceId(geoapifyPlaceId) {
    const result = await db.query(
      `
      SELECT
        v.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS amenities
      FROM venues v

      LEFT JOIN venue_amenities va
        ON v.id = va.venue_id

      LEFT JOIN amenities a
        ON va.amenity_id = a.id

      WHERE v.geoapify_place_id = $1

      GROUP BY v.id
      `,
      [geoapifyPlaceId]
    );

    return result.rows[0];
  }
}

module.exports = Geoapify;