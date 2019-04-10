var numInParty = 0;
var myLocation, myLat, myLong;
var map;
var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
var infoWindow;


function setNumInParty(event){
    numInParty = document.getElementById("numInParty").value
    if(isNaN(numInParty)){
        alert("Please enter a number!");
        return;
    }
    if(numInParty < 1 || numInParty >= 10){
        alert("Please enter a number greater than 0 but less than 10!");
        return;
    }
    url = './passengerSubmission.html?numInParty=' + encodeURIComponent(numInParty);

    document.location.href = url;
}


function initMap(){
    var myMapCenter = {lat: 37.981161, lng: -121.312040};
    infoWindow = new google.maps.InfoWindow();
    
    //Map loads this area first
    map = new google.maps.Map(document.getElementById('map'),{
        center: myMapCenter,
        zoom: 15,
        gestureHandling: 'greedy'
    });

    //Creating marker at myMapCenter
    var startingMarker = new google.maps.Marker({
        position: myMapCenter,
        map: map,
        icon: image
    });

    

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            var myLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            myLat = myLocation.lat;
            myLong = myLocation.lng;
            myLocation = {lat: parseFloat(myLat), lng: parseFloat(myLong)};
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
            service.textSearch(request, callback);
            
            map.setCenter(myLocation);
        }, function(){
            handleLocationError(true, infoWindow, map.getCenter());
        });
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, myLocation){
    infoWindow.setPosition(myLocation);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function callback(results, status){
    if(status == google.maps.places.PlacesServiceStatus.OK){
        for(var i=0; i<results.length; i++){
            var place = results[i];
            createMarker(results[i]);
        }
    }
}

//EXPERIMENT WITH CREATING MARKERS
function createMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
}

//https://maps.googleapis.com/maps/api/place/textsearch/json?query=bus+stops&fields=name,%20place_id&location=37.981052,%20-121.312022&radius=1&key=AIzaSyCDg2zhsGJpYuDRbjC_dUOfiT4bJY0IFA8