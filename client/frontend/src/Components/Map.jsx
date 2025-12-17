import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import coffee from "../../public/coffee.png";
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";



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

  const userLocation=useRef(null);
  const routeControl=useRef(null);




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

       
        if (userMarker.current) {
          userMarker.current.remove();
        }

        userMarker.current = L.marker([latitude, longitude])
          .addTo(mapInstance.current)
          .bindPopup("You are here")
          .openPopup();

        mapInstance.current.setView([latitude, longitude], 14);

        fetchNearbyCafes(latitude, longitude);
        userLocation.current = [latitude, longitude];

        
      },
      (error) => {
        console.error("Location error:", error);
      }
    );
  };

  const fetchNearbyCafes = async (lat, lon) => {
   
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

     //direction-feature
      const showRoute =(shopLat, shopLon)=>{
        if(!userLocation.current) return;

        if(routeControl.current){
          mapInstance.current.removeControl(routeControl.current);
        }
     
        routeControl.current = L.Routing.control({
waypoints: [
      L.latLng(userLocation.current[0], userLocation.current[1]),
      L.latLng(shopLat, shopLon),
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    show: false,
    lineOptions: {
      styles: [{ color: "#F54927", weight: 5 }],
    },
        }).addTo(mapInstance.current);



      }

      data.elements.forEach((place) => {
        const name = place.tags?.name || "Coffee Shop";

        const marker = L.marker([place.lat, place.lon], { icon: coffeeIcon })
          .addTo(mapInstance.current) 
          .bindPopup(`
            ☕ <b>${name}</b><br/>
            ${place.tags?.addr_street || ""}<br/>
              Click marker for directions
          `);
          marker.on('click',()=>{
            showRoute(place.lat, place.lon);
          })
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
