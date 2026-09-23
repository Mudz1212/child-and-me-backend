const express = require("express");
const controller = require("../controllers/geoapify");
const router = express.Router();

router.get("/:geoapifyPlaceId", controller.show);

module.exports = router;
