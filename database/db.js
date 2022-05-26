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
            seven_day_mentions,
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
            seven_day_mentions,
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
//initiateClient(accessToken, user_id)
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
    console.log(expiredClient);
    if (expiredClient[0]) return true;
    return false;
};
//updateClients()
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
};
