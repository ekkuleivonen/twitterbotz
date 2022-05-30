import React, { useEffect, useState } from "react";
import Oauth from "../../components/oauth/oauth.js";
import "./tweets.css";

function Tweets(currentUser, twitterClient, demo) {
    //STATE
    let [showOauth, setOauth] = useState(false);
    let [error, setError] = useState(false);
    let [scheduledTweets, setScheduledTweets] = useState([]);
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("Tweets component mounted");
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS
    ///////////////////////////////////////////////////

    return (
        <div className="component-tweets">
            <h1>TWEETS</h1>

            {showOauth && <Oauth />}
        </div>
    );
}

export default Tweets;
