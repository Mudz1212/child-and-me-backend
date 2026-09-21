const Amenity = require("../models/Amenity");

async function index(req, res) {
  res.json(await Amenity.findAll());
}

module.exports = { index };
