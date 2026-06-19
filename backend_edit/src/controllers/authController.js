const Owner = require("../models/Owner");
const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");
const generateToken = require("../utils/generateToken");

// ─── Helper: extract Cloudinary public_id from a stored URL ───────────────────
const extractPublicId = (url) => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
  const folder = parts[parts.length - 2];
  const parentFolder = parts[parts.length - 3];
  return `${parentFolder}/${folder}/${nameWithoutExt}`;
};

/**
 * POST /api/auth/register
 * Register a new property owner.
 * Body: { fullName, mobileNumber, password }
 */
const registerOwner = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, password } = req.body;

    if (!fullName || !mobileNumber || !password) {
      res.status(400);
      throw new Error("fullName, mobileNumber, and password are required");
    }

    const exists = await Owner.findOne({ mobileNumber });
    if (exists) {
      res.status(409);
      throw new Error("An account with this mobile number already exists");
    }

    const owner = await Owner.create({ fullName, mobileNumber, password });

    res.status(201).json({
      message: "Account created successfully",
      owner: {
        _id: owner._id,
        fullName: owner.fullName,
        mobileNumber: owner.mobileNumber,
      },
      token: generateToken(owner._id, "owner"),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login an existing owner.
 * Body: { mobileNumber, password }
 */
const loginOwner = async (req, res, next) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      res.status(400);
      throw new Error("mobileNumber and password are required");
    }

    const owner = await Owner.findOne({ mobileNumber });
    if (!owner) {
      res.status(401);
      throw new Error("Invalid mobile number or password");
    }

    const isMatch = await owner.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid mobile number or password");
    }

    res.status(200).json({
      message: "Login successful",
      owner: {
        _id: owner._id,
        fullName: owner.fullName,
        mobileNumber: owner.mobileNumber,
      },
      token: generateToken(owner._id, "owner"),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/auth/me
 * Owner permanently deletes their own account, along with all of their
 * properties (and the properties' Cloudinary images).
 * Protected route – requires a valid owner JWT.
 */
const deleteMyAccount = async (req, res, next) => {
  try {
    const owner = await Owner.findById(req.owner._id);

    if (!owner) {
      res.status(404);
      throw new Error("Owner not found");
    }

    const ownerProperties = await Property.find({ ownerId: owner._id });

    // Delete each property's Cloudinary images
    for (const property of ownerProperties) {
      if (property.photos && property.photos.length > 0) {
        const deletePromises = property.photos.map((url) => {
          const publicId = extractPublicId(url);
          return cloudinary.uploader.destroy(publicId);
        });
        await Promise.allSettled(deletePromises);
      }
    }

    // Delete all properties belonging to this owner
    await Property.deleteMany({ ownerId: owner._id });

    // Delete the owner account itself
    await owner.deleteOne();

    res.status(200).json({ message: "Your account and all your properties have been deleted" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { mobileNumber, newPassword } = req.body;

    if (!mobileNumber || !newPassword) {
      res.status(400);
      throw new Error("mobileNumber and newPassword are required");
    }

    const owner = await Owner.findOne({ mobileNumber });
    if (!owner) {
      res.status(404);
      throw new Error("No account found with this mobile number");
    }

    owner.password = newPassword;
    await owner.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerOwner, loginOwner, deleteMyAccount, resetPassword };
