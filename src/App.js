import React, { useEffect, useState } from "react";
import axios from "axios";
import gasStationsData from "./gasStationsData.json"; // Import the local JSON data

// Fórmula de Haversine para calcular la distancia entre dos coordenadas (en kilómetros)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const toRad = (x) => (x * Math.PI) / 180; // Convertir grados a radianes

  const deltaLat = toRad(lat2 - lat1);
  const deltaLon = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en km
};

function App() {
  const [gasStations, setGasStations] = useState([]); // Lista de estaciones de servicio
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error
  const [userLat, setUserLat] = useState(""); // Latitud del usuario
  const [userLon, setUserLon] = useState(""); // Longitud del usuario
  const [sortedStations, setSortedStations] = useState([]); // Estaciones ordenadas por proximidad
  const [filterName, setFilterName] = useState(""); // Filtro por nombre de estación

  useEffect(() => {
    const fetchGasStations = async () => {
      try {
        // Usar el proxy de CORS Anywhere para evitar restricciones de CORS
        const proxyUrl = "https://cors-anywhere.herokuapp.com/";
        const targetUrl = "https://opendata.alcoi.org/data/dataset/eaa35b18-783f-425f-be0d-e469188b487e/resource/fb583582-0a7b-4ae1-a515-dd01d094cf72/download/gasolineras.geojson";

        const response = await axios.get(proxyUrl + targetUrl);
        setGasStations(response.data.features);
        setLoading(false);
      } catch (err) {
        setError(err);
        console.error("Error fetching data:", err);
        
        // Cargar datos locales si la solicitud falla
        setGasStations(gasStationsData.features); // Usar el archivo JSON local
        setLoading(false);
      }
    };

    fetchGasStations();
  }, []);

  const handleLocationSubmit = (e) => {
    e.preventDefault();

    if (userLat && userLon) {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);

      // Calcular las distancias y ordenar las estaciones
      const stationsWithDistances = gasStations.map((station) => {
        const stationLat = station.geometry.coordinates[0][1];
        const stationLon = station.geometry.coordinates[0][0];
        const distance = haversineDistance(lat, lon, stationLat, stationLon);

        return {
          ...station,
          distance, // Agregar distancia al objeto de la estación
        };
      });

      // Ordenar estaciones por distancia (más cercanas primero)
      const sortedByDistance = stationsWithDistances.sort((a, b) => a.distance - b.distance);

      setSortedStations(sortedByDistance); // Establecer las estaciones ordenadas
    } else {
      alert("Por favor ingrese una latitud y longitud válidas.");
    }
  };

  const handleSearchChange = (e) => {
    setFilterName(e.target.value); // Actualizar el nombre del filtro
  };

  const renderGasStation = (station) => {
    return (
      <div key={station.properties.id} style={styles.stationCard}>
        <h3>{station.properties.nombre}</h3>
        <p><strong>Teléfono:</strong> {station.properties.telefono ? station.properties.telefono : "N/A"}</p>
        <p><strong>Dirección:</strong> {station.properties.direccion}</p>
        <p><strong>Distancia:</strong> {station.distance.toFixed(2)} km</p>
        <p><strong>Coordenadas:</strong> {station.geometry.coordinates[0][0]}, {station.geometry.coordinates[0][1]}</p>
      </div>
    );
  };

  // Filtrar estaciones por nombre
  const filteredStations = sortedStations.filter((station) =>
    station.properties.nombre.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1>Gasolineras en Alcoi, Alicante</h1>
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStQ0SQ1Bg7mO4toLntO7O812ApmscLk5A4UQ&s"
          alt="Estación de servicio" 
          style={{ width: '100px', height: '60px' }}
        />
      </div>

      {loading && <p style={styles.loading}>Cargando información...</p>}
      {error && <p style={styles.error}>Error al cargar los datos: {error.message}</p>}

      {/* Formulario para ingresar la ubicación del usuario */}
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
          <button type="submit" style={styles.submitButton}>Buscar estaciones más cercanas</button>
        </form>
      </div>

      {/* Filtro por nombre de estación */}
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

      {/* Mostrar estaciones ordenadas por proximidad */}
      <div style={styles.stationList}>
        {filteredStations.length > 0 ? (
          filteredStations.map((station) => renderGasStation(station))
        ) : (
          <p>No hay estaciones de servicio disponibles o no ha ingresado su ubicación.</p>
        )}
      </div>
    </div>
  );
}

// Estilos en línea
const styles = {
  app: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f9",
    padding: "20px",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#004d99",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  gasStationImage: {
    width: "100%",
    height: "auto",
    maxWidth: "600px",
    borderRadius: "10px",
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
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  stationList: {
    marginTop: "20px",
  },
  stationCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    margin: "10px auto",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    width: "80%",
    textAlign: "left",
  },
  searchBox: {
    marginTop: "20px",
  },
};

export default App;
