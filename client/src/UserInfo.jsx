import React from "react";

const numPass = props => {
  return (
    <div>
      <input type="text" onChange={props.setPassengers} />
    </div>
  );
};

export default numPass;
