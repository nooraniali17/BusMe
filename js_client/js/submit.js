import $ from 'https://dev.jspm.io/jquery';
import 'https://dev.jspm.io/bootstrap';

import loadGmaps from './impl/get-gmaps.js';
import { getStopInfo, getStopName, initMap } from './impl/map.js';
import { sleep } from './utils/index.js';

let Geocoder, Animation, Marker;

let map;

const payload = {
  headers: { 'Content-Type': 'application/json' },
  body: localStorage.getItem('token'),
  method: 'POST'
};

window.cancelRequest = async () => {
  if (confirm('Are you sure you want to cancel?')) {
    const res = await fetch('/api/checkins/cancel', payload);
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
 * @param icon Marker icon image URL.
 */
async function updateDriverLocation ({
  icon = 'http://maps.google.com/mapfiles/ms/micons/bus.png'
} = {}) {
  const driverMarker = new Marker({
    position: { lat: 0, lng: 0 },
    title: "Here's your driver!",
    animation: Animation.DROP,
    icon,
    map
  });

  do {
    const res = await fetch('/api/drivers', { method: 'GET' });
    const [position] = await res.json();

    map.setCenter(position);
    driverMarker.setPosition(position);
  } while (await sleep(1000, true));
}

async function fetchCheckinInfo () {
  const data = await (await fetch('/api/checkins/info', payload)).json();
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

  return Promise.all([updateDriverLocation(), fetchCheckinInfo()]);
})();
