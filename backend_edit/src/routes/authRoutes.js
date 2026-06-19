const express = require("express");
const router = express.Router();
const { registerOwner, loginOwner, deleteMyAccount, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", registerOwner);

// POST /api/auth/login
router.post("/login", loginOwner);

// DELETE /api/auth/me  – owner permanently deletes their own account
router.delete("/me", protect, deleteMyAccount);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
