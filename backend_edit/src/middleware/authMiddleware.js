const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");
const Admin = require("../models/Admin");

/**
 * Protect owner routes.
 * Expects: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised – no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "owner") {
      return res.status(403).json({ message: "Access denied – not an owner account" });
    }

    const owner = await Owner.findById(decoded.id).select("-password");
    if (!owner) {
      return res.status(401).json({ message: "Owner not found" });
    }

    req.owner = owner;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorised – invalid token" });
  }
};

/**
 * Optional auth – does NOT block the request if no/invalid token is present.
 * If a valid owner or admin token is provided, attaches req.owner or req.admin
 * so downstream controllers can grant extra access (e.g. viewing a pending
 * property that belongs to the logged-in owner, or to an admin).
 * Used for routes that are public but want to recognise a logged-in user.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "owner") {
      const owner = await Owner.findById(decoded.id).select("-password");
      if (owner) req.owner = owner;
    } else if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (admin) req.admin = admin;
    }
  } catch (error) {
    // Invalid/expired token on a public route – ignore and continue as guest
  }

  next();
};

module.exports = { protect, optionalAuth };
