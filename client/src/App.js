import React, { Component } from 'react';
import './static/app.css';
import './BusStops';
import Routing from './Routing';

export default class App extends Component {

  state = {
    location: null
  }

  render() {
    console.log(this.state);
    
    return (
      <div className="App">
        <header className="app-header">
        </header>
      <Routing/>
      </div>
    );
  }
}