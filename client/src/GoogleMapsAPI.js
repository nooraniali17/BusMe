import React, { Component } from 'react';
import {GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import CurrentLocation from './CurrentLocation';
import Locations from './BusLocations';

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
          // <Locations lat='37.9809884'
          //            lng='-121.3178416'>
          // </Locations>

          <CurrentLocation
            centerAroundCurrentLocation
            lat = '37.9809884'
            lng = '-121.3178416'
            google={this.props.google}
          >
            <Marker onClick={this.onMarkerClick} name={'Your Location'} />
            <Marker onClick={this.onMarkerClick} name={'Bus Stop #1'}/>
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}
              onClose={this.onClose}
            >
              <div>
                <h4>{this.state.selectedPlace.name}</h4>
              </div>
            </InfoWindow>
           </CurrentLocation>
        );
      }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyBFyjnFtBnUWrhJSPRKJV-t9Mn96Fc_6-k')
})(MapContainer)