const db = require("../db/connect");

class Review {
  static async findByVenue(venueId) {
    const result = await db.query(
      "SELECT * FROM reviews WHERE venue_id = $1 ORDER BY created_at DESC",
      [venueId],
    );
    return result.rows;
  }

  static async create({ venueId, userId, rating, comment }) {
    const result = await db.query(
      `INSERT INTO reviews (venue_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [venueId, userId, rating, comment],
    );
    return result.rows[0];
  }

  static async findByUser(userId) {
    const result = await db.query(
      "SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows;
  }

  static async delete(id, userId) {
    const result = await db.query(
      "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );
    return result.rows[0];
  }
}

module.exports = Review;
