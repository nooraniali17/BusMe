import React, { Component } from "react";
import { Marker, GoogleApiWrapper } from "google-maps-react";
import CurrentLocation from "./CurrentLocation";

export class MapContainer extends Component {
  state = {
    busStops: [],
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {}
  };

  onMarkerClick = (props, marker) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

  onClose = () => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  setBusStops = busStops => this.setState({ busStops });

  render() {
    return (
      <>
        <CurrentLocation
          setBusStops={this.setBusStops}
          centerAroundCurrentLocation
          google={this.props.google}
        >
          <Marker onClick={this.onMarkerClick} name={"My Location!!"} />
        </CurrentLocation>
      </>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyBFyjnFtBnUWrhJSPRKJV-t9Mn96Fc_6-k"
})(MapContainer);