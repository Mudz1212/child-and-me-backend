const Review = require("../models/Review");
const Geoapify = require("../models/Geoapify_id");

async function index(req, res) {
  try {
    const venue = await Geoapify.findByPlaceId(req.params.geoapifyPlaceId);
    if (!venue) return res.status(404).json({ error: "Venue not found" });

    res.json(await Review.findByVenue(venue.id));
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

async function create(req, res) {
  try {
    const venue = await Geoapify.findByPlaceId(req.params.geoapifyPlaceId);
    if (!venue) return res.status(404).json({ error: "Venue not found" });

    const { rating, comment } = req.body;
    const review = await Review.create({
      venueId: venue.id,
      userId: req.user.id,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (err) {
    console.error("Failed to create review:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
}

module.exports = { index, create };
