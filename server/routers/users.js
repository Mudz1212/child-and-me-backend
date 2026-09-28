const express = require("express");
const controller = require("../controllers/users");
const router = express.Router();

router.get("/:id", controller.show);
router.patch("/:id/preferences", controller.updatePreferences);
router.patch("/:id/preferences/add", controller.addPreference);

module.exports = router;
