const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  registerAdmin,
  getAdminStatus,
  getPendingProperties,
  getApprovedProperties,
  approveProperty,
  rejectProperty,
  deleteProperty,
  getOwners,
  deleteOwner,
  updateOwner,
  updatePropertyAsAdmin,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/adminMiddleware");

// GET /api/admin/status  – public, tells frontend if an admin exists yet
router.get("/status", getAdminStatus);

// POST /api/admin/register  – one-time only; blocked if admin already exists
router.post("/register", registerAdmin);

// POST /api/admin/login  (public)
router.post("/login", loginAdmin);

// All routes below require a valid admin JWT
router.get("/pending", protectAdmin, getPendingProperties);
router.get("/approved", protectAdmin, getApprovedProperties);
router.patch("/:id/approve", protectAdmin, approveProperty);
router.patch("/:id/reject", protectAdmin, rejectProperty);
router.delete("/:id", protectAdmin, deleteProperty);

// Owners management – IMPORTANT: declared before "/:id" routes would clash,
// but since these use the "/owners" prefix they are unambiguous either way.
router.get("/owners", protectAdmin, getOwners);
router.put("/owners/:id", protectAdmin, updateOwner);
router.delete("/owners/:id", protectAdmin, deleteOwner);
router.put("/properties/:id", protectAdmin, updatePropertyAsAdmin);

module.exports = router;
