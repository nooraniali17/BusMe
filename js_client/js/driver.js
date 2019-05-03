import deepEqual from 'https://dev.jspm.io/deep-equal';
import $ from 'https://dev.jspm.io/jquery';
import 'https://dev.jspm.io/bootstrap';

import loadGmaps from './impl/get-gmaps.js';
import navigator from './es6-compat/navigator.js';
import { initMap, getStopInfo, getStopName, currentPosLatLng } from './impl/map.js';
import tagSoup from './utils/tag-soup.js';
import { sleep } from './utils/index.js';

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

          const partyProps = {
            events: {
              /**
               * Toggle pick-up list and highlighting.
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
          };

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
            t.td(partyProps, groupName),
            t.td(partyProps, passengers.toString(10))
          );
        })
      ], [])
  );
}

/**
 * Generate table for all checkins.
 *
 * @param checkinMap An object with the keys being the place ID of the checkins
 * contained.
 */
function generateTable (checkinMap) {
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

/**
 * Get all check ins from `GET /api/checkin`.
 */
async function getCheckins () {
  // cache is keyed by JSON object, because for some reason comparing the
  // "compiled" object makes deep-compare go a bit haywire.

  // doesn't really prevent the situation where the same list is returned but
  // in a different order, but this isn't supposed to be a perfect cache
  // anyways, just a way to prevent as many unnecessary geocode requests
  // as possible.

  getCheckins.cache = getCheckins.cache || [undefined, undefined];
  const [oldText, oldCheckins] = getCheckins.cache;
  const oldData = oldText && JSON.parse(oldText);

  const text = await (await fetch('/api/checkin', { method: 'GET' })).text();
  const data = JSON.parse(text);
  if (deepEqual(oldData, data)) {
    return oldCheckins;
  }

  const checkins = data.reduce((acc, cur) => {
    const k = cur.placeid;
    acc[k] = acc[k] || [];
    acc[k].push(cur);
    return acc;
  }, {});

  getCheckins.cache = [text, checkins];
  return checkins;
}

(async () => {
  // LOAD GMAPS JAVASCRIPT
  const gmaps = await loadGmaps();
  Geocoder = gmaps.Geocoder;
  Marker = gmaps.Marker;

  await Promise.all([
    async () => { // CONSTANTLY UPDATE DRIVER TABLE
      do {
        const table = await generateTable(await getCheckins());
        $('#checkins').empty().append(...table);
      } while (await sleep(5000, true));
    },
    // LOAD GOOGLE MAPS
    async () => ({ map, infoWindow } = await initMap())
  ].map(fn => fn()));
})();
