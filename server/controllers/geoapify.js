const Geoapify = require("../models/Geoapify");

async function show(req, res) {
  const venue = await Geoapify.findByPlaceId(req.params.geoapifyPlaceId);
  if (!venue) {
    return res
      .status(404)
      .json({ error: "No venue found for that geoapify_place_id" });
  }
  res.json(venue);
}

module.exports = { show };
