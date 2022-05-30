-- USERS
--/////////////////////////////////////////////////////////////////////
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(255) NOT NULL CHECK (username != ''),
     email VARCHAR(255) NOT NULL UNIQUE CHECK  (email!= ''),
     password_hash TEXT NOT NULL CHECK (password_hash!=''),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, email, password_hash) VALUES ('admin1', 'admin1@example.com', 'xxx');
INSERT INTO users (username, email, password_hash) VALUES ('admin2', 'admin2@example.com', 'xxx');
INSERT INTO users (username, email, password_hash) VALUES ('admin3', 'admin3@example.com', 'xxx');
--/////////////////////////////////////////////////////////////////////

--SESSIONS
--/////////////////////////////////////////////////////////////////////
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
     id SERIAL PRIMARY KEY,
     code_verifier TEXT NOT NULL CHECK (code_verifier != ''),
     session_state TEXT NOT NULL CHECK (session_state != ''),
     user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
);
--/////////////////////////////////////////////////////////////////////

--TOKENS
--/////////////////////////////////////////////////////////////////////
DROP TABLE IF EXISTS twitter_clients;
CREATE TABLE twitter_clients (
     id SERIAL PRIMARY KEY,
     twitter_username TEXT,
     twitter_id BIGINT NOT NULL UNIQUE CHECK (twitter_id > 0),
     access_token TEXT NOT NULL CHECK (access_token != ''),
     refresh_token TEXT NOT NULL CHECK (refresh_token != ''),
     expires_in INTEGER NOT NULL CHECK (expires_in > 0),
     user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
);
--/////////////////////////////////////////////////////////////////////

--TWITTER-STATS
--/////////////////////////////////////////////////////////////////////
DROP TABLE IF EXISTS twitter_data;
CREATE TABLE twitter_data (
     id SERIAL PRIMARY KEY,
     followers_d7 INTEGER DEFAULT 0,
     followers_d6 INTEGER DEFAULT 0,
     followers_d5 INTEGER DEFAULT 0,
     followers_d4 INTEGER DEFAULT 0,
     followers_d3 INTEGER DEFAULT 0,
     followers_d2 INTEGER DEFAULT 0,
     followers_d1 INTEGER DEFAULT 0,
     seven_day_retweets INTEGER NOT NULL DEFAULT 0,
     seven_day_likes INTEGER NOT NULL DEFAULT 0,
     seven_day_engagement TEXT NOT NULL DEFAULT 0,
     user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO twitter_data (followers_d7, followers_d6, followers_d5, followers_d4, followers_d3, followers_d2, followers_d1, seven_day_retweets, seven_day_likes, seven_day_engagement, user_id) VALUES (405, 407, 411, 412, 409, 415, 419, 4, 24, 0.123, 1);
INSERT INTO twitter_data (followers_d7, followers_d6, followers_d5, followers_d4, followers_d3, followers_d2, followers_d1, seven_day_retweets, seven_day_likes, seven_day_engagement, user_id) VALUES (3002, 3020, 3021, 3035, 3045, 3038, 3059, 22, 122, 0.082, 2);
INSERT INTO twitter_data (followers_d7, followers_d6, followers_d5, followers_d4, followers_d3, followers_d2, followers_d1, seven_day_retweets, seven_day_likes, seven_day_engagement, user_id) VALUES (15209, 15250, 15288, 15290, 15240, 15303, 15320, 122, 4125, 0.075, 3);
--/////////////////////////////////////////////////////////////////////

--SCHEDULED TWEETS
--/////////////////////////////////////////////////////////////////////
DROP TABLE IF EXISTS scheduled_tweets;
CREATE TABLE scheduled_tweets (
     id SERIAL PRIMARY KEY,
     payload TEXT,
     user_id INTEGER NOT NULL REFERENCES users (id),
     expires_at TIMESTAMP DEFAULT NOW()
);
--/////////////////////////////////////////////////////////////////////