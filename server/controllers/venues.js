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

async function update(req, res) {
  const venue = await Venue.update(req.params.id, req.user.id, req.body);
  if (!venue) return res.status(404).json({ error: "Venue not found or not yours" });
  res.json(venue);
}

module.exports = { index, show, create, update };
