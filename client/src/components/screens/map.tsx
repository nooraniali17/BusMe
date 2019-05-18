import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import MapView, { PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import { getDistanceSimple, getDistance } from 'geolib';

/**
 * Location cache to onUserLocationChange, to avoid having to await geolocation
 * every time.
 */
let _locationCache: LatLng;

/**
 * Should the map be tracking given the distance?
 * 
 * @param from View location.
 * @param to Current location.
 * @param meters What distance constitutes as "far away".
 */
function shouldTrack(
  from: LatLng, 
  to: LatLng = _locationCache, 
  meters: number = 100,
) {
  return getDistanceSimple(from, to) < meters;
}

export default function MapScreen() {
  const [map, setMap] = useState({} as MapView);
  const [tracking, setTracking] = useState(true);

  return <MapView
    style={StyleSheet.absoluteFill}

    // google maps for both OSs because we rely heavily on gmaps place IDs
    provider={PROVIDER_GOOGLE}

    // only allow a bit of map freedom since we only go up to 50m for queries
    minZoomLevel={16}
    showsUserLocation
    showsMyLocationButton
    followsUserLocation

    // followsUserLocation doesn't actually work, so. here we are.
    ref={r => r && setMap(r)}
    onUserLocationChange={({ nativeEvent: { coordinate } }) => {
      _locationCache = coordinate;
      if (tracking) {
        map.animateCamera(
          { center: coordinate },
          { duration: 1000 }
        );
      }
    }}
    onPanDrag={() => tracking || setTracking(false)}
    onRegionChangeComplete={coord => setTracking(shouldTrack(coord))}
  />;
}
