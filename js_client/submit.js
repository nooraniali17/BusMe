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
  
    const { stop_name, num_pass } = tripInfo;

    fetch("/api/checkin/cancel", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stop_name, num_pass }),
      method: "POST"
    })
      .then((...data) => {
        console.log(...data);
        document.location.href = "./";
      })
      .catch(console.error);
  }
}

window.onload = initPage;
