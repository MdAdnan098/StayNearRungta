const express = require("express");
const router = express.Router();
const { registerOwner, loginOwner, deleteMyAccount } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", registerOwner);

// POST /api/auth/login
router.post("/login", loginOwner);

// DELETE /api/auth/me  – owner permanently deletes their own account
router.delete("/me", protect, deleteMyAccount);

module.exports = router;
