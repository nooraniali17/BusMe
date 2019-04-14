function initPage() {
  // POSTING  tripInfo
  const tripInfo = localStorage.getItem("tripInfo");
  const parsedTripInfo = JSON.parse(tripInfo);

  document.getElementById("busStopLabel").innerHTML = parsedTripInfo.stop_name;
  document.getElementById("passengersInPartyLabel").innerHTML =
    parsedTripInfo.num_pass;

  //LEARNING HOW TO GET
  const Url = "http://6ec3888c.ngrok.io/";
  const payLoad = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "GET"
  };
  fetch(Url, payLoad)
    .then(data => data.json())
    .then(res => console.log(res))
    .catch(error => console.log(error));
}

window.onload = initPage;
