/**
 * Generate a Google Maps link from latitude/longitude coordinates.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string} Google Maps URL
 */
const getGoogleMapsUrl = (latitude, longitude) => {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * Attach a mapUrl field to a plain property object (after .toObject() or .lean()).
 * @param {object} property - plain JS object from Mongoose
 * @returns {object} property with mapUrl appended
 */
const attachMapUrl = (property) => {
  return {
    ...property,
    mapUrl: getGoogleMapsUrl(property.latitude, property.longitude),
  };
};

module.exports = { getGoogleMapsUrl, attachMapUrl };
