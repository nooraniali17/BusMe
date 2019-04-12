import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import BusStops from './BusStops';
import App from './App';

const Routing = () => {
    return(
        <Router>
            <div>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/menu">Menu</Link>
                    </li>
                </ul>
                <hr></hr>
                <Route exact path = "/" component={App}/>
                <Route path ="/menu" component={BusStops}/>
            </div>
        </Router>
    );
}

const Home = () => {
    return(
        <div>
            <h1>Home</h1>
        </div>
    );
}

const Stops = () => {
    return(
        <div>
            <h1>Nearby stops!</h1>
        </div>
    );
}

export default Routing;