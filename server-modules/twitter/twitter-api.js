const { TwitterApi } = require("twitter-api-v2");
const {
    TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET,
} = require("../../secrets.json");

const getTweetsByTwitterId = async (twitter_id, access_token) => {
    try {
        const appOnlyClient = new TwitterApi(access_token);
        const foundTweets = await appOnlyClient.v2.userTimeline(twitter_id, {
            exclude: "replies",
        });
        return foundTweets;
    } catch (error) {
        console.log(error);
    }
};

module.exports = { getTweetsByTwitterId };
