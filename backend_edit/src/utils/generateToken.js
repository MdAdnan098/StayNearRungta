const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for the given id and role.
 * @param {string} id   - MongoDB ObjectId of the user
 * @param {string} role - "owner" | "admin"
 * @returns {string} signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
