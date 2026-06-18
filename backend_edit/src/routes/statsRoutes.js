const express = require("express");
const router = express.Router();
const { getStats, trackVisit } = require("../controllers/statsController");

router.get("/", getStats);
router.post("/visit", trackVisit);

module.exports = router;
