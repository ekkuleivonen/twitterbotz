const postgres = require("postgres");
let sql;

if (process.env.NODE_ENV === "production") {
    console.log("DB_URL", process.env.DATABASE_URL);
    sql = postgres(process.env.DATABASE_URL + "?sslmode=require");
} else {
    const {
        DATABASE_USERNAME,
        DATABASE_PASSWORD,
        DATABASE_NAME,
    } = require("../secrets.json");
    sql = postgres(
        `postgres://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:${5432}/${DATABASE_NAME}`
    );
}

//USER
const {
    hashPassword,
    passwordMatch,
} = require("../server-modules/credentials");

const createUser = async (userInput) => {
    try {
        const { username, email, password1 } = userInput;
        const password_hash = await hashPassword(password1);
        const newUser = await sql`
    INSERT INTO users
    (username, email, password_hash)
    VALUES (${username}, ${email}, ${password_hash}) RETURNING *`;
        return newUser;
    } catch (error) {
        console.log(error);
    }
};

const loginUser = async (loginInput) => {
    const { email, password } = loginInput;
    try {
        const foundUser = await sql`
        SELECT *
        FROM users
        WHERE email= ${email}`;
        if (foundUser.length < 1) {
            return null;
        }
        const foundPassword_hash = foundUser[0].password_hash;
        const match = await passwordMatch(password, foundPassword_hash);
        return match ? foundUser : null;
    } catch (err) {
        console.log(err);
    }
};

const getUserById = async (user_id) => {
    try {
        const foundUser = await sql`
        SELECT *
        FROM users
        WHERE id= ${user_id}`;
        return foundUser[0];
    } catch (err) {
        console.log(err);
    }
};
//**************************************************************************

//TWITTER STATS
const { getHistoricDates } = require("../server-modules/dates.js");
const getTwitterStatsById = async (user_id) => {
    try {
        const twitterStats = await sql`
        SELECT *
        FROM twitter_data
        WHERE user_id= ${user_id}`;
        const {
            followers_d7,
            followers_d6,
            followers_d5,
            followers_d4,
            followers_d3,
            followers_d2,
            followers_d1,
            seven_day_retweets,
            seven_day_likes,
            seven_day_engagement,
        } = twitterStats[0];

        const seven_day_followers = [
            followers_d7,
            followers_d6,
            followers_d5,
            followers_d4,
            followers_d3,
            followers_d2,
            followers_d1,
        ];

        const dates = getHistoricDates(7);

        const twitterData = {
            dates,
            seven_day_followers,
            seven_day_retweets,
            seven_day_likes,
            seven_day_engagement,
        };
        return twitterData;
    } catch (err) {
        console.log(err);
    }
};
//**************************************************************************

//updateUser(userInput)
//deleteUser(user_id)
//**************************************************************************

//USER_DETAILS
//**************************************************************************
//updateUserDetails(userInput)
//**************************************************************************

//BOT_PREFERENCES
//**************************************************************************

//**************************************************************************

//SESSIONS
//**************************************************************************
const readSession = async (state) => {
    try {
        const sessionData = await sql`
        SELECT * FROM sessions
        WHERE session_state= ${state}`;
        return sessionData[0];
    } catch (err) {
        console.log(err);
        return err;
    }
};
const writeSession = async (state, codeVerifier, user_id) => {
    try {
        const writtenSession = await sql`
    INSERT INTO sessions
    (code_verifier, session_state, user_id)
    VALUES (${codeVerifier}, ${state}, ${user_id})
    ON CONFLICT (user_id)
    DO UPDATE SET (code_verifier, session_state, updated_at)
    = (excluded.code_verifier, excluded.session_state, excluded.updated_at)
    RETURNING *`;
        return writtenSession;
    } catch (err) {
        console.log(err);
    }
};
//**************************************************************************

//TOKENS
//**************************************************************************
const storeTwitterClient = async (loggedClient, user_id) => {
    try {
        const {
            twitter_username,
            twitter_id,
            access_token,
            refresh_token,
            expires_in,
        } = loggedClient;
        const storedClient = await sql`
            INSERT INTO twitter_clients
            (twitter_username, twitter_id, access_token, refresh_token, expires_in, user_id)
            VALUES (${twitter_username},${twitter_id}, ${access_token}, ${refresh_token}, ${expires_in}, ${user_id})
            ON CONFLICT (user_id)
            DO UPDATE SET (twitter_username, access_token, refresh_token, expires_in, updated_at)
            = (excluded.twitter_username, excluded.access_token, excluded.refresh_token, excluded.expires_in, excluded.updated_at)
            RETURNING *`;
        if (storedClient.lenght < 1) return null;
        return storedClient[0];
    } catch (error) {
        console.log(error);
    }
};
const checkClientExpiry = async (interval, user_id) => {
    const expiredClient = await sql`SELECT * FROM twitter_clients
    WHERE (user_id =${user_id} AND
    updated_at < ${Date.now() - interval})`;
    if (expiredClient.length < 1) return false;
    if (expiredClient[0]) return true;
    return false;
};
const getExpiringClients = async (interval) => {
    //TODO: add 1h threshold for finding expiring clients...
    try {
        const expiringClients = await sql`SELECT * FROM twitter_clients`;
        return expiringClients;
    } catch (error) {
        console.log(error);
    }
};
const updateClient = async (user_id, access_token, refresh_token) => {
    try {
        await sql`UPDATE twitter_clients SET
        access_token = ${access_token},
        refresh_token = ${refresh_token}
        WHERE user_id = ${user_id}`;
    } catch (error) {
        console.log(error);
    }
};
const getTwitterClientByUserId = async (user_id) => {
    try {
        const twitterClient = await sql`
        SELECT * FROM twitter_clients WHERE user_id=${user_id}`;
        if (twitterClient.length < 1) return null;
        return twitterClient[0];
    } catch (err) {
        console.error(err);
    }
};
const getAllTwitterClients = async () => {
    const twitterClients =
        await sql`SELECT * FROM twitter_clients WHERE NOT user_id=1 OR user_id=1 OR user_id=3`;
    return twitterClients;
};
//**************************************************************************

//TWITTER ACTIONS
const createTwitterDataRow = async (user_id) => {
    try {
        await sql`INSERT INTO twitter_data
        (followers_d7, followers_d6, followers_d5, followers_d4, followers_d3, followers_d2, followers_d1,
        seven_day_retweets, seven_day_likes, seven_day_engagement, user_id)
        VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ${user_id})`;
        return "success";
    } catch (error) {
        return "error";
    }
};
const updateFollowerData = async (client, new_followers) => {
    // shift historic follower data colums by one day (while adding the new data as the current)
    const result =
        await sql`SELECT * FROM twitter_data WHERE user_id = ${client.user_id}`;
    const {
        followers_d6,
        followers_d5,
        followers_d4,
        followers_d3,
        followers_d2,
        followers_d1,
    } = result[0];
    const new_data = await sql`UPDATE twitter_data SET
    followers_d7 = ${followers_d6},
    followers_d6 = ${followers_d5},
    followers_d5 = ${followers_d4},
    followers_d4 = ${followers_d3},
    followers_d3 = ${followers_d2},
    followers_d2 = ${followers_d1},
    followers_d1 = ${new_followers} RETURNING *`;
    return new_data;
};
const findExpiredTweets = async () => {
    try {
        const expiredTweets =
            await sql`SELECT payload, access_token, scheduled_tweets.id AS id
                                FROM  scheduled_tweets
                                JOIN twitter_clients
                                ON scheduled_tweets.user_id = twitter_clients.user_id
                                WHERE  expires_at < NOW()`;
        return expiredTweets;
    } catch (error) {
        console.log(error);
    }
};
const removeOldTweet = async (id) => {
    const removedTweet =
        await sql`DELETE FROM scheduled_tweets WHERE id = ${id} RETURNING *`;
    return removedTweet;
};
const scheduleTweet = async (user_id, tweetBody, tweetDate) => {
    const scheduledTweet = await sql`INSERT INTO scheduled_tweets
                                    (user_id, payload, expires_at)
                                    VALUES (${user_id},
                                    ${tweetBody},
                                    ${tweetDate})
                                    RETURNING *`;
    return scheduledTweet;
};
//**************************************************************************
module.exports = {
    createUser,
    loginUser,
    getUserById,
    getTwitterClientByUserId,
    writeSession,
    readSession,
    storeTwitterClient,
    checkClientExpiry,
    getTwitterStatsById,
    getExpiringClients,
    updateClient,
    getAllTwitterClients,
    updateFollowerData,
    createTwitterDataRow,
    scheduleTweet,
    findExpiredTweets,
    removeOldTweet,
};
