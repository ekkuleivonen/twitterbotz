import React, { useEffect, useState } from "react";
import "./ai-writer.css";
import Typed from "react-typed";
import { tweetNow, tweetLater } from "../../client-functions/api.js";

function AiWriter({ setOauth, demo }) {
    //STATE
    let [aiGeneration, setAiGeneration] = useState(null);
    let [aiResponse, setAiResponse] = useState("");
    let [showLoader, setShowLoader] = useState(false);
    let [showWaiting, setShowWaiting] = useState(true);
    let [inputReady, setInputReady] = useState(false);
    let [tweetReady, setTweetReady] = useState(false);
    let [tweetBody, setTweetBody] = useState("");
    let [tweetDate, setTweetDate] = useState(null);
    let [showTimeSelector, setTimeSelector] = useState(false);
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("AI-WRITER component mounted");
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS
    const addTimetoDate = (e) => {
        e.preventDefault();
        const HOURS = e.target.value.split(":")[0];
        const MINUTES = e.target.value.split(":")[1];
        const dateAndTime = new Date(tweetDate).setHours(HOURS, MINUTES);
        setTweetDate(new Date(dateAndTime).toISOString());
    };
    //Authorisized users can schedule tweets
    const openTimeSelector = (e) => {
        e.preventDefault();
        if (!tweetBody) return;
        //prompt user to authorize twitter
        if (demo) return setOauth(true);
        setTimeSelector(true);
    };

    const handleSchedule = async (e) => {
        //TODO: ADD schedule support
        e.preventDefault();
        console.log(new Date(tweetDate));
        const storedTweet = await tweetLater(tweetBody, tweetDate);
        console.log(storedTweet);
        setTimeSelector(false);
        document.getElementById("tweet-area").value = "";
        setTweetBody("");
    };
    const handleInputChange = (e) => {
        if (e.target.value !== "") setInputReady(true);
        if (e.target.value === "") setInputReady(false);
        setAiGeneration(e.target.value);
    };

    const handleTweetChange = (e) => {
        if (e.target.value !== "") setTweetReady(true);
        if (e.target.value === "") setTweetReady(false);
        setTweetBody(e.target.value);
    };

    const handleAiWriter = async (e) => {
        e.preventDefault();
        setShowWaiting(false);
        setTweetReady(false);
        setShowLoader(true);
        setAiResponse("");
        const resp = await fetch("/api/ai-writer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ aiGeneration }),
        });
        const response = await resp.json();
        setAiResponse(response.data);
        setTweetBody(response.data);
        setShowLoader(false);
        setShowWaiting(true);
        setTweetReady(true);
    };

    const handleTweet = async () => {
        console.log("HANDLE TWEET: ", tweetBody);
        if (!tweetBody) return;
        //prompt user to authorize twitter
        if (demo) return setOauth(true);
        //Tweet now
        await tweetNow(tweetBody);
        //TODO: show new tweet in UI
        document.getElementById("tweet-area").value = "";
        setTweetBody("");
    };

    ///////////////////////////////////////////////////

    return (
        <div className="component-ai-writer">
            <div className="wrapper">
                <form className="left-cell" onSubmit={handleAiWriter}>
                    <h2>Give instructions for the AI</h2>
                    <input
                        type="text"
                        name="prompt"
                        id="prompt"
                        placeholder="Write an inspiring tweet about innovation"
                        autoComplete="off"
                        onChange={handleInputChange}
                    />

                    <h4
                        onClick={handleAiWriter}
                        id="generate"
                        className={inputReady ? "active" : ""}
                    >
                        GENERATE TWEET
                    </h4>
                </form>
                <form className="right-cell" onSubmit={handleTweet}>
                    <div className="typed-holder">
                        {showLoader && (
                            <img src="loading-buffering.gif" alt="Loading" />
                        )}
                        {showWaiting && (
                            <p id="waiting">waiting for input...</p>
                        )}
                        {aiResponse && (
                            <Typed
                                strings={[aiResponse]}
                                typeSpeed={40}
                                reset={true}
                                showCursor={true}
                            >
                                <textarea
                                    id="tweet-area"
                                    onChange={handleTweetChange}
                                />
                            </Typed>
                        )}
                    </div>
                    <div className="submit-controls">
                        <a href="/" onClick={openTimeSelector}>
                            Schedule
                        </a>
                        <h4
                            id="tweet"
                            className={tweetReady ? "active" : ""}
                            onClick={handleTweet}
                        >
                            TWEET
                        </h4>
                    </div>

                    {showTimeSelector && (
                        <div className="time-select">
                            <input
                                type="date"
                                id="tweet_date"
                                name="tweet_date"
                                min={new Date()}
                                required
                                onChange={(e) =>
                                    setTweetDate(
                                        new Date(e.target.value).toUTCString()
                                    )
                                }
                            />
                            <input
                                type="time"
                                id="tweet_time"
                                name="tweet_time"
                                required
                                onChange={addTimetoDate}
                            />
                            <h4 onClick={handleSchedule} className="active">
                                SCHEDULE
                            </h4>
                            <h5 onClick={() => setTimeSelector(false)}>
                                Cancel
                            </h5>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AiWriter;
