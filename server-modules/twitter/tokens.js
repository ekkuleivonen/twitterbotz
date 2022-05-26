const { TwitterApi } = require("twitter-api-v2");
let TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET;

if (process.env.NODE_ENV === "production") {
    TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT;
    TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
} else {
    TWITTER_CLIENT_ID = require("../../secrets.json").TWITTER_CLIENT_ID;
    TWITTER_CLIENT_SECRET = require("../../secrets.json").TWITTER_CLIENT_SECRET;
}
let CALLBACK_URL;
if (process.env.NODE_ENV === "production") {
    CALLBACK_URL = "https://twitterbotz-v2.herokuapp.com/auth/twitter/callback";
} else {
    CALLBACK_URL = "http://www.localhost:3001/auth/twitter/callback";
}

const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
});

module.exports.generateTwitterLink = () => {
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
        CALLBACK_URL,
        {
            scope: [
                "tweet.read",
                "tweet.write",
                "tweet.moderate.write",
                "users.read",
                "follows.read",
                "follows.write",
                "offline.access",
                "space.read",
                "mute.read",
                "mute.write",
                "like.read",
                "like.write",
                "list.read",
                "list.write",
                "block.read",
                "block.write",
                "bookmark.read",
                "bookmark.write",
            ],
        }
    );
    return { url: url, codeVerifier: codeVerifier, state: state };
};

module.exports.getAccessToken = async (
    state,
    code,
    codeVerifier,
    sessionState
) => {
    console.table({
        state: state,
        code: code,
        codeVerifier: codeVerifier,
        sessionState: sessionState,
    });

    if (!codeVerifier || !state || !sessionState || !code) {
        console.log("User denied the app or session expired!");
    }
    if (state !== sessionState) {
        console.log("Stored tokens didnt match!");
    }

    return client
        .loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
        .then(
            async ({
                client: loggedClient,
                accessToken,
                refreshToken,
                expiresIn,
            }) => {
                const { data: userObject } = await loggedClient.v2.me();
                console.log(userObject);
                const clientSummary = {
                    twitter_username: userObject.username,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn,
                    twitter_id: userObject.id,
                };
                return clientSummary;
            }
        )
        .catch(() => {
            console.log("Invalid verifier or access tokens!");
        });
};
