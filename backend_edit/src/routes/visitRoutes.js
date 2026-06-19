const express = require("express");
const router = express.Router();
const { recordVisit, getVisits, deleteVisit, deleteAllVisits } = require("../controllers/visitController");
const { protectAdmin } = require("../middleware/adminMiddleware");

router.post("/", recordVisit);
router.get("/", protectAdmin, getVisits);
router.delete("/all", protectAdmin, deleteAllVisits);
router.delete("/:id", protectAdmin, deleteVisit);

module.exports = router;
