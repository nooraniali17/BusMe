let finalName;
let tripInfo;

function initPage() {
  tripInfo = JSON.parse(localStorage.getItem("tripInfo"));

  document.getElementById("busStopLabel").innerHTML = tripInfo.stop_name;
  document.getElementById("passengersInPartyLabel").innerHTML =
    tripInfo.num_pass;
}

function cancelRequest() {
  if (confirm("Are you sure you wish to continue?") ) {
    const numInParty = document.getElementById("numInParty");
    const finalName = document.getElementById("busStopLabel");
  
    fetch("/api/checkin/cancel", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tripInfo.tripId }),
      method: "POST"
    })
      .then(console.log)
      .catch(console.error);
    document.location.href = "./";
  }
}

window.onload = initPage;
