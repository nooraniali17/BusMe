import navigator from "./es6-compat/navigator.js";
import socket from "./socket.js";

// shortcuts
const gmaps = google.maps;
const places = gmaps.places;

let thisMap;
let infoWindow;

async function getLocation() {
  const { coords } = await navigator.geolocation.getCurrentPosition({
    maximumAge: 30
  });
  return { lat: coords.latitude, lng: coords.longitude };
}

export async function updatePosition(map) {
  try {
    const location = await getLocation();

    map.setCenter(location);
    (await socket()).emit("location", location);
  } catch (e) {
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent('Error: The Geolocation service has failed.');
    infoWindow.open(map);
    console.log(e);
  }
}

export async function initMap() {
  infoWindow = new gmaps.InfoWindow();

  const location = await getLocation();

  const map = new gmaps.Map(document.getElementById('map'), {
    center: location,
    zoom: 15,
    gestureHandling: 'greedy'
  });

  const service = new places.PlacesService(map);

  service.textSearch({
    location,
    radius: '50',
    center: location,
    query: 'bus stops'
  }, (results, status) => {
    if (status === places.PlacesServiceStatus.OK) {
      for (const r of results) {
        createMarker(r, map);
      }
    }
  });

  return map;
}

export default async function getMap() {
  try {
    return thisMap = thisMap || await initMap();
  } catch (e) {
    console.log(e);
    alert(`Error loading map: ${e.message}. Check the console for details.`);
  }
}

function createMarker(place, map) {
  google.maps.event.addListener(new gmaps.Marker({
    map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP
  }), 'click', function () {
    infoWindow.setContent(place.name);
    console.log(place.name);
    infoWindow.open(map, this);
  });
}
