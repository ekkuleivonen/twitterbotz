import React, { useEffect, useState } from "react";
import Oauth from "../../components/oauth/oauth.js";
import "./analytics.css";

function Analytics(currentUser, twitterClient, demo) {
    //STATE
    let [showOauth, setOauth] = useState(false);
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {}, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS

    ///////////////////////////////////////////////////
    return (
        <div className="component-analytics">
            <h1>ANALYTICS</h1>
            {showOauth && <Oauth />}
        </div>
    );
}

export default Analytics;
