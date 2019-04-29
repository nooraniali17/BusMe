function gmapsCallback (y, n) {
  return (res, status) => status === 'OK' ? y(res) : n(new Error(status));
}

/**
 * Promisify `google.maps.places.PlacesService.textSearch`.
 */
export function gmapsTextSearch (service, req) {
  return new Promise((y, n) => service.textSearch(req, gmapsCallback(y, n)));
}

/**
 * Promisify `google.maps.Geocoder.geocode`.
 */
export function gmapsGeocode (geocoder, req) {
  return new Promise((y, n) => geocoder.geocode(req, gmapsCallback(y, n)));
}
