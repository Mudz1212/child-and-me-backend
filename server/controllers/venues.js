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

async function addAmenity(req, res) {
  try {
    const venueId = Number(req.params.id);
    const amenityId = Number(req.body.amenity_id);
    const { status } = req.body;

    if (!Number.isInteger(venueId) || !Number.isInteger(amenityId)) {
      return res.status(400).json({
        error: "A valid venue ID and amenity ID are required"
      });
    }

    if (typeof status !== "boolean") {
      return res.status(400).json({
        error: "Status must be true or false"
      });
    }

    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({
        error: "Venue not found"
      });
    }

    const venueAmenity = await Venue.addAmenity(
      venueId,
      amenityId,
      status,
      "User submission"
    );

    return res.status(201).json({
      message: "Venue amenity submitted",
      venueAmenity
    });
  } catch (error) {
    console.error("Venue amenity submission failed:", error);

    return res.status(500).json({
      error: "Failed to submit venue amenity"
    });
  }
}

async function update(req, res) {
  const venue = await Venue.update(req.params.id, req.user.id, req.body);
  if (!venue) return res.status(404).json({ error: "Venue not found or not yours" });
  res.json(venue);
}

module.exports = {
  index,
  show,
  create,
  update,
  importVenues,
  addAmenity
};
