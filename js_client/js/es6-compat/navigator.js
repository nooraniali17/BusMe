if (!('geolocation' in navigator)) {
  console.error('Geolocation API not active.');
}

export default {
  geolocation: {
    /**
     * Promisify `navigator.geolocation.getCurrentPosition`.
     */
    getCurrentPosition (opts) {
      return new Promise((y, n) => {
        if (navigator.geolocation) {
          return navigator.geolocation.getCurrentPosition(
            y, (...args) => n(new Error(args)), opts);
        }
        return n(new Error('There is no geolocation on this device.'));
      });
    }
  }
};
