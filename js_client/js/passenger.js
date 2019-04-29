import { gmapsTextSearch } from './es6-compat/gmaps/places.js';
import { initMap } from './impl/map.js';
import navigator from './es6-compat/navigator.js';

let map;
let infoWindow;
let chosenLocation;

window.sendCheckin = async (e) => {
  e.preventDefault();

  const form = e.target;
  const reqBody = {
    passengers: parseInt(form.passengers.value, 10),
    name: form.groupName.value,
    placeid: chosenLocation.place_id
  };

  if (reqBody.placeid == null) {
    return alert('Please choose a stop before checking in.');
  }

  if (!Object.values(reqBody).every(v => v)) {
    return alert('Please fill in all fields.');
  }

  const res = await fetch('/api/checkin', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqBody),
    method: 'POST'
  });
  if (res.status >= 400) {
    return alert(`Checkin failed (HTTP ${res.status})`);
  }
  const resBody = await res.json();

  localStorage.setItem('trip', JSON.stringify({
    ...reqBody, stopName: chosenLocation.name,
  }));
  localStorage.setItem('token', JSON.stringify(resBody));

  window.location.replace('submit.html');
};

async function addMarkers (location, radius) {
  const res = await gmapsTextSearch(
    new google.maps.places.PlacesService(map),
    { location, radius, query: 'bus stops' }
  );

  const animation = google.maps.Animation.DROP;
  for (const r of res) {
    const { name, place_id, geometry: { location } } = r;
    const position = { lat: location.lat(), lng: location.lng() };
    new google.maps.Marker({ map, position, animation })
      .addListener('click', function () {
        infoWindow.setContent(name);
        infoWindow.open(map, this);
        chosenLocation = r;
      });
  }
}

$(document).ready(async () => {
  $('input').tooltip({ trigger: 'focus' });

  const { coords } = await navigator.geolocation.getCurrentPosition();
  const { latitude, longitude } = coords;
  const position = { lat: latitude, lng: longitude };

  infoWindow = new google.maps.InfoWindow();
  map = await initMap({ infoWindow, position });
  await addMarkers(position, 50);
});
