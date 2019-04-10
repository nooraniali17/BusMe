var numInParty = 0;
var myLocation, myLat, myLong;
var map;
var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
var infoWindow;


function setNumInParty() {
    numInParty = document.getElementById("numInParty").value
    if (isNaN(numInParty)) {
        alert("Please enter a number.");
        return;
    }
    if (numInParty < 1 || numInParty >= 10) {
        alert("Please enter a number between 0 and 10.");
        return;
    }
    url = `./passengerSubmission.html?numInParty=${encodeURIComponent(numInParty)}`;

    document.location.href = url;
}


function initMap() {
    var myMapCenter = { lat: 37.981161, lng: -121.312040 };
    infoWindow = new google.maps.InfoWindow();

    //Map loads this area first
    map = new google.maps.Map(document.getElementById('map'), {
        center: myMapCenter,
        zoom: 15,
        gestureHandling: 'greedy'
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            var myLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            myLat = myLocation.lat;
            myLong = myLocation.lng;
            myLocation = { lat: parseFloat(myLat), lng: parseFloat(myLong) };
            infoWindow.setPosition(myLocation);

            infoWindow.setContent("Location Found");
            infoWindow.open(map);

            var request = {
                location: myLocation,
                radius: '50',
                center: myLocation,
                query: 'bus stops'
            };
            service = new google.maps.places.PlacesService(map);
            service.textSearch(request, (results, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i]);
                    }
                }
            });

            map.setCenter(myLocation);
        }, () => {
            infoWindow.setPosition(map.getCenter());
            infoWindow.setContent('Error: The Geolocation service has failed.');
            infoWindow.open(map);
        });
    }
}

//EXPERIMENT WITH CREATING MARKERS
function createMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener(marker, 'click', () => {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
}

//https://maps.googleapis.com/maps/api/place/textsearch/json?query=bus+stops&fields=name,%20place_id&location=37.981052,%20-121.312022&radius=1&key=AIzaSyCDg2zhsGJpYuDRbjC_dUOfiT4bJY0IFA8