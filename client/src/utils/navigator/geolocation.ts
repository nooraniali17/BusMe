import { GeoOptions, GeolocationReturnType } from "react-native";

export default {
  /**
   * Promisify `navigator.geolocation.getCurrentPosition`.
   */
  getCurrentPosition(geo_options?: GeoOptions): Promise<GeolocationReturnType> {
    return new Promise((y, n) => navigator.geolocation.getCurrentPosition(
      pos => y(pos),
      e => n(new Error(`Geolocation error ${e.code}: ${e.message}`)),
      geo_options
    ));
  }
}
