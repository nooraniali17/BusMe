let finalName;

function initPage() {
  // POSTING  tripInfo
  const tripInfo = localStorage.getItem("tripInfo");
  const parsedTripInfo = JSON.parse(tripInfo);

  document.getElementById("busStopLabel").innerHTML = parsedTripInfo.stop_name;
  document.getElementById("passengersInPartyLabel").innerHTML =
    parsedTripInfo.num_pass;
}

function cancelRequest() {
  const Url = "http://2abb7c15.ngrok.io";
  const numInParty = document.getElementById("numInParty");
  const finalName = document.getElementById("busStopLabel");

  const Data = {
    num_pass: numInParty,
    stop_name: finalName
  };

  const payLoad = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "GET"
  };


  fetch(Url, payLoad)
    .then(data => data.json())
    .then(res => {

      console.log(res);
    })
    .catch(error => console.log(error));

//  alert("HELLO WORLD");
}

window.onload = initPage;
