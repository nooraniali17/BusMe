import authenticate from "./authenticate.js";
import navigator from "./es6-compat/navigator.js";

// shortcuts
const gmaps = google.maps;
const places = gmaps.places;

let map;
let infoWindow;

window.setPartySize = () => {
  const party = document.getElementById('party').value;
  if (isNaN(party)) {
    alert('Please enter a number.');
    return;
  }
  if (party < 1 || party >= 10) {
    alert('Please enter a number between 0 and 10.');
    return;
  }
  document.location.href = `./submit.html?party=${encodeURIComponent(party)}`;
}

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
    infoWindow.setPosition(location);

    infoWindow.setContent('Location Found');
    infoWindow.open(map);

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
  } catch (e) {
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent('Error: The Geolocation service has failed.');
    infoWindow.open(map);
    console.log(e);
  }
}

//EXPERIMENT WITH CREATING MARKERS
function createMarker(place) {
  google.maps.event.addListener(new gmaps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP
  }), 'click', function () {
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}

window.addEventListener('load', async () => {
  try {
    const idToken = await authenticate();
    window.location.hash = '';
    console.log(idToken);
    await initMap();
  } catch (e) {
    console.log(e);
    alert(`Error: ${e.message}. Check the console for further details.`);
  }
});

//https://maps.googleapis.com/maps/api/place/textsearch/json?query=bus+stops&fields=name,%20place_id&location=37.981052,%20-121.312022&radius=1&key=AIzaSyCDg2zhsGJpYuDRbjC_dUOfiT4bJY0IFA8