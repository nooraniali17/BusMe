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
let marker;



function initPage() {
  //LEARNING HOW TO GET
  const Url = "http://76d06896.ngrok.io";
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

      for (index = 0; index < res.length; index++) {
        if (!myMap.has(res[index].stop_name)) {
          myMap.set(res[index].stop_name, res[index].num_pass);
        } else {
          value = myMap.get(res[index].stop_name);
          value = value + res[index].num_pass;
          myMap.set(res[index].stop_name, value);
        }
        locations = { stopLat: parseFloat(res[index].latitude), stopLng: parseFloat(res[index].longitude) };
        console.log(locations);
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
  let mapIter = myMap.entries();
  let hashMapEntry = mapIter.next().value;

  // creating the cells below
  for (i = 0; i < myMap.size; i++) {
    // creates the correct number of rows from the number
    // of rows in our HashMap
    let row = document.createElement("tr");
    for (j = 0; j < 2; j++) {
      let cell = document.createElement("td");
      if (j == 0) {
        cellText = document.createTextNode(hashMapEntry[j]);
      } else {
        cellText = document.createTextNode(hashMapEntry[j]);
      }
      cell.append(cellText);
      row.appendChild(cell);
    }
    tblBody.appendChild(row);
    hashMapEntry = mapIter.next().value;
  }

  tbl.appendChild(tblBody);
  body.appendChild(tbl);
  tbl.setAttribute("border", "2");
}

window.onload = initPage;

// CREATING MAP FOR BUS DRIVER
function initMap() {
  infoWindow = new google.maps.InfoWindow();
  var myMapCenter = { lat: 37.981161, lng: -121.31204 };
  // infoWindow = new google.maps.infoWindow();

  map = new google.maps.Map(document.getElementById("map"), {
    center: myMapCenter,
    zoom: 12,
  });

  var startMarker = new google.maps.Marker({
    position: myMapCenter,
    map: map,
    icon: image
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