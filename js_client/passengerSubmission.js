function initPage() {
  // POSTING  tripInfo
  const tripInfo = localStorage.getItem("tripInfo");
  const parsedTripInfo = JSON.parse(tripInfo);

  document.getElementById("busStopLabel").innerHTML = parsedTripInfo.stop_name;
  document.getElementById("passengersInPartyLabel").innerHTML =
    parsedTripInfo.num_pass;
}

window.onload = initPage;
