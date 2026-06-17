const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");
const { attachMapUrl } = require("../utils/mapUtils");

// ─── Helper: extract Cloudinary public_id from a stored URL ───────────────────
const extractPublicId = (url) => {
  // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<id>.<ext>
  const parts = url.split("/");
  const filename = parts[parts.length - 1]; // e.g. "abc123.jpg"
  const nameWithoutExt = filename.replace(/\.[^.]+$/, ""); // "abc123"
  const folder = parts[parts.length - 2]; // e.g. "properties"
  const parentFolder = parts[parts.length - 3]; // e.g. "staynearrungta"
  return `${parentFolder}/${folder}/${nameWithoutExt}`;
};

// ─── Helper: parse a checkbox value coming from multipart/form-data ───────────
// FormData always sends booleans as the strings "true"/"false" (or omits the
// field entirely) — never as a real boolean — so normalise that here.
const parseBool = (v) => v === true || v === "true" || v === "on";

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * GET /api/properties
 * Return all approved properties. Optional query: ?category=Boys|Girls
 */
const getApprovedProperties = async (req, res, next) => {
  try {
    const filter = { status: "approved" };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const withMap = properties.map(attachMapUrl);
    res.status(200).json(withMap);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties/:id
 * Return a single property by ID.
 * - Public/anonymous requests: only approved properties are returned.
 * - Logged-in owner viewing their OWN property: any status is returned
 *   (so the owner can view pending/rejected listings, e.g. from the dashboard).
 * - Logged-in admin: any status is returned
 *   (so the admin can view pending listings before approving them).
 */
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).lean();

    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }

    const isOwnerOfThisProperty =
      req.owner && property.ownerId.toString() === req.owner._id.toString();
    const isAdmin = !!req.admin;

    if (property.status !== "approved" && !isOwnerOfThisProperty && !isAdmin) {
      res.status(404);
      throw new Error("Property not found or not yet approved");
    }

    res.status(200).json(attachMapUrl(property));
  } catch (error) {
    next(error);
  }
};

// ─── Owner ────────────────────────────────────────────────────────────────────

/**
 * GET /api/properties/my
 * Return all properties belonging to the logged-in owner.
 */
const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ ownerId: req.owner._id })
      .sort({ createdAt: -1 })
      .lean();

    const withMap = properties.map(attachMapUrl);
    res.status(200).json(withMap);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/properties
 * Create a new property listing (status = pending).
 * Body fields: propertyName, rent, ownerName, phoneNumber, category, description, address, latitude, longitude
 * Files: photos (up to 10 images via multer/Cloudinary)
 */
const createProperty = async (req, res, next) => {
  try {
    const {
      propertyName,
      rent,
      ownerName,
      phoneNumber,
      alternateNumber,
      category,
      description,
      address,
      latitude,
      longitude,
      hasCooler,
      attachedBathroom,
      isIndependent,
      electricityIncluded,
      bedGaddaTakiyaProvided,
    } = req.body;

    if (!propertyName || !rent || !ownerName || !phoneNumber || !category || !address) {
      res.status(400);
      throw new Error(
        "propertyName, rent, ownerName, phoneNumber, category, and address are required"
      );
    }

    if (latitude == null || latitude === "" || longitude == null || longitude === "") {
      res.status(400);
      throw new Error(
        "latitude and longitude are required – use the Get Current Location button before submitting"
      );
    }

    // Collect Cloudinary URLs from uploaded files
    const photos = req.files ? req.files.map((f) => f.path) : [];

    const property = await Property.create({
      propertyName,
      rent: Number(rent),
      ownerName,
      phoneNumber,
      alternateNumber: alternateNumber || "",
      category,
      description: description || "",
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      photos,
      status: "pending",
      ownerId: req.owner._id,
      hasCooler: parseBool(hasCooler),
      attachedBathroom: parseBool(attachedBathroom),
      isIndependent: parseBool(isIndependent),
      electricityIncluded: parseBool(electricityIncluded),
      bedGaddaTakiyaProvided: parseBool(bedGaddaTakiyaProvided),
    });

    res.status(201).json({
      message: "Property submitted successfully. Awaiting admin approval.",
      property: attachMapUrl(property.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/properties/:id
 * Update an existing property owned by the logged-in owner.
 * New photos are appended (total capped at 10).
 */
const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }

    if (property.ownerId.toString() !== req.owner._id.toString()) {
      res.status(403);
      throw new Error("Not authorised to edit this property");
    }

    const {
      propertyName,
      rent,
      ownerName,
      phoneNumber,
      alternateNumber,
      category,
      description,
      address,
      latitude,
      longitude,
      hasCooler,
      attachedBathroom,
      isIndependent,
      electricityIncluded,
      bedGaddaTakiyaProvided,
    } = req.body;

    // retainPhotos = array of existing URLs owner wants to keep
    // If sent, use it as base; otherwise keep all existing photos
    let photos = property.photos;
    if (req.body.retainPhotos !== undefined) {
      const retain = Array.isArray(req.body.retainPhotos)
        ? req.body.retainPhotos
        : [req.body.retainPhotos];

      // Delete removed photos from Cloudinary
      const removed = property.photos.filter((url) => !retain.includes(url));
      if (removed.length > 0) {
        await Promise.allSettled(
          removed.map((url) =>
            cloudinary.uploader.destroy(extractPublicId(url))
          )
        );
      }

      photos = retain;
    }

    // Merge new uploaded photos with retained ones (cap at 10)
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((f) => f.path);
      photos = [...photos, ...newUrls].slice(0, 10);
    }

    if (propertyName !== undefined) property.propertyName = propertyName;
    if (rent !== undefined) property.rent = Number(rent);
    if (ownerName !== undefined) property.ownerName = ownerName;
    if (phoneNumber !== undefined) property.phoneNumber = phoneNumber;
    if (alternateNumber !== undefined) property.alternateNumber = alternateNumber;
    if (category !== undefined) property.category = category;
    if (description !== undefined) property.description = description;
    if (address !== undefined) property.address = address;
    if (latitude !== undefined) property.latitude = Number(latitude);
    if (longitude !== undefined) property.longitude = Number(longitude);
    if (hasCooler !== undefined) property.hasCooler = parseBool(hasCooler);
    if (attachedBathroom !== undefined) property.attachedBathroom = parseBool(attachedBathroom);
    if (isIndependent !== undefined) property.isIndependent = parseBool(isIndependent);
    if (electricityIncluded !== undefined) property.electricityIncluded = parseBool(electricityIncluded);
    if (bedGaddaTakiyaProvided !== undefined) property.bedGaddaTakiyaProvided = parseBool(bedGaddaTakiyaProvided);
    property.photos = photos;

    // ── KEY LOGIC ──────────────────────────────────────────────────────────────
    // Agar property pehle se approved hai to edit ke baad bhi approved hi rahegi.
    const updated = await property.save();
    const isApproved = updated.status === "approved";
    res.status(200).json({
      message: isApproved
        ? "Property updated successfully."
        : "Property updated and sent for review.",
      property: attachMapUrl(updated.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/properties/:id
 * Delete a property and its Cloudinary images.
 */
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }

    if (property.ownerId.toString() !== req.owner._id.toString()) {
      res.status(403);
      throw new Error("Not authorised to delete this property");
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

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};
