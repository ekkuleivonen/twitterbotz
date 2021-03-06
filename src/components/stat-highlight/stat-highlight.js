import "./stat-highlight.css";

//Hooks
import { useEffect } from "react";
////////////////////////////////
export { StatHighlight };
function StatHighlight({ twitterData, demo }) {
    //STATE
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("StatHighlight mounted");
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS
    ///////////////////////////////////////////////////
    return (
        <div className="StatHighlight">
            <div className="stat-cell">
                <h2>FOLLOWERS</h2>
                <h3>{twitterData.todays_followers}</h3>
            </div>
            <div className="stat-cell">
                <h2>LIKES</h2>
                <h3>{twitterData.seven_day_likes}</h3>
            </div>
            <div className="stat-cell">
                <h2>RETWEETS</h2>
                <h3>{twitterData.seven_day_retweets}</h3>
            </div>
            <div className="stat-cell">
                <h2>ENGAGEMENT</h2>
                <h3>{twitterData.seven_day_engagement}</h3>
            </div>
        </div>
    );
}
