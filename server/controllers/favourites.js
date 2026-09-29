const Favourite = require("../models/Favourite");

function parseUserId(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid user id" });
    return null;
  }
  return id;
}

async function index(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) return;

  try {
    const favourites = await Favourite.findByUser(userId);
    res.json(favourites);
  } catch (err) {
    console.error("Failed to fetch favourites:", err);
    res.status(500).json({ error: "Failed to fetch favourites" });
  }
}

async function add(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) return;

  try {
    const result = await Favourite.add(userId, req.params.geoapifyPlaceId);
    if (result === null) {
      return res.status(404).json({ error: "Venue not found" });
    }
    if (result.alreadyFavourited) {
      return res.status(200).json({ message: "Venue already favourited" });
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("Failed to add favourite:", err);
    res.status(500).json({ error: "Failed to add favourite" });
  }
}

async function remove(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) return;

  try {
    const result = await Favourite.remove(userId, req.params.geoapifyPlaceId);
    if (result === null) {
      return res.status(404).json({ error: "Venue not found" });
    }
    if (!result) {
      return res.status(404).json({ error: "Favourite not found" });
    }
    res.json({ message: "Removed from favourites" });
  } catch (err) {
    console.error("Failed to remove favourite:", err);
    res.status(500).json({ error: "Failed to remove favourite" });
  }
}

module.exports = { index, add, remove };
