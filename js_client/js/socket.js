import authenticate, { forceAuthenticate } from "./authenticate.js";

let thisSio;

function createSocket(idToken) {
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

export default async function socket() {
  while (true) {
    try {
      return thisSio = thisSio || await createSocket(await authenticate());
    } catch {
      await forceAuthenticate();
    }
  }
}
