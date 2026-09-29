const User = require("../models/User");

function parseUserId(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid user id" });
    return null;
  }
  return id;
}

async function show(req, res) {
  const id = parseUserId(req, res);
  if (id === null) return;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Failed to fetch user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

async function updatePreferences(req, res) {
  const id = parseUserId(req, res);
  if (id === null) return;

  const { preferences } = req.body;
  if (
    !Array.isArray(preferences) ||
    !preferences.every((p) => typeof p === "string" && p.trim() !== "")
  ) {
    return res
      .status(400)
      .json({ error: "preferences must be an array of non-empty strings" });
  }

  try {
    const cleaned = [...new Set(preferences.map((p) => p.trim()))];
    const user = await User.updatePreferences(id, cleaned);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Failed to update preferences:", err);
    res.status(500).json({ error: "Failed to update preferences" });
  }
}

async function addPreference(req, res) {
  const id = parseUserId(req, res);
  if (id === null) return;

  const { preference } = req.body;
  if (typeof preference !== "string" || preference.trim() === "") {
    return res
      .status(400)
      .json({ error: "preference must be a non-empty string" });
  }

  try {
    const user = await User.addPreference(id, preference.trim());
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Failed to add preference:", err);
    res.status(500).json({ error: "Failed to add preference" });
  }
}

module.exports = { show, updatePreferences, addPreference };
