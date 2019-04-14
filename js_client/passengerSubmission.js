function initPage() {
  const tripInfo = localStorage.getItem("tripInfo");
  const parsedTripInfo = JSON.parse(tripInfo);

  document.getElementById("passengersInPartyLabel").innerHTML =
    parsedTripInfo.num_pass;

  //LEARNING HOW TO GET
  const Url = "http://d6c8b38c.ngrok.io/";
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
