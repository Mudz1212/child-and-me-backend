const express = require("express");
const controller = require("../controllers/users");
const reviewsController = require("../controllers/reviews");
const favouritesController = require("../controllers/favourites");
const router = express.Router();

router.get("/:id", controller.show);
router.patch("/:id/preferences", controller.updatePreferences);
router.patch("/:id/preferences/add", controller.addPreference);
router.get("/:id/reviews", reviewsController.indexByUser);

router.get("/:id/favourites", favouritesController.index);
router.post("/:id/favourites/:geoapifyPlaceId", favouritesController.add);
router.delete("/:id/favourites/:geoapifyPlaceId", favouritesController.remove);

module.exports = router;
