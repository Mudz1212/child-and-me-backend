const db = require("../db/connect");

class User {
  static async create({ email, passwordHash, role = "parent" }) {
    const result = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, passwordHash, role],
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await db.query(
      "SELECT id, email, role, created_at FROM users ORDER BY id",
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      "SELECT id, email, role, preferences, created_at FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  }

  static async updatePreferences(id, preferences) {
    const result = await db.query(
      "UPDATE users SET preferences = $1 WHERE id = $2 RETURNING id, email, role, preferences",
      [preferences, id],
    );
    return result.rows[0];
  }

  static async addPreference(id, preference) {
    const result = await db.query(
      `UPDATE users
     SET preferences = CASE
       WHEN $1::text = ANY(preferences) THEN preferences
       ELSE array_append(preferences, $1::text)
     END
     WHERE id = $2
     RETURNING id, email, role, preferences`,
      [preference, id],
    );
    return result.rows[0];
  }
}

module.exports = User;
