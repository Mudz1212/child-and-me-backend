const Amenity = require("../models/Amenity");

async function index(req, res) {
  try {
    const amenities = await Amenity.findAll();
    res.status(200).json(amenities);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve amenities"
    });
  }
}

async function create(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        error: "Amenity name is required"
      });
    }
    const amenity = await Amenity.create(name);
    res.status(201).json(amenity);
    
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create amenity"
    });
  }
}

module.exports = { index, create };
