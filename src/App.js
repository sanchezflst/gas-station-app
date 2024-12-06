import React, { useEffect, useState } from "react";
import axios from "axios";

// Haversine Formula to calculate the distance between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const toRad = (x) => (x * Math.PI) / 180; // Convert degrees to radians

  const deltaLat = toRad(lat2 - lat1);
  const deltaLon = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};

function App() {
  const [gasStations, setGasStations] = useState([]); // List of gas stations
  const [userLat, setUserLat] = useState(""); // User's latitude
  const [userLon, setUserLon] = useState(""); // User's longitude
  const [sortedStations, setSortedStations] = useState([]); // Sorted gas stations by distance
  const [filterName, setFilterName] = useState(""); // Search filter for gas station name
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Fetch gas station data from the provided URL (can be a proxy if CORS is an issue)
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.allorigins.win/get?url=" +
            encodeURIComponent(
              "https://opendata.alcoi.org/data/dataset/eaa35b18-783f-425f-be0d-e469188b487e/resource/fb583582-0a7b-4ae1-a515-dd01d094cf72/download/gasolineras.geojson"
            )
        );
        const data = JSON.parse(response.data.contents);
        setGasStations(data.features);
      } catch (err) {
        setError("Error loading gas stations.");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLocationSubmit = (e) => {
    e.preventDefault();

    if (userLat && userLon) {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);

      // Calculate the distances and sort the stations
      const stationsWithDistances = gasStations.map((station) => {
        // Extract the coordinates (GeoJSON format: [lon, lat])
        const stationLon = station.geometry.coordinates[0][0];
        const stationLat = station.geometry.coordinates[0][1];

        // Calculate distance using Haversine formula
        const distance = haversineDistance(lat, lon, stationLat, stationLon);

        return { ...station, distance };
      });

      // Sort the stations by distance (closest first)
      const sortedByDistance = stationsWithDistances.sort(
        (a, b) => a.distance - b.distance
      );

      setSortedStations(sortedByDistance);
    } else {
      alert("Please enter a valid latitude and longitude.");
    }
  };

  const handleSearchChange = (e) => {
    setFilterName(e.target.value); // Update the search filter
  };

  const renderGasStation = (station) => {
    return (
      <div key={station.properties.id} style={styles.stationCard}>
        <h3>{station.properties.nombre}</h3>
        <p>
          <strong>Teléfono:</strong> {station.properties.telefono || "N/A"}
        </p>
        <p>
          <strong>Dirección:</strong> {station.properties.direccion}
        </p>
        <p>
          <strong>Distancia:</strong> {station.distance.toFixed(2)} km
        </p>
        <p>
          <strong>Coordenadas:</strong>{" "}
          {station.geometry.coordinates[0][0]}, {station.geometry.coordinates[0][1]}
        </p>
      </div>
    );
  };

  // Filter stations by name
  const filteredStations = sortedStations.filter((station) =>
    station.properties.nombre.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div style={styles.app}>
      <h1>Gasolineras en Alcoi</h1>
      <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStQ0SQ1Bg7mO4toLntO7O812ApmscLk5A4UQ&s"
          alt="Estación de servicio"
          style={{ width: '100px', height: '60px' }}
        />

      {loading && <p style={styles.loading}>Cargando...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {/* User location form */}
      <div style={styles.locationForm}>
        <h3>Ingresa tu ubicación:</h3>
        <form onSubmit={handleLocationSubmit}>
          <div style={styles.formGroup}>
            <label>
              Latitud:
              <input
                type="number"
                value={userLat}
                onChange={(e) => setUserLat(e.target.value)}
                required
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.formGroup}>
            <label>
              Longitud:
              <input
                type="number"
                value={userLon}
                onChange={(e) => setUserLon(e.target.value)}
                required
                style={styles.input}
              />
            </label>
          </div>
          <button type="submit" style={styles.submitButton}>
            Buscar estaciones más cercanas
          </button>
        </form>
      </div>

      {/* Search by name */}
      <div style={styles.searchBox}>
        <h3>Buscar por nombre:</h3>
        <input
          type="text"
          value={filterName}
          onChange={handleSearchChange}
          placeholder="Escribe el nombre de la estación"
          style={styles.input}
        />
      </div>

      {/* Display the sorted and filtered stations */}
      <div style={styles.stationList}>
        {filteredStations.length > 0 ? (
          filteredStations.map(renderGasStation)
        ) : (
          <p>No hay estaciones disponibles.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f9",
    padding: "20px",
    textAlign: "center",
  },
  loading: {
    color: "#ff0000",
  },
  error: {
    color: "#ff0000",
  },
  locationForm: {
    marginBottom: "20px",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  formGroup: {
    marginBottom: "10px",
  },
  input: {
    width: "200px",
    padding: "10px",
    marginTop: "5px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  submitButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  searchBox: {
    marginBottom: "20px",
  },
  stationList: {
    marginTop: "20px",
    textAlign: "left",
    display: "inline-block",
    maxWidth: "600px",
  },
  stationCard: {
    backgroundColor: "#ffffff",
    padding: "20px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
};

export default App;
