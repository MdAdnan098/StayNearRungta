const Visit = require("../models/Visit");

// POST /api/visits — save a visitor's location
const recordVisit = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      res.status(400);
      throw new Error("latitude and longitude are required numbers");
    }

    const visit = await Visit.create({ latitude, longitude });
    res.status(201).json(visit);
  } catch (error) {
    next(error);
  }
};

// GET /api/visits — list all visitor locations (admin)
const getVisits = async (req, res, next) => {
  try {
    const visits = await Visit.find().sort({ createdAt: -1 });
    res.status(200).json(visits);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/visits/:id — delete a single visit
const deleteVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) {
      res.status(404);
      throw new Error("Visit not found");
    }
    res.status(200).json({ message: "Visit deleted" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/visits — delete all visits
const deleteAllVisits = async (req, res, next) => {
  try {
    await Visit.deleteMany({});
    res.status(200).json({ message: "All visits deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { recordVisit, getVisits, deleteVisit, deleteAllVisits };
