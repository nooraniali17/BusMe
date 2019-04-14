if (!"geolocation" in navigator) {
  console.error("Geolocation API not active.");
}

export default {
  geolocation: {
    async getCurrentPosition(options) {
      return new Promise((y, n) =>
        navigator.geolocation.getCurrentPosition(y, n, options)
      );
    }
  }
};
