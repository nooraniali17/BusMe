import { gmapsGeocode } from '../es6-compat/gmaps/places.js';
import navigator from '../es6-compat/navigator.js';

/**
 * Initialize map with marker at the current position.
 *
 * @returns Map (under `map`) and info popup (under `infoWindow`).
 */
export async function initMap ({
  infoWindow = null,
  position = null,
  icon = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
  mapOpts = {},
  posMarkerOpts = {}
} = {}) {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 }, zoom: 17, ...mapOpts
  });
  infoWindow = infoWindow || new google.maps.InfoWindow();

  try {
    position = position || await currentPosLatLng();
    map.setCenter(position);
    new google.maps.Marker({ position, map, icon, ...posMarkerOpts })
      .addListener('click', function () {
        infoWindow.setContent('Current Location');
        infoWindow.open(map, this);
      });
  } catch (e) {
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent(e.message);
    infoWindow.open(map);
  }

  return { map, infoWindow };
}

/**
 * Get current position in LatLng format, i.e.
 *
 * ```js
 * { lat: latitude, lng: longitude }
 * ```
 */
export async function currentPosLatLng (opts) {
  const { coords } = await navigator.geolocation.getCurrentPosition(opts);
  const { latitude, longitude } = coords;
  return { lat: latitude, lng: longitude };
}

/**
 * Get geocode info from place ID.
 *
 * @param geocoder Prebuilt Geocoder instance.
 * @param placeId Place ID to search for.
 */
export async function getStopInfo (geocoder, placeId) {
  const res = await gmapsGeocode(geocoder, { placeId });
  if (res.length === 0) {
    throw new Error(`${placeId} is not a valid Place ID.`);
  }
  return res[0];
}

/**
 * Get bus station name from geocode API call.
 *
 * @param info Prefetched info from `getStopInfo`.
 */
export function getStopName (info) {
  for (const { short_name, types } of info.address_components) {
    if (types.includes('bus_station')) {
      return short_name;
    }
  }
}
