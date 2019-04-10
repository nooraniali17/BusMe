import React from "react";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Welcome from "./Homepage";
import Stops from "./GoogleMapsAPI";

const Routing = () => (
  <Router>
    <Link to="/">Home</Link>
    <Route exact path="/" component={Welcome} />
    <Route path="/about" component={Stops} />
  </Router>
);

export default Routing;
