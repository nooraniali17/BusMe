/* global google */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const mapStyles = {
    map: {
      position: 'absolute',
      width: '100%',
      height: '50%'
    }
  };

export class CurrentLocation extends Component {
  
    constructor(props) {
        super(props);
        this.state = {
          busStops: [],
          currentLocation: {
            lat: 0,
            lng: 0
          }   

        };
    }

    componentDidUpdate(prevLocation, previousState) {
        if (prevLocation.google !== this.props.google) {
          this.loadMap();
        }
        if (previousState.currentLocation !== this.state.currentLocation) {
          this.recenterMap();
        }
      }

    recenterMap() {
        const map = this.map;
        const current = this.state.currentLocation;
        const google = this.props.google;
        const maps = google.maps;
        if (map) {
          let center = new maps.LatLng(current.lat, current.lng);
          map.panTo(center);
        }
      }

    componentDidMount() {
        if (this.props.centerAroundCurrentLocation) {
          if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              const location = pos.coords;
              this.setState({
                currentLocation: {
                  lat: location.latitude,
                  lng: location.longitude
                }
              }, () => {
                this.loadMap();
                var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
                new google.maps.Marker({
                  position: {
                    lat: location.latitude,
                    lng: location.longitude
                  },
                  map: this.map,
                  title: 'Current location',
                  icon: image
                });
                return;
              });
            });
          }
        }
        this.loadMap();
      }

    callback = (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
          const latt = this.state.currentLocation.lat;
          const longg = this.state.currentLocation.lng;
          const location = {
            lat: latt,
            lng: longg
          };
        const map = this.refs.map;
        map.center = location;
        results.forEach((stop) => {
          const position = {
            lat: stop.geometry.location.lat(),
            lng: stop.geometry.location.lng()
          };
          const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: stop.name
          });
          marker.addListener('click', () => {
            // console.log('marker selected ===> ', marker);
            // this.map.setZoom(20);
            // this.map.setCenter(marker.getPosition());
            console.log(marker.title);
          });
        });
      }
    }

    loadMap() {
        if (this.props && this.props.google) {
          // checks if google is available
          const { google } = this.props;
          const maps = google.maps;
          const mapRef = this.refs.map;
          // reference to the actual DOM element
          const node = ReactDOM.findDOMNode(mapRef);
          let { zoom } = this.props;
          const { lat, lng } = this.state.currentLocation;

          const center = new maps.LatLng(lat, lng);
          const mapConfig = Object.assign({}, {
              center: center,
              zoom: zoom
            }
          );
          // maps.Map() is constructor that instantiates the map
          this.map = new maps.Map(node, mapConfig);

          var service;
          // SET THIS TO YOUR CURRENT LOCATION
          const location = {
            lat: this.state.currentLocation.lat,
            lng: this.state.currentLocation.lng
          };
          var request = {
            location: location,
            radius: '50',
            query: 'bus stops'
          };
          service = new google.maps.places.PlacesService(this.map);
          service.textSearch(request, this.callback);
        }
      }

    renderChildren() {
      const { children } = this.props;
      return React.Children.map(children, c => {
        if (!c) {
          return;
        }
        return React.cloneElement(c, {
          map: this.map,
          google: this.props.google,
          mapCenter: this.state.currentLocation
        });
      });
    }

    render() {
    const style = Object.assign({}, mapStyles.map);
    return (
      <div>
        <div style={style} ref="map">
        </div>
        {this.renderChildren()}
      </div>
    );
  }
}

export default CurrentLocation;

CurrentLocation.defaultProps = {
    zoom: 17,
    centerAroundCurrentLocation: false,
    visible: true
  };

