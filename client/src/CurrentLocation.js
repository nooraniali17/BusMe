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
        const { lat, lng } = this.props.initialCenter;
        this.state = {
            currentLocation: {
                lat: lat,
                lng: lng
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
              });
            });
          }
        }
        this.loadMap();
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
        } 
      }

    renderChildren() {
        const { children } = this.props;
        return React.Children.map(children, c => {
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
    initialCenter: {
      lat: -5.2884,
      lng: 13.8233
    },
    centerAroundCurrentLocation: false,
    visible: true
  };

