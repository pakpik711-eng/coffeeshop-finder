import React, {useEffect,useRef} from 'react'
import L from 'leaflet'


function getUserLocation(userMarker,mapInstance){

    navigator.geolocation.getCurrentPosition((position)=>{

  const {latitude,longitude}=position.coords;
    console.log("Latitude:",latitude);
    console.log("longitude:",longitude);
    
    if(userMarker.current){
        userMarker.current.remove();
    }
userMarker.current=L.marker([latitude,longitude]).
    addTo(mapInstance.current).
    bindPopup("You are here")   
    .openPopup();
    mapInstance.current.setView([latitude,longitude],13);
    },(error)=>{
        console.error("Error getting location:",error);
    })
}

const Map = () => {

    const mapContainer=useRef(null);
    const mapInstance=useRef(null);
    const userMarker=useRef(null);
    useEffect(()=>{
          if (mapInstance.current) return 

      mapInstance.current= L.map(mapContainer.current).setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapInstance.current);
          
getUserLocation(userMarker,mapInstance);
 return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
    },[])
  return (
   <div id="map" ref={mapContainer}  ></div>

  )
}

export default Map