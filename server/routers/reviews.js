const express = require("express");
const controller = require("../controllers/reviews");
const { requireAuth } = require("../middleware/auth");
const router = express.Router({ mergeParams: true });

router.get("/", controller.index);
router.post("/", requireAuth, controller.create);
router.delete("/:reviewId", requireAuth, controller.deleteReview);
module.exports = router;
