import "./post-tweet.css";

//HOOKS
import { useState } from "react";
////////////////////////////////////////////////////////////////////////////

//FUNCTIONS
import { tweetNow } from "../../client-functions/api.js";
////////////////////////////////////////////////////////////////////////////

function PostTweet({ setOauth, demo }) {
    //STATE
    let [error, setError] = useState(false);
    let [tweetBody, setTweetBody] = useState("");
    ////////////////////////////////

    //FUNCTIONS
    //keeping state on par with user input
    const handleInputChange = (e) => {
        const userInput = e.target.value;
        if (userInput.length >= 280) setError(true);
        if (userInput.length <= 280) setError(false);
        setTweetBody(userInput);
    };
    //Authorisized users can schedule tweets
    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!tweetBody) return;
        if (error) return;
        //prompt user to authorize twitter
        if (demo) return setOauth(true);
        //TODO: ADD schedule support
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
                <a href="/" onClick={handleSchedule}>
                    Schedule
                </a>
                <h4 onClick={handleTweet} className={tweetBody ? "active" : ""}>
                    TWEET
                </h4>
            </div>
        </form>
    );
}
export { PostTweet };
