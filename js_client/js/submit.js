import $ from 'https://dev.jspm.io/jquery';
import 'https://dev.jspm.io/bootstrap';

import loadGmaps from './impl/get-gmaps.js';
import { getStopInfo, getStopName, initMap } from './impl/map.js';

let Geocoder, Animation;

let map;
let infoWindow;

var icon = 'http://maps.google.com/mapfiles/ms/micons/bus.png';

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
 */
async function addDriverMarker (location, radius) {
  var driverLatLng = { lat: 37.970843, lng: -121.315699 };
  // var lat, lng;

  
  // const data = JSON.parse(res);
  // lat = data.lat;
  // lng = data.long;
  // var driverLatLng = { lat: lat, lng: lng };
  // const res = await fetch('/api/driverLocation/update', {
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(reqBody),
  //   method: 'POST'
  // });

  // if (res.status >= 400) {
  //   return alert(`Driver location request failed (HTTP ${res.status})`);
  // }

  const animation = Animation.DROP;
  var driverMarker = new google.maps.Marker({
    position: driverLatLng,
    title: "Here's your driver!",
    animation,
    icon
  });
  map.setCenter(driverLatLng);

  driverMarker.setMap(map);
}

$(document).ready(async () => {
  $('input').tooltip({ trigger: 'focus' });
});

(async () => {
  try {
    setTable(JSON.parse(localStorage.getItem('trip')));
  } catch (e) {}

  const gmaps = await loadGmaps();
  Animation = gmaps.Animation;
  Geocoder = gmaps.Geocoder;

  const mapData = await initMap();
  map = mapData.map;
  infoWindow = mapData.infoWindow;
  await addDriverMarker(map.getCenter(), 50);

  const data = await (await fetch('/api/checkin/info', payload)).json();
  data.stopName = getStopName(
    await getStopInfo(new Geocoder(), data.placeid));
  setTable(data);
  localStorage.setItem('trip', JSON.stringify(data));
})();
