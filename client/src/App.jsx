import React, { Component } from "react";
import "./static/app.css";
import Routing from "./Routing";

export default class App extends Component {
  render() {
    console.log(this.state);
    return (
      <div className="App">
        <header className="app-header" />
        <Routing />
      </div>
    );
  }
}
