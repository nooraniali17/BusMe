export default function socket(idToken) {
  return new Promise((y, n) => {
    const sio = io();
    sio.emitAsync = async function (...args) {
      return new Promise(y => this.emit(...args, y));
    }

    return sio.on("connect", () => sio.emit("login", idToken))
      .once("authenticated", () => y(sio))
      .once("error", err => {
        if (err.event === "login") {
          n(new Error(err.message));
        }
      })
  });
}
