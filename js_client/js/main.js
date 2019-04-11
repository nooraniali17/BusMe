let map;
const image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
let infoWindow;

function setPartySize() {
  const party = document.getElementById('party').value;
  if (isNaN(party)) {
    alert('Please enter a number.');
    return;
  }
  if (party < 1 || party >= 10) {
    alert('Please enter a number between 0 and 10.');
    return;
  }
  document.location.href = `./submit.html?party=${encodeURIComponent(party)}`;
}

function initMap() {
  infoWindow = new google.maps.InfoWindow();

  //Map loads this area first
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 37.981161, lng: -121.312040 },
    zoom: 15,
    gestureHandling: 'greedy'
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const location = {
        lat: parseFloat(position.coords.latitude),
        lng: parseFloat(position.coords.longitude)
      };
      infoWindow.setPosition(location);

      infoWindow.setContent('Location Found');
      infoWindow.open(map);

      const service = new google.maps.places.PlacesService(map);
      service.textSearch({
        location,
        radius: '50',
        center: location,
        query: 'bus stops'
      }, (results, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (const r of results) {
            createMarker(r);
          }
        }
      });

      map.setCenter(location);
    }, () => {
      infoWindow.setPosition(map.getCenter());
      infoWindow.setContent('Error: The Geolocation service has failed.');
      infoWindow.open(map);
    });
  }
}

//EXPERIMENT WITH CREATING MARKERS
function createMarker(place) {
  google.maps.event.addListener(new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP
  }), 'click', () => {
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}

window.addEventListener('load', initMap);

//https://maps.googleapis.com/maps/api/place/textsearch/json?query=bus+stops&fields=name,%20place_id&location=37.981052,%20-121.312022&radius=1&key=AIzaSyCDg2zhsGJpYuDRbjC_dUOfiT4bJY0IFA8