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
}

module.exports = User;
