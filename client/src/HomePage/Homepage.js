import React, { Component } from 'react';
import MyButton from '../Button';

class HomePage extends Component {

    state = {
        numPassengers: ''
    }

    setNumPassengers = (event) => {
        this.setState({numPassengers: event.target.value });
    }

    findCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.setState({  location: position.coords });
          }
        );
      };
    
    handleInputPassengers = (event) => {
        event.preventDefault();
        const { numPassengers } = this.state;
        
        if(isNaN(numPassengers) || numPassengers >= 11 || numPassengers === '') {
            alert("Please enter a valid integer between 1 and 10!");
            return false
        }
        return true
}

      render() {

        console.log(this.state);
        return (
        <div>
            <button id="findLocation" onClick={ this.findCoordinates }>Find location!</button>
              <h1>Welcome to BusMe!</h1>
              <h3>Please input total number of passengers below</h3>
              <input id="inputPane" type="text" onChange = { this.setNumPassengers }  ></input>
              <br></br>
              <MyButton name="Submit" routeTo="/about" onSubmit = { this.handleInputPassengers }/>
        </div>
        );
    }
};

export default HomePage;
