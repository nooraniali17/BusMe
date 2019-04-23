let finalName;

function initPage() {
  const tripInfo = localStorage.getItem("tripInfo");
  const parsedTripInfo = JSON.parse(tripInfo);

  document.getElementById("busStopLabel").innerHTML = parsedTripInfo.stop_name;
  document.getElementById("passengersInPartyLabel").innerHTML =
    parsedTripInfo.num_pass;
}

function cancelRequest() {

  let c = confirm("Are you sure you wish to continue?") 

  if (c) {
    
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

      alert("You've cancelled your request...");
  }

  else {
    alert("Your bus will be arriving shortly...");
  }
}

window.onload = initPage;
