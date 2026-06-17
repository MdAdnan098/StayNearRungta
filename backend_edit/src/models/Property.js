const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    rent: {
      type: Number,
      required: [true, "Rent amount is required"],
      min: [0, "Rent cannot be negative"],
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    alternateNumber: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          return v === "" || /^\d{10}$/.test(v);
        },
        message: "Alternate number must be exactly 10 digits",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Boys", "Girls"],
        message: 'Category must be either "Boys" or "Girls"',
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required – use the Get Current Location button"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required – use the Get Current Location button"],
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Maximum 10 photos allowed per property",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // ─── Amenities / Facilities (owner-provided) ───────────────────────────
    hasCooler: {
      type: Boolean,
      default: false,
    },
    attachedBathroom: {
      type: Boolean,
      default: false,
    },
    isIndependent: {
      type: Boolean,
      default: false,
    },
    electricityIncluded: {
      type: Boolean,
      default: false,
    },
    bedGaddaTakiyaProvided: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
