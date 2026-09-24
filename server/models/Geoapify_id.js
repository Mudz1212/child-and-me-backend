const db = require("../db/connect");

class Geoapify {
  static async findByPlaceId(geoapifyPlaceId) {
    const result = await db.query(
      "SELECT * FROM venues WHERE geoapify_place_id = $1",
      [geoapifyPlaceId],
    );
    return result.rows[0];
  }
}

module.exports = Geoapify;
