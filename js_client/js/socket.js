import authenticate from "./authenticate.js";

let sio;

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
  return sio = sio || await createSocket(await authenticate());
}

// this will redirect out of page before render if new authentication is needed
// this way the redirect is seamless
(async () => sio = await socket())()
