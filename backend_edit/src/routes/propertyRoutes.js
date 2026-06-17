const express = require("express");
const router = express.Router();
const {
  getApprovedProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ─── Owner (protected) ────────────────────────────────────────────────────────
// IMPORTANT: /my must be declared before /:id so Express matches it correctly
router.get("/my", protect, getMyProperties);

router.post("/", protect, upload.array("photos", 10), createProperty);

router.put("/:id", protect, upload.array("photos", 10), updateProperty);

router.delete("/:id", protect, deleteProperty);

// ─── Public ───────────────────────────────────────────────────────────────────
router.get("/", getApprovedProperties);

router.get("/:id", optionalAuth, getPropertyById);

module.exports = router;
