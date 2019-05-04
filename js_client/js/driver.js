import deepEqual from 'https://dev.jspm.io/deep-equal';
import $ from 'https://dev.jspm.io/jquery';
import 'https://dev.jspm.io/bootstrap';

import loadGmaps from './impl/get-gmaps.js';
import { initMap, getStopInfo, getStopName, currentPosLatLng } from './impl/map.js';
import tagSoup from './utils/tag-soup.js';
import { loop } from './utils/index.js';

// GMAPS
let Geocoder, Marker;

let map;
let infoWindow;
let currentMarker = {};
const pickups = new Set();

window.pickup = async e => {
  if (pickups.size === 0) {
    return alert('Please pick up at least one passenger.');
  }
  const res = await fetch('/api/pickups', {
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

/**
 * Generate a table body for checkins.
 *
 * @param t Tag soup generator.
 * @param checkinMap An object with the keys being the place ID of the checkins
 * contained.
 */
function generateRows (t, checkinMap) {
  return Promise.all(
    Object.entries(checkinMap)
      // sort by current passengers at each stop, descending
      .sort(([, a], [, b]) => {
        const collect = (acc, cur) => acc + cur.passengers;
        const aCt = a.reduce(collect, 0);
        const bCt = b.reduce(collect, 0);
        return bCt - aCt;
      })
      .reduce((acc, [placeid, checkins]) => [
        ...acc,
        ...checkins.map(async (obj, i) => {
          const { name: groupName, passengers, token } = obj;
          obj.stop = obj.stop || await getStopInfo(new Geocoder(), placeid);
          const stopInfo = obj.stop;

          let stopName = getStopName(stopInfo) || `unknown stop ${placeid}`;

          const location = stopInfo.geometry.location;
          const position = { lat: location.lat(), lng: location.lng() };

          return t.tr(
            i === 0 && t.td(
              {
                rowspan: checkins.length,
                events: {
                  /**
                   * Focus on bus stop in map.
                   */
                  click (e) {
                    e.preventDefault();
                    if (currentMarker.placeid !== placeid) {
                      const previousMarker = currentMarker.marker;
                      if (previousMarker) {
                        previousMarker.setMap(null);
                      }

                      const marker = new Marker({ map, position });
                      infoWindow.setContent(stopName);
                      infoWindow.open(map, marker);
                      currentMarker = { placeid, marker };
                    }
                  }
                }
              },
              stopName
            ),
            t.td({
              events: {
                /**
                 * Toggle pickup list and highlighting
                 */
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
            }, groupName),
            t.td(passengers.toString(10))
          );
        })
      ], [])
  );
}

/**
 * Get all check ins from `GET /api/checkins`. Returns null if there is no need
 * to update (304, or similar return).
 */
async function getCheckins () {
  // cache is keyed by JSON object, because for some reason comparing the
  // "compiled" object makes deep-compare go a bit haywire.

  // doesn't really prevent the situation where the same list is returned but
  // in a different order, but this isn't supposed to be a perfect cache
  // anyways, just a way to prevent as many unnecessary geocode requests
  // as possible.

  const oldText = getCheckins.cache;
  const oldData = oldText && JSON.parse(oldText);

  const res = await fetch('/api/checkins', { method: 'GET' });
  if (res.status === 304) {
    return;
  }

  const text = await res.text();
  const data = JSON.parse(text);
  if (deepEqual(oldData, data)) {
    return;
  }

  const checkins = data.reduce((acc, cur) => {
    const k = cur.placeid;
    acc[k] = acc[k] || [];
    acc[k].push(cur);
    return acc;
  }, {});

  getCheckins.cache = text;
  return checkins;
}

/**
 * Generate table for all checkins.
 */
async function generateTable () {
  const checkins = await getCheckins();
  if (!checkins) {
    return;
  }

  const fragment = await tagSoup(async t => Object.keys(checkins).length !== 0
    ? [
      t.thead(t.tr(
        t.th({ class: 'col-5' }, 'Stop'),
        t.th({ class: 'col-6' }, 'Party'),
        t.th('Size')
      )),
      t.tbody(...await generateRows(t, checkins))
    ]
    : [t.tbody(t.tr(t.td('No checkins found')))]
  );

  $('#checkins').empty().append(...fragment);
}

async function setLocation () {
  const res = await fetch('/api/drivers', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, ...await currentPosLatLng() }),
    method: 'PUT'
  });

  if (res.status >= 400) {
    return console.error(`Driver location update failed (HTTP ${res.status})`);
  }
}

(async () => {
  // LOAD GMAPS JAVASCRIPT
  const gmaps = await loadGmaps();
  Geocoder = gmaps.Geocoder;
  Marker = gmaps.Marker;

  await Promise.all([
    // CONSTANTLY UPDATE DRIVER TABLE AND POSITION
    loop(generateTable, 5000),
    loop(setLocation, 1000),
    // LOAD GOOGLE MAPS
    async () => ({ map, infoWindow } = await initMap())
  ].map(fn => fn()));
})();
