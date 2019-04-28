let finalName;
let tripInfo;
let token;

function initPage() {
  tripInfo = JSON.parse(localStorage.getItem("tripInfo"));
  token = localStorage.getItem("token");
  console.log(token);

  document.getElementById("busStopLabel").innerHTML = tripInfo.stop_name;
  document.getElementById("passengersInPartyLabel").innerHTML =
    tripInfo.passengers;
  document.getElementById("partyName").innerHTML = tripInfo.name;
}

function cancelRequest() {
  if (confirm("Are you sure you wish to continue?") ) {
  

    fetch("/api/checkin/cancel", {
      headers: { "Content-Type": "application/json" },
      body: token,
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