import React, { useEffect, useState } from "react";
import Oauth from "../../components/oauth/oauth.js";
import "./Automation.css";

function Automation(currentUser, twitterClient, demo) {
    //STATE
    let [showOauth, setOauth] = useState(false);
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {}, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS

    ///////////////////////////////////////////////////
    return (
        <div className="component-automation">
            <h1>COMING SOON</h1>
            {showOauth && <Oauth />}
        </div>
    );
}

export default Automation;
