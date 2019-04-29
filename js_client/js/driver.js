import { gmapsGeocode } from './es6-compat/gmaps/places.js';
import navigator from './es6-compat/navigator.js';
import { initMap } from './impl/map.js';
import tagSoup from './utils/tag-soup.js';

let map;
let infoWindow;
let geocoder;
let currentMarker = {};
const pickups = new Set();

window.pickup = async e => {
  if (pickups.length === 0) {
    return alert('Please pick up at least one passenger.');
  }
  const res = await fetch('/api/pickup', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([...pickups]),
    method: 'POST'
  });
  if (res.status >= 400) {
    console.error(res);
    return alert(`Pickup failed (HTTP ${res.status})`);
  }
  window.location.reload(false);
};

async function getStopName (placeId) {
  const res = await gmapsGeocode(geocoder, { placeId });
  if (res.length === 0) {
    throw new Error(`${placeId} is not a valid Place ID.`);
  }
  return res[0];
}

function generateRows (t, checkinMap) {
  return Promise.all(
    Object.entries(checkinMap)
      .reduce((acc, [placeid, cins]) => [
        ...acc,
        ...cins.map(async (obj, i) => {
          const { name: groupName, passengers, token } = obj;

          const partyProps = {
            events: {
              click (e) {
                e.preventDefault();

                if (pickups.has(token)) {
                  this.classList.remove('bg-info');
                  pickups.delete(token);
                } else {
                  this.classList.add('bg-info');
                  pickups.add(token);
                }
              }
            }
          };

          const stopInfo = obj.stopInfo = await getStopName(placeid);
          let stopName = `unknown stop ${placeid}`;

          for (const { short_name, types } of stopInfo.address_components) {
            if (types.includes('bus_station')) {
              stopName = short_name;
              break;
            }
          }

          const location = stopInfo.geometry.location;
          const position = { lat: location.lat(), lng: location.lng() };

          return t.tr(
            i === 0 && t.td(
              {
                rowspan: cins.length,
                events: {
                  click (e) {
                    e.preventDefault();
                    if (currentMarker.placeid !== placeid) {
                      const previousMarker = currentMarker.marker;
                      if (previousMarker) {
                        previousMarker.setMap(null);
                      }

                      const marker = new google.maps.Marker({ map, position });
                      infoWindow.setContent(stopName);
                      infoWindow.open(map, marker);
                      currentMarker = { placeid, marker };
                    }
                  }
                }
              },
              stopName
            ),
            t.td(partyProps, groupName),
            t.td(partyProps, passengers.toString(10))
          );
        })
      ], [])
  );
}

async function generateTable (checkinMap) {
  return tagSoup(async t => Object.keys(checkinMap).length !== 0
    ? [
      t.thead(t.tr(
        t.th({ class: 'col-5' }, 'Stop'),
        t.th({ class: 'col-6' }, 'Party'),
        t.th('Size')
      )),
      t.tbody(...await generateRows(t, checkinMap))
    ]
    : [t.tbody(t.tr(t.td('No checkins found')))]
  );
}

async function populateCheckins () {
  const data = await (await fetch('/api/checkin', { method: 'GET' })).json();
  const checkinMap = data.reduce((acc, cur) => {
    const k = cur.placeid;
    acc[k] = acc[k] || [];
    acc[k].push(cur);
    return acc;
  }, {});

  const table = await generateTable(checkinMap);
  $('#checkins').append(...table);
}

$(document).ready(async () => {
  await Promise.all([
    async () => {
      geocoder = new google.maps.Geocoder();
      return populateCheckins();
    },
    async () => {
      const { coords } = await navigator.geolocation.getCurrentPosition();
      const { latitude, longitude } = coords;
      const position = { lat: latitude, lng: longitude };

      infoWindow = new google.maps.InfoWindow();
      map = await initMap({ infoWindow, position });
    }
  ].map(fn => fn()));
});
