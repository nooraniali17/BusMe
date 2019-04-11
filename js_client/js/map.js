import navigator from "./es6-compat/navigator.js";
import socket from "./socket.js";

// shortcuts
const gmaps = google.maps;
const places = gmaps.places;

let map;
let infoWindow;

async function initMap() {
  infoWindow = new gmaps.InfoWindow();

  // Map loads this area first
  map = new gmaps.Map(document.getElementById('map'), {
    center: { lat: 37.981161, lng: -121.312040 },
    zoom: 15,
    gestureHandling: 'greedy'
  });

  try {
    const position = await navigator.geolocation.getCurrentPosition();
    const location = {
      lat: parseFloat(position.coords.latitude),
      lng: parseFloat(position.coords.longitude)
    };

    const service = new places.PlacesService(map);

    service.textSearch({
      location,
      radius: '50',
      center: location,
      query: 'bus stops'
    }, (results, status) => {
      if (status === places.PlacesServiceStatus.OK) {
        for (const r of results) {
          createMarker(r);
        }
      }
    });

    map.setCenter(location);
    return map;
  } catch (e) {
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent('Error: The Geolocation service has failed.');
    infoWindow.open(map);
    console.log(e);
  }
}

export default async function getMap() {
  try {
    return map = map || await initMap();
  } catch (e) {
    console.log(e);
    alert(`Error loading map: ${e.message}. Check the console for details.`);
  }
}

function createMarker(place) {
  google.maps.event.addListener(new gmaps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP
  }), 'click', function () {
    infoWindow.setContent(place.name);
    console.log(place.name);
    infoWindow.open(map, this);
  });
}
