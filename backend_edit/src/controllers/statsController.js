const Stats = require("../models/Stats");
const Owner = require("../models/Owner");
const Property = require("../models/Property");

// GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await Stats.findById("site_stats");
    const ownerCount = await Owner.countDocuments();
    const propertyCount = await Property.countDocuments({ status: "approved" });

    res.status(200).json({
      visitors: stats ? stats.visitorCount : 0,
      students: stats ? stats.studentCount : 0,
      owners: ownerCount,
      properties: propertyCount,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stats/visit
const trackVisit = async (req, res, next) => {
  try {
    const { isOwner } = req.body;

    const updateQuery = {
      $inc: {
        visitorCount: 1,
        ...(isOwner ? {} : { studentCount: 1 }),
      },
    };

    await Stats.findByIdAndUpdate("site_stats", updateQuery, {
      upsert: true,
      new: true,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, trackVisit };
