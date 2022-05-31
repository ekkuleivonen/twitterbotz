const path = require("path");
const db = require("./database/db");
const token = require("./server-modules/twitter/tokens.js");
const cookieSession = require("cookie-session");
const twitter = require("./server-modules/twitter/twitter-api.js");
const { TwitterApi } = require("twitter-api-v2");
const cron = require("node-cron");

let COOKIE_SESSION_SIGNATURE;
let HOME;
if (process.env.NODE_ENV === "production") {
    COOKIE_SESSION_SIGNATURE = process.env.COOKIE_SESSION_SIGNATURE;
    HOME = "https://twitterbotz-v2.herokuapp.com";
} else {
    COOKIE_SESSION_SIGNATURE =
        require("./secrets.json").COOKIE_SESSION_SIGNATURE;
    HOME = "http://localhost:3000/";
}
const express = require("express");
const { dblClick } = require("@testing-library/user-event/dist/click");
const app = express();

//MIDDLEWARE
////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    cookieSession({
        secret: COOKIE_SESSION_SIGNATURE,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
////////////////////////////////////////////////////////////////////////////////////////////

//USER
//require login
app.get("/api/user/me", async (req, res) => {
    const user_id = req.session.user_id;
    //logged in users have user_id stored in session
    if (typeof user_id !== "number")
        return res.json({ isLoggedIn: false, user: null });

    const { id, username, email } = await db.getUserById(user_id);
    const user = { id, username, email };

    res.json({ user, isLoggedIn: true });
});
//register
app.post("/api/register", async (req, res) => {
    const registerInput = req.body;
    console.log("CLIENT INPUT FOR REGISTRATION: ", registerInput);
    try {
        const newUser = await db.createUser(registerInput);
        await db.createTwitterDataRow(newUser[0].id);
        req.session.user_id = newUser[0].id;
        res.json({ success: true, error: null });
    } catch (error) {
        if (error.code === "23505") {
            res.json({ success: false, error: error.code });
        }
        console.log(error);
    }
});
//log in new user
app.post("/api/login", async (req, res) => {
    const loginInput = req.body;
    try {
        const loggedInUser = await db.loginUser(loginInput);
        //wrong credentials or user doesnt exist
        if (loggedInUser == null)
            return res.json({ success: false, error: true });
        //succesfull authentication
        req.session.user_id = loggedInUser[0].id;
        res.json({ success: true, error: false });
    } catch (err) {
        console.log(err);
    }
});
//current user info
app._router.get("/api/me", async (req, res) => {
    const user_id = req.session.user_id;
    const foundUser = await db.getUserById(user_id);
    if (!foundUser) return res.json({ user: null, error: "User not found" });
    const user = {
        username: foundUser.username,
        email: foundUser.email,
        user_id: foundUser.id,
    };
    return res.json(user);
});

//TWITTER OAUTH
//send user to twitter
app.get("/auth/twitter", async (req, res) => {
    const user_id = req.session.user_id;
    const { url, codeVerifier, state } = token.generateTwitterLink();
    req.session.codeVerifier = codeVerifier;
    req.session.state = state;
    const session = await db.writeSession(state, codeVerifier, user_id);
    console.log(session);
    res.redirect(url);
});
//obtain access token
app.get("/auth/twitter/callback", async (req, res) => {
    const { state, code } = req.query;
    const { code_verifier: codeVerifier, session_state: sessionState } =
        await db.readSession(state);

    const loggedClient = await token.getAccessToken(
        state,
        code,
        codeVerifier,
        sessionState
    );
    console.log("final client", loggedClient);
    const { user_id } = await db.readSession(state);
    const storedClient = await db.storeTwitterClient(loggedClient, user_id);
    console.log("STORED TWITTER CLIENT: ", storedClient);
    if (!storedClient)
        return res.json({ error: "failed to connect to twitter" });
    return res.redirect(HOME);
});
//scheduled token refresh
const updateTokens = async () => {
    console.log("UPDATING TOKENS");
    const expiringClients = await db.getExpiringClients(10); //minutes //900 seconds == 15 min // 3600 seconds = 1hour
    if (expiringClients.length < 1)
        return console.log("ALL CLIENTS UP TO DATE");
    console.log(
        `EXPIRING CLIENTS COUNT: ${expiringClients.length} --> REQUESTING TWITTER FOR NEW TOKENS...`
    );
    const updatedClients = await token.updateClients(expiringClients);
    console.log("UPDATED CLIENTS COUNT: ", updatedClients.length);
};
cron.schedule("*/30 * * * *", updateTokens); // "*/30 * * * *" --> every 30 min
//twitter client of user
app.get("/api/twitter-client", async (req, res) => {
    const user_id = req.session.user_id;
    try {
        const foundTwitterClient = await db.getTwitterClientByUserId(user_id);
        //no client
        if (!foundTwitterClient) {
            console.log("No Twitter client found");
            return res.json({
                client: null,
                error: "NO CLIENT",
                success: false,
            });
        }
        //client expired
        const clientHasExpired = await db.checkClientExpiry(7200, user_id);
        if (clientHasExpired) {
            console.log("client expired");
            return res.json({
                client: null,
                error: "CLIENT EXPIRED",
                success: false,
            });
        }
        //success
        const client = {
            twitter_id: foundTwitterClient.twitter_id,
            twitter_username: foundTwitterClient.twitter_username,
            access_token: foundTwitterClient.access_token,
        };
        return res.json({ client: client, error: null, success: true });
    } catch (err) {
        console.log(err);
    }
});
////////////////////////////////////////////////////////////////////////////////////////////

//POPULATE APP WITH DATA
//demo
app.get("/api/demo-twitter-data", async (req, res) => {
    const user_id = 2; //1, 2, and 3 are test users
    const demoData = await db.getTwitterStatsById(user_id);
    return res.json({ error: null, success: true, data: demoData });
});
//real data
app.get("/api/real-twitter-data", async (req, res) => {
    const user_id = req.session.user_id;
    const { access_token, twitter_id } = await db.getTwitterClientByUserId(
        user_id
    );
    //fetch tweet data
    const { seven_day_likes, seven_day_retweets, seven_day_engagement } =
        await twitter.getUserTimeLineById(twitter_id, access_token);
    //get newest follower data
    const twitterClient = await db.getTwitterClientByUserId(user_id);
    const todays_real_followers = await twitter.getLatestFollowers(
        twitterClient
    );
    //fetch historic followers data
    const followersData = await db.getTwitterStatsById(user_id);

    res.json({
        ...followersData,
        seven_day_likes: seven_day_likes,
        seven_day_retweets: seven_day_retweets,
        seven_day_engagement: seven_day_engagement,
        todays_followers: todays_real_followers,
    });
});

const updateHistoricFollowerData = async () => {
    console.log("UPDATING TWITTER STATS FOR AUTHENTICATED USERS...");
    const twitterClients = await db.getAllTwitterClients();
    const result = await twitter.updateFollowers(twitterClients);
    console.log("results:", result);
};
cron.schedule("0 0 0 * * *", updateHistoricFollowerData); //"0 0 0 * * *" = every midnight
////////////////////////////////////////////////////////////////////////////////////////////

//TWITTER API ACTIONS
//tweet now
app.post("/api/tweet-now", async (req, res) => {
    const user_id = req.session.user_id;
    const { access_token } = await db.getTwitterClientByUserId(user_id);
    const appOnlyClient = new TwitterApi(access_token);
    //user input
    const tweetBody = req.body.tweetBody;
    console.log("tweet body; ", tweetBody);
    const { data: createdTweet } = await appOnlyClient.v2.tweet(tweetBody);
    console.log("Tweet", createdTweet.id, ":", createdTweet.text);
    res.json(createdTweet);
});
// tweet later
app.post("/api/tweet-later", async (req, res) => {
    // add tweet data and date to database
    const user_id = req.session.user_id;
    const { tweetBody, tweetDate } = req.body;
    const scheduledTweet = await db.scheduleTweet(
        user_id,
        tweetBody,
        new Date(tweetDate)
    );
    console.log(scheduledTweet);
    res.json(scheduledTweet);
});
const uploadTweetsFromDB = async () => {
    console.log("SEARCHING FOR TWEETS TO BE UPLOADED FROM DB");
    //find expired tweets and access tokens from DB
    const expiredTweets = await db.findExpiredTweets();
    console.log("TWEETS EXPIRED COUNT: ", expiredTweets.length);
    if (expiredTweets.length < 1)
        return console.log("NO TWEETS TO BE UPLOADED");
    //loop through found tweets
    expiredTweets.forEach(async (tweet) => {
        const appOnlyClient = new TwitterApi(tweet.access_token);
        const { data: createdTweet } = await appOnlyClient.v2.tweet(
            tweet.payload
        );
        console.log(createdTweet);
        //remove tweet from db;
        const removedTweet = await db.removeOldTweet(tweet.id);
        console.log("OLD TWEET REMOVED: ", removedTweet);
    });
};
cron.schedule("*/2 * * * *", uploadTweetsFromDB); //"*/2 * * * *" = every 2min
////////////////////////////////////////////////////////////////////////////////////////////

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
