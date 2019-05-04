import $ from 'https://dev.jspm.io/jquery';
import 'https://dev.jspm.io/bootstrap';

import loadGmaps from './impl/get-gmaps.js';
import { getStopInfo, getStopName, initMap } from './impl/map.js';

let Geocoder, Animation, Marker;

let map;

const payload = {
  headers: { 'Content-Type': 'application/json' },
  body: localStorage.getItem('token'),
  method: 'POST'
};

window.cancelRequest = async () => {
  if (confirm('Are you sure you want to cancel?')) {
    const res = await fetch('/api/checkin/cancel', payload);
    console.log(res);
    window.location.replace('.');
  }
};

function setTable (data) {
  const { name, passengers, stopName } = data;
  $('#name').text(name);
  $('#pass').text(passengers);
  $('#stop').text(stopName);
}

/**
 * Add markers of all nearby bus stations.
 *
 * @param location LatLng literal to base the query on.
 * @param radius How far away the query should look for.
 * @param icon Marker icon image URL.
 */
async function addDriverMarker ({
  icon = 'http://maps.google.com/mapfiles/ms/micons/bus.png'
} = {}) {
  const data = await (await fetch('/api/driverLocation', { method: 'GET' })).json();
  const animation = Animation.DROP;
  var driverLatLng = { lat: data[0].lat, lng: data[0].long};

  var driverMarker = new google.maps.Marker({
    position: driverLatLng,
    title: "Here's your driver!",
    animation,
    icon
  });
  map.setCenter(driverLatLng);

  driverMarker.setMap(map);
}

async function fetchCheckinInfo () {
  const data = await (await fetch('/api/checkin/info', payload)).json();
  data.stopName = getStopName(
    await getStopInfo(new Geocoder(), data.placeid));
  setTable(data);
  localStorage.setItem('trip', JSON.stringify(data));
}

(async () => {
  try {
    setTable(JSON.parse(localStorage.getItem('trip')));
  } catch (e) {}

  // LOAD GMAPS JAVASCRIPT
  const gmaps = await loadGmaps();
  Animation = gmaps.Animation;
  Geocoder = gmaps.Geocoder;
  Marker = gmaps.Marker;

  // LOAD GOOGLE MAPS
  const mapData = await initMap();
  map = mapData.map;

  return Promise.all([addDriverMarker(), fetchCheckinInfo()]);
})();
