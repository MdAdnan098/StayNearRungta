import { useTheme } from "../context/ThemeContext.jsx";

const PropertyCard = ({ property, adminActions }) => {
  const { t } = useTheme();
  const typeLower = property.category ? property.category.toLowerCase() : "";

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {property.photos && property.photos.length > 0 ? (
        <img
          src={property.photos[0]}
          alt={property.propertyName}
          style={{ height: 160, width: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            height: 160,
            background: t.bgSub,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: t.textMuted,
            fontSize: "0.8rem",
          }}
        >
          No Photo
        </div>
      )}
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          <h4>{property.propertyName}</h4>
          <span className={`badge badge-${typeLower}`}>{property.category}</span>
        </div>
        <div style={{ fontSize: "0.85rem", color: t.textSub, marginBottom: 4 }}>
          {property.address}
        </div>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}>
          Rs. {property.rent}/month
        </div>

        {adminActions ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={`#/property/${property._id}`} className="btn btn-outline btn-sm">
              View
            </a>
            <button className="btn btn-success btn-sm">Approve</button>
            <button className="btn btn-danger btn-sm">Reject</button>
          </div>
        ) : (
          <a href={`#/property/${property._id}`} className="btn btn-outline btn-sm">
            View Details
          </a>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
