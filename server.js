const path = require("path");
const db = require("./database/db");
const token = require("./server-modules/twitter/tokens.js");
const cookieSession = require("cookie-session");
const twitter = require("./server-modules/twitter/twitter-api.js");
const { TwitterApi } = require("twitter-api-v2");

let COOKIE_SESSION_SIGNATURE;
if (process.env.NODE_ENV === "production") {
    COOKIE_SESSION_SIGNATURE = process.env.COOKIE_SESSION_SIGNATURE;
} else {
    COOKIE_SESSION_SIGNATURE =
        require("./secrets.json").COOKIE_SESSION_SIGNATURE;
}
const express = require("express");
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
////////////////////////////////////////////////////////////////////////////////////////////

//TWITTER CLIENT
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
    if (!storedClient)
        return res.json({ error: "failed to connect to twitter" });
    return res.redirect("http://localhost:3000/");
});
//TODO: token refresh
//twitter client of user
app.get("/api/twitter-client", async (req, res) => {
    const user_id = req.session.user_id;
    try {
        const foundTwitterClient = await db.getTwitterClientByUserId(user_id);
        //no client
        if (!foundTwitterClient)
            return res.json({
                client: null,
                error: "NO CLIENT",
                success: false,
            });
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
    const user_id = 2; //1, 2, and 3 are users
    const demoData = await db.getTwitterStatsById(user_id);
    return res.json({ error: null, success: true, data: demoData });
});
//real data
app.get("/api/real-twitter-data", async (req, res) => {
    // TODO: same as above  but with real user_id
});
////////////////////////////////////////////////////////////////////////////////////////////

//TWITTER API CALLS
////////////////////////////////////////////////////////////////////////////////////////////
//myTwitterInfo
app.get("/api/my-twitter-info", async (req, res) => {
    const user_id = req.session.user_id;
    const { access_token } = await db.getTwitterClientByUserId(user_id);
    const appOnlyClient = new TwitterApi(access_token);
    const meUser = await appOnlyClient.v2.me();
    res.json(meUser);
});

//myFollowers
app.get("/api/followers/:twitter_id", async (req, res) => {
    const user_id = req.session.user_id;
    const { access_token } = await db.getTwitterClientByUserId(user_id);
    const twitter_id = req.params.twitter_id;
    const appOnlyClient = new TwitterApi(access_token);
    const myFollowers = await appOnlyClient.v2.followers(twitter_id);
    console.log(myFollowers);
    res.json(myFollowers);
});

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

//get tweets
app.get("/user/tweets/:pagination", async (req, res) => {
    const user_id = req.session.user_id;
    //const pagination = req.params.pagination;

    //get twitter client
    const { twitter_id, access_token } = await db.getTwitterClientByUserId(
        user_id
    );
    const appOnlyClient = new TwitterApi(access_token);
    //get tweets from Twitter
    const result = await twitter.getTweetsByTwitterId(twitter_id, access_token);
    const tweetCollection = result._realData.data;
    //add likes to tweet collection
    for (let i = 0; i < tweetCollection.length; i++) {
        const likes = await appOnlyClient.v2.tweetLikedBy(
            tweetCollection[i].id
        );
        tweetCollection[i].likes = likes.meta.result_count;
    }

    res.json(tweetCollection);
    //get future tweets from DB
    //merge list based on date
    //return JSON
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
