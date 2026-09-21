const db = require("../db/connect");

class Amenity {
  static async findAll() {
    const result = await db.query("SELECT * FROM amenities ORDER BY name");
    return result.rows;
  }
}

module.exports = Amenity;
