import getMap from "./map.js";

window.setPartySize = () => {
  const party = document.getElementById('party').value;
  if (isNaN(party)) {
    alert('Please enter a number.');
    return;
  }
  if (party < 1 || party >= 10) {
    alert('Please enter a number between 0 and 10.');
    return;
  }
  document.location.href = `./submit.html?party=${encodeURIComponent(party)}`;
}

window.addEventListener('load', getMap);
