import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import coffee from "../../public/coffee.png";

const coffeeIcon = L.icon({
  iconUrl: coffee,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});


const Map = () => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const cafeMarkers = useRef([]);

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = L.map(mapContainer.current).setView([0, 0], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance.current);

    getUserLocation();

    return () => {
      mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, []);

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Remove old marker
        if (userMarker.current) {
          userMarker.current.remove();
        }

        userMarker.current = L.marker([latitude, longitude])
          .addTo(mapInstance.current)
          .bindPopup("You are here")
          .openPopup();

        mapInstance.current.setView([latitude, longitude], 14);

        fetchNearbyCafes(latitude, longitude);
      },
      (error) => {
        console.error("Location error:", error);
      }
    );
  };

  const fetchNearbyCafes = async (lat, lon) => {
    // Clear old cafe markers
    cafeMarkers.current.forEach((marker) => marker.remove());
    cafeMarkers.current = [];

    const query = `
      [out:json];
      node
        ["amenity"="cafe"]
        (around:1000, ${lat}, ${lon});
      out;
    `;

    const url = "https://overpass-api.de/api/interpreter";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: query,
      });

      const data = await response.json();

      data.elements.forEach((place) => {
        const name = place.tags?.name || "Coffee Shop";

        const marker = L.marker([place.lat, place.lon], { icon: coffeeIcon })
          .addTo(mapInstance.current) 
          .bindPopup(`
            ☕ <b>${name}</b><br/>
            ${place.tags?.addr_street || ""}
          `);

        cafeMarkers.current.push(marker);
      });
    } catch (err) {
      console.error("Overpass error:", err);
    }
  };

  return (
    <div
      ref={mapContainer}
      style={{ height: "100vh", width: "100%" }}
    ></div>
  );
};

export default Map;
