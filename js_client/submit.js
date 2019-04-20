let finalName;
let tripInfo;

function cancelRequest() {
  if (confirm("Are you sure you wish to continue?") ) {
    const numInParty = document.getElementById("numInParty");
    const finalName = document.getElementById("busStopLabel");
  
    fetch("/api/checkin/cancel", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tripInfo.tripId }),
      method: "POST"
    })
      .then(res => {
        console.log(res);
        document.location.href = "./";
      })
      .catch(console.error);
  }
}

window.onload = () => {
  tripInfo = JSON.parse(localStorage.getItem("tripInfo"));

  document.getElementById("busStopLabel").innerHTML = tripInfo.stop_name;
  document.getElementById("passengersInPartyLabel").innerHTML =
    tripInfo.num_pass;
};
