var numInParty = 0;
var myLocation, myLat, myLong;
var map;
var infoWindow;
var finalLat;
var finalLng;
var finalName;
let image =
  "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
let locations;
let button;
let stopLatMarker = [];
let stopLngMarker = [];
let placesMarker = [];
let iterator = 0;
let markerArray = [];

function initPage() {
  //LEARNING HOW TO GET
  const Url = "http://66cc3b6a.ngrok.io";
  const payLoad = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "GET"
  };
  //part of the js api
  fetch(Url, payLoad)
    .then(data => data.json())
    .then(res => {
      //GOING THROUGH DATABASE AND MAKING HASHMAP
      const myMap = new Map();
      let index = 0;
      let value = 0;
      infoWindow = new google.maps.InfoWindow();

      for (index = 0; index < res.length; index++) {
        if (!myMap.has(res[index].stop_name)) {
          myMap.set(res[index].stop_name, res[index].num_pass);
          stopLatMarker.push(res[index].latitude);
          stopLngMarker.push(res[index].longitude);
          placesMarker.push(res[index].stop_name);
        } else {
          value = myMap.get(res[index].stop_name);
          value = value + res[index].num_pass;
          myMap.set(res[index].stop_name, value);
        }
      }
      generateTable(myMap);
    })
    .catch(error => console.log(error));
}

function reloadPage(event) {
  location.reload();
}

function generateTable(myMap) {
  // grabs body tag and saves in body variable
  let body = document.getElementsByTagName("body")[0];
  let tbl = document.createElement("table");
  let tblBody = document.createElement("tbody");
  let i = 0;
  let j = 0;
  let cellText;
  let breakTag = document.createElement("BR");
  let mapIter = myMap.entries();
  let hashMapEntry = mapIter.next().value;

  // creating the cells below
  for (i = 0; i < myMap.size; i++) {
    // creates the correct number of rows from the number
    // of rows in our HashMap

    let row = document.createElement("tr");
    button = document.createElement("button");
    button.style.fontWeight = "bold";
    button.style.backgroundColor = "#9dbdf2";
    button.style.border = "#9dbdf2";
    button.style.color = "white";

    button.innerHTML = "Select";
    buttonLogic(button, i, myMap);

    for (j = 0; j < 2; j++) {
      let cell = document.createElement("td");
      if (j == 0) {
        cellText = document.createTextNode(hashMapEntry[j]);
      } else {
        cellText = document.createTextNode(hashMapEntry[j]);
      }
      cell.append(cellText);
      row.appendChild(cell);
      row.append(button);
    }

    tblBody.appendChild(row);
    hashMapEntry = mapIter.next().value;
  }

  tbl.appendChild(tblBody);
  body.appendChild(tbl);
  tbl.setAttribute("border", "4");
  body.appendChild(breakTag);
  body.appendChild(breakTag);
  body.appendChild(breakTag);
  body.appendChild(breakTag);
  body.appendChild(breakTag);
}

window.onload = initPage;

function buttonLogic(button, i, myMap) {
  button.onclick = function() {
    let marker = new google.maps.Marker({

    })
    let mapIter = myMap.entries();
    let hashMapEntry;
    for (let index = 0; index < i + 1; index++) {
      hashMapEntry = mapIter.next().value;
      //   hashMapEntry[0] will give location
    }
    console.log(hashMapEntry);
    console.log(stopLatMarker);
    console.log(stopLngMarker);
    console.log(placesMarker);

    locations = {
      stopLat: parseFloat(stopLatMarker[i]),
      stopLng: parseFloat(stopLngMarker[i])
    };

    let sLat = locations.stopLat;
    let sLng = locations.stopLng;
    let places = placesMarker[i];
    let stopLocations = { lat: parseFloat(sLat), lng: parseFloat(sLng) };
    console.log(stopLocations);
    clearMarkers();
    createMarker(stopLocations, places);
  };
}

function clearMarkers() {
  setMapOnAll(null);
  map.setZoom(12);
}

function setMapOnAll(map) {
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(map);
  }
}

// CREATING MAP FOR BUS DRIVER
function initMap() {
  infoWindow = new google.maps.InfoWindow();
  var myMapCenter = { lat: 37.981161, lng: -121.31204 };
  // infoWindow = new google.maps.infoWindow();

  map = new google.maps.Map(document.getElementById("map"), {
    center: myMapCenter,
    zoom: 12
  });

  var startMarker = new google.maps.Marker({
    position: myMapCenter,
    map: map,
    icon: image
  });
  //remove if block below to not get bus location
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
        infoWindow.setPosition(myLocation);
        infoWindow.setContent("Bus Location Found");
        infoWindow.open(map);
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

function createMarker(stopLocations, places) {
  let marker = new google.maps.Marker({
    position: stopLocations,
    map: map,
    animation: google.maps.Animation.DROP
  });
  markerArray.push(marker);
  google.maps.event.addListener(marker, "click", function() {
    infoWindow.setContent(places);
    infoWindow.open(map, this);
    map.setZoom(17);
    map.setCenter(marker.getPosition());
  });
}
