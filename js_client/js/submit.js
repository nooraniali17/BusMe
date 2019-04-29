let finalName;
let tripInfo;

async function cancelRequest () {
  if (confirm('Are you sure you want to cancel?')) {
    const res = await fetch('/api/checkin/cancel', {
      headers: { 'Content-Type': 'application/json' },
      body: localStorage.getItem('token'),
      method: 'POST'
    });
    console.log(res);
    window.location.replace('.');
  }
}

$(document).ready(() => {
  tripInfo = JSON.parse(localStorage.getItem('trip'));

  // document.getElementById('busStopLabel').innerHTML = tripInfo.passengers;
  document.getElementById('passengersInPartyLabel').innerHTML =
    tripInfo.passengers;
  document.getElementById('partyName').innerHTML = tripInfo.name;
});
