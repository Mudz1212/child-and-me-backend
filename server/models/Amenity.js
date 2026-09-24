const db = require("../db/connect");

class Amenity {
  static async findAll() {
    const result = await db.query("SELECT * FROM amenities ORDER BY name");
    return result.rows;
  }

  static async create(name) {
    const result = await db.query("INSERT INTO amenities (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *", [name])
    return result.rows[0]
  }

}

module.exports = Amenity;
