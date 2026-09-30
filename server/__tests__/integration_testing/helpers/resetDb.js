const db = require("../../../db/connect");

async function resetDb() {
  await db.query(
    "TRUNCATE reviews, user_favourites, venue_amenities, venues, users RESTART IDENTITY CASCADE",
  );
}

module.exports = { resetDb };
