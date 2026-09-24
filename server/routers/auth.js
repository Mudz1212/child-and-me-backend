const express = require("express");
const controller = require("../controllers/auth");
const { requireAuth, requireRole } = require("../middleware/auth");
const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), controller.index);
router.post("/register", controller.register);
router.post("/login", controller.login);

module.exports = router;
