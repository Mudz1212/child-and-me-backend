const db = require("../db/connect");

class Review {
  static async findByVenue(venueId) {
    const result = await db.query(
      "SELECT * FROM reviews WHERE venue_id = $1 ORDER BY created_at DESC",
      [venueId]
    );
    return result.rows;
  }

  static async create({ venueId, userId, rating, comment }) {
    const result = await db.query(
      `INSERT INTO reviews (venue_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [venueId, userId, rating, comment]
    );
    return result.rows[0];
  }
}

module.exports = Review;
