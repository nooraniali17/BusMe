import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import CurrentLocation from './CurrentLocation';
import Locations from './BusLocations';


// const busStop = {
//   stops: [
//     { name: 'Bus Stop #1', lat:37.9809884, lng: -121.3178416
//     },
//     { name: 'Bus Stop #2', lat: 39.534592, lng: -120.3532425
//     },
//     { name: 'Bus Stop #3', lat: 40.534592, lng: -126.3532425
//     }
//   ]
// }

export class MapContainer extends Component {
    state = {
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {}
      };
    
      onMarkerClick = (props, marker, e) =>
        this.setState({
          selectedPlace: props,
          activeMarker: marker,
          showingInfoWindow: true
        });
    
      onClose = props => {
        if (this.state.showingInfoWindow) {
          this.setState({
            showingInfoWindow: false,
            activeMarker: null
          });
        }
      };

      render() {

        return (
          <div>
            <CurrentLocation
            centerAroundCurrentLocation
            google={this.props.google}>
            <Marker onClick = {this.onMarkerClick} name={'My Location!!'}/>
            <Marker onClick = {this.onMarkerClick} position = {{lat: 37.9762059, lng: -121.3294946}} name={'Country Club Blvd & Fontana Arr Eb'}/>
            <Marker onClick = {this.onMarkerClick} position = {{lat: 37.9809884, lng: -121.3178416}} name={'Pershing Ave & Brookside Rd SB'}/>
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}
              onClose={this.onClose}>
            <div>
              <h1>{this.state.selectedPlace.name}</h1>
            </div>
            </InfoWindow>
          </CurrentLocation>
          </div>

        );
      }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyBFyjnFtBnUWrhJSPRKJV-t9Mn96Fc_6-k')
})(MapContainer)
