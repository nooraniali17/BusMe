import authenticate from "./authenticate.js";
import socket from "./socket.js";

var partySize;

window.addEventListener('load', async function main() {
    partySize = (await socket()).emit("get_party").message;
    alert(partySize)
});

window.cancelRequest = async e => {
    (await socket()).emit("cancel_request");
  
    e.preventDefault();
    document.location.href = `./index.html`;
  }

// this will redirect out of page before render if new authentication is
// needed for a seamless transition
authenticate();