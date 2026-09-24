const express = require("express");
const controller = require("../controllers/venues");
const { requireAuth, requireRole } = require("../middleware/auth");
const router = express.Router();
router.get("/", controller.index);
router.post(
  "/import",
  requireAuth,
  requireRole("admin"),
  controller.importVenues,
);
router.get("/:id", controller.show);
router.post("/", requireAuth, controller.create);
router.put("/:id", requireAuth, controller.update);
router.patch("/:id", requireAuth, controller.patch);
module.exports = router;
