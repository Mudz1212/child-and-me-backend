const Review = require("../models/Review");

async function index(req, res) {
  res.json(await Review.findByVenue(req.params.venueId));
}

async function create(req, res) {
  const { rating, comment } = req.body;
  const review = await Review.create({ venueId: req.params.venueId, userId: req.user.id, rating, comment });
  res.status(201).json(review);
}

module.exports = { index, create };
