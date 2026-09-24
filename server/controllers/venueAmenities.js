const VenueAmenity = require("../models/VenueAmenity.js");


async function index(req, res) {
    try {
        const venueAmenities = await VenueAmenity.getAll();

        res.status(200).json(venueAmenities);
    } catch (error) {
        console.error(error);

        res.status(500).json({
        error: "Failed to retrieve venue amenities"
        });
    }
}

async function create(req, res) {
  try {
    const { venue_id, amenity_id } = req.body;

    if (!venue_id || !amenity_id) {
      return res.status(400).json({
        error: "venue_id and amenity_id are required"
      });
    }

    const venueAmenity = await VenueAmenity.create(venue_id, amenity_id);

    res.status(201).json(venueAmenity);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create venue amenity"
    });
  }


}

module.exports = { index, create }