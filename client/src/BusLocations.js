import React from 'react';
import {GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';


const locations = ( props ) => {
    
        return(
        <div>
            <p> This is the location: { props.lat } + { props.lng } </p>
            <p> This is a marker: { props.marker }</p>
        </div>
    );
}

export default locations;