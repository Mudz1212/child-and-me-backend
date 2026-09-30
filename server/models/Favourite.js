const db = require("../db/connect");

class Favourite {
  static async add(userId, geoapifyPlaceId) {
    const venue = await db.query(
      "SELECT id FROM venues WHERE geoapify_place_id = $1",
      [geoapifyPlaceId],
    );
    if (!venue.rows[0]) return null;

    const result = await db.query(
      `INSERT INTO user_favourites (user_id, venue_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, venue_id) DO NOTHING
       RETURNING *`,
      [userId, venue.rows[0].id],
    );
    return result.rows[0] === undefined
      ? { alreadyFavourited: true }
      : result.rows[0];
  }

  static async remove(userId, geoapifyPlaceId) {
    const venue = await db.query(
      "SELECT id FROM venues WHERE geoapify_place_id = $1",
      [geoapifyPlaceId],
    );
    if (!venue.rows[0]) return null;

    const result = await db.query(
      "DELETE FROM user_favourites WHERE user_id = $1 AND venue_id = $2 RETURNING *",
      [userId, venue.rows[0].id],
    );
    return result.rows[0];
  }

  static async findByUser(userId) {
    const result = await db.query(
      `SELECT
        v.*,
        COALESCE(
          json_agg(a.name) FILTER (WHERE a.name IS NOT NULL),
          '[]'
        ) AS amenities
       FROM user_favourites uf
       JOIN venues v ON v.id = uf.venue_id
       LEFT JOIN venue_amenities va ON va.venue_id = v.id
       LEFT JOIN amenities a ON a.id = va.amenity_id
       WHERE uf.user_id = $1
       GROUP BY v.id
       ORDER BY v.id`,
      [userId],
    );
    return result.rows;
  }
}

module.exports = Favourite;
