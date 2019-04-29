import navigator from '../es6-compat/navigator.js';

export function initMap({
  infoWindow = null,
  icon = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
  position = {},
  mapOpts = {},
  posMarkerOpts = {}
}) {
  infoWindow = infoWindow || new google.maps.InfoWindow();
  position = { lat: 0, lng: 0, ...position };
  const map = new google.maps.Map(document.getElementById('map'), {
    center: position, zoom: 16, gestureHandling: 'greedy', ...mapOpts
  });
  const currentPosMarker = new google.maps.Marker({
    position, map, icon, ...posMarkerOpts
  });

  try {
    currentPosMarker.addListener('click', function () {
      infoWindow.setContent('Current Location');
      infoWindow.open(map, this);
    });
    return map;
  } catch (e) {
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent(e.message);
    infoWindow.open(map);
  }
}
