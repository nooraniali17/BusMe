import authenticate from "./authenticate.js";
import { sleep } from "./es6-compat/util.js";
import getMap, { updatePosition, getStop } from "./map.js";
import socket from "./socket.js";

window.setPartySize = async e => {
  const party = Number(e.target[0].value);
  stop = await getStop();
  (await socket()).emit("check_in", { party });

  e.preventDefault();
  document.location.href = `./submit.html?party=${encodeURIComponent(party)}`;
}

window.addEventListener('load', async function main() {
  do {
    await updatePosition(await getMap());
  } while (await sleep(10, true));
});

// this will redirect out of page before render if new authentication is
// needed for a seamless transition
authenticate();
