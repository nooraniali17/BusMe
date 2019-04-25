var numInParty = 0;
var myLocation, myLat, myLong;
var map;
var image =
  "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
var infoWindow;
var finalLat;
var finalLng;
var finalName;

function setNumInParty(event) {
  let partyName = document.getElementById("partyName").value;
  numInParty = parseInt(document.getElementById("numInParty").value, 10);
  
  if (isNaN(numInParty)) {
    alert("Please enter a number!");
    return;
  }
  if (numInParty < 1 || numInParty >= 10) {
    alert("Please enter a number greater than 0 but less than 10!");
    return;
  }
  else if (!isNaN(partyName)) {
    alert("Please enter a valid party name!");
    return;
  }
  
  const Data = {
    picked_up: 2,
    num_pass: numInParty,
    latitude: finalLat,
    longitude: finalLng,
    stop_name: finalName
  };

  const payLoad = {
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(Data),
    method: "POST"
  };
  console.log(payLoad);

  fetch("/api/checkin", payLoad)
    .then(res => {
      console.log(res);

      if (res.status >= 400) {
        console.log("checkin failed, maybe check all the fields?");
        return;
      }

      document.location.href = "./submit.html";
      localStorage.setItem("tripInfo", JSON.stringify(Data));
    })
    .catch(error => console.log(error));
}

function initMap() {
  var myMapCenter = { lat: 37.981161, lng: -121.31204 };
  infoWindow = new google.maps.InfoWindow();

  //Map loads this area first
  map = new google.maps.Map(document.getElementById("map"), {
    center: myMapCenter,
    zoom: 15,
    gestureHandling: "greedy"
  });


  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var myLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        myLat = myLocation.lat;
        myLong = myLocation.lng;
        myLocation = { lat: parseFloat(myLat), lng: parseFloat(myLong) };

        let myMarker = new google.maps.Marker({
          position: myLocation,
          map: map, 
          icon: image
        });

        myMarker.addListener('click', function() {
          infoWindow.open(map, myMarker);
          infoWindow.setContent("Your Location");
        });

        var request = {
          location: myLocation,
          radius: "50",
          center: myLocation,
          query: "bus stops"
        };
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, callback);
        map.setCenter(myLocation);

      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, myLocation) {
  infoWindow.setPosition(myLocation);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

// Creating Markers
function createMarker(place) {
  var getLat = place.geometry.location.lat();
  var getLng = place.geometry.location.lng();
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP
  });
  google.maps.event.addListener(marker, "click", function() {
    infoWindow.setContent(place.name);
    finalName = place.name;
    finalLat = getLat;
    finalLng = getLng;
    infoWindow.open(map, this);
  });
}
