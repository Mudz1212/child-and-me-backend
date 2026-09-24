const Venue = require("../models/Venue");

async function index(req, res) {
  const { amenity, age, postcode } = req.query;
  res.json(await Venue.findAll({ amenity, age, postcode }));
}

async function show(req, res) {
  const venue = await Venue.findById(req.params.id);
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  res.json(venue);
}

async function create(req, res) {
  const venue = await Venue.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json(venue);
}

async function importVenues(req, res) {
  try {
    const venues = req.body;

    if (!Array.isArray(venues)) {
      return res.status(400).json({
        error: "Request body must be an array of venues"
      });
    }

    const result = await Venue.seed(venues);

    res.status(201).json({
      message: "Venue import complete",
      processed: venues.length,
      imported: result.length
    });

  } catch (error) {
    console.error("Venue import failed:", error);

    res.status(500).json({
      error: "Failed to import venues"
    });
  }
}

async function update(req, res) {
  const venue = await Venue.update(req.params.id, req.user.id, req.body);
  if (!venue) return res.status(404).json({ error: "Venue not found or not yours" });
  res.json(venue);
}

module.exports = { index, show, create, update, importVenues };