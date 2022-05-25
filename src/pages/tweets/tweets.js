import React, { useEffect, useState } from "react";
import Oauth from "../../components/oauth/oauth.js";
import "./tweets.css";

function Tweets(currentUser, twitterClient, demo) {
    //STATE
    let [showOauth, setOauth] = useState(false);
    let [error, setError] = useState(false);
    let [tweets, setTweets] = useState([]);
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("Tweets component mounted");
        getTweets(1);
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS
    const getTweets = async (pagination) => {
        const response = await fetch(`/user/tweets/${pagination}`);
        const foundTweets = await response.json();
        if (foundTweets.error) return setError((error = true));
        if (foundTweets) return setTweets((tweets = [...foundTweets]));
    };
    ///////////////////////////////////////////////////

    return (
        <div className="component-tweets">
            <h1>TWEETS</h1>
            <div className="past-tweets">
                {tweets.map((tweet) => (
                    <div className="tweet" key={tweet.id}>
                        <p>{tweet.text}</p>
                    </div>
                ))}
            </div>

            {showOauth && <Oauth />}
        </div>
    );
}

export default Tweets;
