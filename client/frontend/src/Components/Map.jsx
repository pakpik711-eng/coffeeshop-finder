import React, {useEffect,useRef} from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API_KEY=import.meta.env.VITE_FOURSQUARE_API_KEY;

async function getNearbyCoffeeShops(latitude,longitude){

  const response=await fetch(`https://api.foursquare.com/v3/places/search?query=coffee&ll=${latitude},${longitude}&radius=1500&limit=8`,{
    headers:{
      Accept:'application/json',
      Authorization:API_KEY
    }
  }
  )
const data=await response.json();
console.log(data.results);
return data.results;


}

async function getShopImage(placeId) {
  const response = await fetch(`https://api.foursquare.com/v3/places/${placeId}/photos?limit=1`, {
    headers: {
      Accept: 'application/json',
      Authorization: API_KEY
    }
  });
  const data = await response.json();
  if (data.length > 0) {
    const photos = data;
    return `${photos[0].prefix}300x300${photos[0].suffix}`
  } else {
    return null;
  }
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
          
 navigator.geolocation.getCurrentPosition(async(position)=>{

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

const shops=await getNearbyCoffeeShops(latitude,longitude);
  shops.forEach(async(shop)=>{
    const shopLat=shop.geocodes.main.latitude;
    const shopLng=shop.geocodes.main.longitude;
    const placeId=shop.fsq_id;
    const imageUrl=await getShopImage(placeId);

  L.marker([shopLat,shopLng])
  .addTo(mapInstance.current)
  .bindPopup(`
    <div style="width:200px">
    <b>${shop.name}</b><br/>
    ${shop.location.formatted_address || ""}<br/>
     Distance: ${shop.distance} m<br/>
     ${
      imageUrl?<img src="${imageUrl}"  width="180" 
                             style="margin-top:6px;border-radius:8px"/>
                             :"No Image Available"

     }
    </div>
    `)

    },(error)=>{
        console.error("Error getting location:",error);
    })


  


 return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
    },[])
  return (
   <div id="map" ref={mapContainer}  ></div>

  )
}

export default Map;