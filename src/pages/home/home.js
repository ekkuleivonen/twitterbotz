import "./home.css";

//Hooks
import { useEffect } from "react";
////////////////////////////////

//COMPONENTS
import { PostTweet } from "../../components/post-tweet/post-tweet.js";
import { LineChart } from "../../charts/line-chart.js";
import { StatHighlight } from "../../components/stat-highlight/stat-highlight.js";
////////////////////////////////

function Home({ twitterData, user, twitterClient, demo, setOauth }) {
    //STATE

    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("home component mounted");
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS

    ///////////////////////////////////////////////////
    return (
        <div className="component-home">
            <div className="home-grid">
                <div className="cell cell1">
                    <div className="follower-graph">
                        <LineChart twitterData={twitterData} />
                    </div>
                    <StatHighlight twitterData={twitterData} />
                </div>
                <div className="cell cell2">
                    <PostTweet setOauth={setOauth} demo={demo} />
                </div>
                <div className="cell cell3">
                    <h2>HELLO</h2>
                </div>
            </div>
        </div>
    );
}

export default Home;
