const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
