const express = require("express");
const controller = require("../../controllers/venues");
const { requireAuth } = require("../../middleware/auth");
const router = express.Router();
router.get("/", controller.index);
router.get("/:id", controller.show);
router.post("/", requireAuth, controller.create);
router.put("/:id", requireAuth, controller.update);
module.exports = router;
