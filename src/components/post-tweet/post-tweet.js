import "./post-tweet.css";

//HOOKS
import { useState } from "react";
////////////////////////////////////////////////////////////////////////////

//FUNCTIONS
import { tweetLater, tweetNow } from "../../client-functions/api.js";
////////////////////////////////////////////////////////////////////////////

function PostTweet({ setOauth, demo }) {
    //STATE
    let [error, setError] = useState(false);
    let [tweetBody, setTweetBody] = useState("");
    let [tweetDate, setTweetDate] = useState(null);
    let [showTimeSelector, setTimeSelector] = useState(false);
    ////////////////////////////////

    //FUNCTIONS
    //keeping state on par with user input
    const handleInputChange = (e) => {
        const userInput = e.target.value;
        if (userInput.length >= 280) setError(true);
        if (userInput.length <= 280) setError(false);
        setTweetBody(userInput);
    };
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
        if (error) return;
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
        document.getElementById("tweet-body").value = "";
        setTweetBody("");
    };
    //Authorisized users can post tweets
    const handleTweet = async () => {
        if (!tweetBody) return;
        if (error) return;
        //prompt user to authorize twitter
        if (demo) return setOauth(true);
        //Tweet now
        const tweet = await tweetNow(tweetBody);
        //TODO: show new tweet in UI
        document.getElementById("tweet-body").value = "";
        setTweetBody("");
    };

    ////////////////////////////////

    return (
        <form className="PostTweet">
            <h2>POST A TWEET</h2>
            <textarea
                name="tweet"
                id="tweet-body"
                placeholder="Hello world..."
                onChange={handleInputChange}
                className={error ? "error" : ""}
            />
            <div className="submit">
                <a href="/" onClick={openTimeSelector}>
                    Schedule
                </a>
                <h4 onClick={handleTweet} className={tweetBody ? "active" : ""}>
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
                            setTweetDate(new Date(e.target.value).toUTCString())
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
                    <h5 onClick={() => setTimeSelector(false)}>Cancel</h5>
                </div>
            )}
        </form>
    );
}
export { PostTweet };
