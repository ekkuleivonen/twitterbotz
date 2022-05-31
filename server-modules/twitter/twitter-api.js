const { TwitterApi } = require("twitter-api-v2");
const db = require("../../database/db.js");

const getUserTimeLineById = async (twitter_id, access_token) => {
    try {
        const appOnlyClient = new TwitterApi(access_token);
        const {
            _realData: { data },
        } = await appOnlyClient.v2.userTimeline(twitter_id, {
            exclude: "replies",
            "tweet.fields": [
                "created_at",
                "public_metrics",
                "non_public_metrics",
            ],
        });
        if (!data) {
            const seven_day_stats = {
                seven_day_likes: 0,
                seven_day_retweets: 0,
                seven_day_replies: 0,
                seven_day_profile_clicks: 0,
                seven_day_impressions: 0,
                seven_day_engagement: "N/A",
            };
            return seven_day_stats;
        }
        //calculate 7 -day stats from the tweet data
        const seven_day_tweets =
            data.filter(
                (tweet) =>
                    new Date(tweet.created_at) >
                    Date.now() - 7 * 24 * 60 * 60 * 1000
            ) || 0;
        const seven_day_likes = extractLikes(seven_day_tweets);
        const seven_day_retweets = extractRetweets(seven_day_tweets);
        const seven_day_replies = extractReplies(seven_day_tweets);
        const seven_day_profile_clicks =
            extractProfileClicks(seven_day_tweets) || 0;
        const seven_day_impressions = extractImpressions(seven_day_tweets);
        const seven_day_engagement =
            (
                (seven_day_likes +
                    seven_day_retweets +
                    seven_day_replies +
                    seven_day_profile_clicks) /
                seven_day_impressions
            ).toFixed(2) *
                100 +
            "%";

        const seven_day_stats = {
            seven_day_likes,
            seven_day_retweets,
            seven_day_replies,
            seven_day_profile_clicks,
            seven_day_impressions,
            seven_day_engagement,
        };

        console.table(seven_day_stats);

        return seven_day_stats;
    } catch (error) {
        console.log(error);
    }
};

const updateFollowers = async (twitterclients) => {
    twitterclients.forEach(async (client) => {
        //TODO: throttle for each client with setTimeout...
        const appOnlyClient = new TwitterApi(client.access_token);
        const { data } = await appOnlyClient.v2.user(client.twitter_id, {
            "user.fields": ["public_metrics"],
        });
        const new_followers = data.public_metrics.followers_count;
        // shift historic follower data colums by one day (while adding the new data as the current)
        const updatedData = await db.updateFollowerData(client, new_followers);
        return updatedData;
    });
    return twitterclients;
};

const getLatestFollowers = async (client) => {
    const appOnlyClient = new TwitterApi(client.access_token);
    const { data } = await appOnlyClient.v2.user(client.twitter_id, {
        "user.fields": ["public_metrics"],
    });
    return data.public_metrics.followers_count;
};

module.exports = { getUserTimeLineById, updateFollowers, getLatestFollowers };

////////////////////////////////////////////////////////////////////////////////////////////////
const extractLikes = (seven_day_tweets) => {
    let like_count = 0;
    seven_day_tweets.forEach((tweet) => {
        return (like_count = like_count + tweet.public_metrics.like_count);
    });
    return like_count;
};

const extractRetweets = (seven_day_tweets) => {
    let retweet_count = 0;
    seven_day_tweets.forEach((tweet) => {
        return (retweet_count =
            retweet_count + tweet.public_metrics.retweet_count);
    });
    return retweet_count;
};

const extractReplies = (seven_day_tweets) => {
    let reply_count = 0;
    seven_day_tweets.forEach((tweet) => {
        return (reply_count = reply_count + tweet.public_metrics.reply_count);
    });
    return reply_count;
};

const extractProfileClicks = (seven_day_tweets) => {
    let user_profile_clicks = 0;
    seven_day_tweets.forEach((tweet) => {
        return (user_profile_clicks =
            user_profile_clicks + tweet.non_public_metrics.user_profile_clicks);
    });
    return user_profile_clicks;
};

const extractImpressions = (seven_day_tweets) => {
    let impression_count = 0;
    seven_day_tweets.forEach((tweet) => {
        return (impression_count =
            impression_count + tweet.non_public_metrics.impression_count);
    });
    return impression_count;
};
