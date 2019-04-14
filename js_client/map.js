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
    
    handleUserLocation();
}

function handleUserLocation() {
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
    let getStops = document.getElementById("stop2");

    if(status == google.maps.places.PlacesServiceStatus.OK){
        let place = [];
        for(var i=0; i<results.length; i++){
            place.push(results[i].name);
            createMarker(results[i]);
            let div = document.createElement("a");
            div.innerHTML = place[i];
            getStops.appendChild(div);
        }
    }
}

//EXPERIMENT WITH CREATING MARKERS
function createMarker(place) {
    var getLat = place.geometry.location.lat();
    var getLng = place.geometry.location.lng();
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(place.name);
        console.log(place.name);
        console.log("Latitude: "+getLat);
        console.log("Longitude: "+getLng);
        finalLat = getLat;
        finalLng = getLng;
        infoWindow.open(map, this);
    });
}
