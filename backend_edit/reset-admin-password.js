/**
 * Run this script ONCE to reset the admin password.
 * Usage:  node reset-admin-password.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./src/models/Admin");

const NEW_PASSWORD = "AdnanXadmin";

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const admin = await Admin.findOne({ username: "admin" });

    if (!admin) {
      console.error('No admin found with username "admin". Create the admin account first via /api/admin/register.');
      process.exit(1);
    }

    admin.password = NEW_PASSWORD; // pre-save hook will hash it automatically
    await admin.save();

    console.log('Password for "admin" updated to "AdnanXadmin" successfully.');
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
