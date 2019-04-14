import React from "react";

const locations = props => (
  <>
    <p>
      {" "}
      This is the location: {props.lat} + {props.lng}{" "}
    </p>
    <p> This is a marker: {props.marker}</p>
  </>
);

export default locations;
