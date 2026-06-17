const Admin = require("../models/Admin");
const Owner = require("../models/Owner");
const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");
const generateToken = require("../utils/generateToken");
const { attachMapUrl } = require("../utils/mapUtils");

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
 * GET /api/admin/status
 * Public – tells the frontend whether an admin account exists yet.
 * Used to show/hide the one-time "Admin Setup" link.
 */
const getAdminStatus = async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();
    res.status(200).json({ adminExists: count > 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/register
 * One-time setup: creates the single admin account.
 * Returns 409 if an admin already exists.
 * Body: { username, password }
 */
const registerAdmin = async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      res.status(409);
      throw new Error("Admin account already exists. Only one admin is allowed.");
    }

    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error("username and password are required");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const admin = await Admin.create({ username, password });

    res.status(201).json({
      message: "Admin account created successfully",
      admin: { _id: admin._id, username: admin.username },
      token: generateToken(admin._id, "admin"),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/login
 * Admin-only login using username + password.
 * Body: { username, password }
 */
const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error("username and password are required");
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    res.status(200).json({
      message: "Admin login successful",
      admin: {
        _id: admin._id,
        username: admin.username,
      },
      token: generateToken(admin._id, "admin"),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/pending
 * Return all properties with status = "pending".
 */
const getPendingProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(properties.map(attachMapUrl));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/approved
 * Return all properties with status = "approved".
 */
const getApprovedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(properties.map(attachMapUrl));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/:id/approve
 * Approve a pending property.
 */
const approveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }

    property.status = "approved";
    await property.save();

    res.status(200).json({
      message: "Property approved successfully",
      property: attachMapUrl(property.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/:id/reject
 * Reject a pending property.
 */
const rejectProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }

    property.status = "rejected";
    await property.save();

    res.status(200).json({
      message: "Property rejected",
      property: attachMapUrl(property.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/:id
 * Admin deletes any property (also removes Cloudinary images).
 */
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }

    // Delete images from Cloudinary
    if (property.photos && property.photos.length > 0) {
      const deletePromises = property.photos.map((url) => {
        const publicId = extractPublicId(url);
        return cloudinary.uploader.destroy(publicId);
      });
      await Promise.allSettled(deletePromises);
    }

    await property.deleteOne();

    res.status(200).json({ message: "Property deleted by admin" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/owners
 * Return all owners along with the list of properties each owner has added.
 */
const getOwners = async (req, res, next) => {
  try {
    const owners = await Owner.find().select("-password").sort({ createdAt: -1 }).lean();
    const properties = await Property.find().sort({ createdAt: -1 }).lean();

    const ownersWithProperties = owners.map((owner) => {
      const ownerProperties = properties
        .filter((p) => p.ownerId.toString() === owner._id.toString())
        .map(attachMapUrl);
      return { ...owner, properties: ownerProperties };
    });

    res.status(200).json(ownersWithProperties);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/owners/:id
 * Admin deletes an owner's account along with all of their properties
 * (and the properties' Cloudinary images).
 */
const deleteOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findById(req.params.id);

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

    res.status(200).json({ message: "Owner and all their properties deleted by admin" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
