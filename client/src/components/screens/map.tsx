import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import {} from 'react-native-maps';

export default function MapScreen() {
  const [map, setMap] = useState({} as MapView);

  return <MapView
    style={StyleSheet.absoluteFill}
    ref={mapRef => {
      if (!mapRef) {
        return;
      }
      
      // initialize camera with a reasonable distance, but allow users to
      // mess with it without zooming straight back in every time it moves
      mapRef.setCamera({ zoom: 17 });
      setMap(mapRef)
    }}
    showsUserLocation
    provider={PROVIDER_GOOGLE}
    onUserLocationChange={({ nativeEvent: { coordinate } }) => {
      map.animateCamera(
        { center: coordinate },
        { duration: 1000 }
      );
    }}
  />;
}
