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

async function indexByUser(req, res) {
  const userId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    res.json(await Review.findByUser(userId));
  } catch (err) {
    console.error("Failed to fetch user's reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

async function deleteReview(req, res) {
  const reviewId = Number.parseInt(req.params.reviewId, 10);
  if (!Number.isInteger(reviewId)) {
    return res.status(400).json({ error: "Invalid review id" });
  }

  try {
    const review = await Review.delete(reviewId, req.user.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found or not yours" });
    }
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Failed to delete review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
}
module.exports = { index, create, indexByUser, deleteReview };
