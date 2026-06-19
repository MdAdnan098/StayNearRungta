const express = require("express");
const router = express.Router();
const { recordVisit, getVisits } = require("../controllers/visitController");
const { protectAdmin } = require("../middleware/adminMiddleware");

router.post("/", recordVisit);
router.get("/", protectAdmin, getVisits);

module.exports = router;
