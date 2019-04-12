import authenticate from "./authenticate.js";
import { sleep } from "./es6-compat/util.js";
import getMap, { updatePosition } from "./map.js";
import socket from "./socket.js";

window.setPartySize = async () => {
  const party = document.getElementById('party').value;
  if (isNaN(party)) {
    alert('Please enter a number.');
    return;
  }
  if (party < 1 || party >= 10) {
    alert('Please enter a number between 0 and 10.');
    return;
  }

  (await socket()).emitAsync("check_in", { party });
  // document.location.href = `./submit.html?party=${encodeURIComponent(party)}`;
}

window.addEventListener('load', async function main() {
  do {
    await updatePosition(await getMap());
  } while (await sleep(10, true));
});

// this will redirect out of page before render if new authentication is
// needed for a seamless transition
authenticate();
