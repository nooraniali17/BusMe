import { getStopInfo, getStopName } from './impl/map.js';

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
}

function setTable (data) {
  const { name, passengers, stopName } = data;
  $("#name").text(name);
  $("#pass").text(passengers);
  $("#stop").text(stopName);
}

(async () => {
  try {
    setTable(JSON.parse(localStorage.getItem('trip')));
  } catch {}

  const data = await (await fetch('/api/checkin/info', payload)).json();
  data.stopName = getStopName(
    await getStopInfo(new google.maps.Geocoder(), data.placeid));
  setTable(data);
  localStorage.setItem('trip', JSON.stringify(data));
})();
