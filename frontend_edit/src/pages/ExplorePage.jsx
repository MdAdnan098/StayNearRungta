import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import AmenityFilterPanel, { AMENITY_OPTIONS } from "../components/AmenityFilterPanel.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const EMPTY_AMENITY_FILTERS = AMENITY_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.key]: false }),
  {}
);

const ExplorePage = () => {
  const { t } = useTheme();
  const [filter, setFilter] = useState("all");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amenityFilters, setAmenityFilters] = useState(EMPTY_AMENITY_FILTERS);
  const [debugMsg, setDebugMsg] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      setDebugMsg("Requesting location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDebugMsg(`Got location: ${position.coords.latitude}, ${position.coords.longitude}. Sending...`);
          fetch(`${API}/api/visits`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          })
            .then((res) => setDebugMsg(`Visit tracked! Status: ${res.status}`))
            .catch((err) => setDebugMsg(`Visit tracking FAILED: ${err.message}`));
        },
        (err) => setDebugMsg(`Geolocation ERROR code ${err.code}: ${err.message}`),
        { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
      );
    } else {
      setDebugMsg("Geolocation not supported by this browser");
    }
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const query =
          filter === "all" ? "" : `?category=${filter === "boys" ? "Boys" : "Girls"}`;
        const res = await fetch(`${API}/api/properties${query}`);
        const data = await res.json();
        if (res.ok) setProperties(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [filter]);

  const handleAmenityChange = (key, val) =>
    setAmenityFilters((prev) => ({ ...prev, [key]: val }));

  const clearAmenityFilters = () => setAmenityFilters(EMPTY_AMENITY_FILTERS);

  const amenityFiltersActive = Object.values(amenityFilters).some(Boolean);

  // A property passes only if every checked amenity filter is true on it.
  const filteredProperties = properties.filter((p) =>
    Object.entries(amenityFilters).every(([key, val]) => !val || p[key] === true)
  );

  return (
    <MainLayout>
      <div className="section-sm">
        <div className="container">
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: t.textMuted,
                marginBottom: 12,
              }}
            >
              Bhilai · Near Rungta College
            </div>
            <h2 style={{ marginBottom: 8 }}>Explore PGs</h2>
            <p style={{ color: t.textSub, fontSize: "0.9rem" }}>
              All listings are posted by property owners directly.
            </p>
          </div>

          {/* Category tabs + Amenity filter */}
          <div
            style={{
              marginBottom: 36,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <FilterTabs value={filter} onChange={setFilter} />
            <AmenityFilterPanel
              filters={amenityFilters}
              onChange={handleAmenityChange}
              onClear={clearAmenityFilters}
            />
          </div>

          {/* Property grid or empty state */}
          {loading ? (
            <div style={{ color: t.textMuted, padding: "40px 0" }}>Loading...</div>
          ) : properties.length === 0 ? (
            <EmptyState
              title="No PGs Available Yet"
              description={
                "We're just getting started.\n\nProperty owners can add their PGs and hostels,\nand they will appear here automatically."
              }
              action={
                <a href="#/owner/register" className="btn btn-outline">
                  Add Your Property
                </a>
              }
            />
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              title="Filters se koi match nahi mila"
              description={
                "Aapke chune gaye filters se koi property match nahi hui.\n\nFilters hata kar dobara try karein."
              }
              action={
                amenityFiltersActive ? (
                  <button onClick={clearAmenityFilters} className="btn btn-outline">
                    Filters Clear Karo
                  </button>
                ) : null
              }
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {filteredProperties.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ExplorePage;

