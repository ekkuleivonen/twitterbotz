const registerUser = async (registerInput) => {
    try {
        const response_raw = await fetch("/api/register", {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerInput),
            method: "POST",
        });
        const response = await response_raw.json();
        return response;
    } catch (error) {
        console.log(error);
    }
};

const loginUser = async (loginInput) => {
    try {
        const response_raw = await fetch("/api/login", {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginInput),
            method: "POST",
        });
        const response = await response_raw.json();
        return response;
    } catch (error) {
        console.log(error);
    }
};

const getDemoData = async () => {
    const response = await fetch("/api/demo-twitter-data");
    const demoData = await response.json();
    return demoData;
};

const getRealData = async () => {
    const response = await fetch("/api/real-twitter-data");
    const realData = await response.json();
    return realData;
};

const tweetNow = async (tweetBody) => {
    const response = await fetch("/api/tweet-now", {
        method: "POST",
        body: JSON.stringify({ tweetBody: tweetBody }),
        headers: { "Content-Type": "application/json" },
    });
    const uploadedTweet = await response.json();
    return uploadedTweet;
};

const tweetLater = async (tweetBody, tweetDate, tweetTime) => {
    const response = await fetch("/api/tweet-later", {
        method: "POST",
        body: JSON.stringify({
            tweetBody: tweetBody,
            tweetDate: tweetDate,
            tweetTime: tweetTime,
        }),
        headers: { "Content-Type": "application/json" },
    });
    const storedTweet = await response.json();
    return storedTweet;
};

export {
    registerUser,
    loginUser,
    getDemoData,
    getRealData,
    tweetNow,
    tweetLater,
};

//     const rawServerResponse = await fetch("/register", {
//         headers: { "Content-type": "application/json" },
//         body: JSON.stringify(userInput),
//         method: "POST",
//     }).catch((error) => {
//         console.log(error);
//     });
//     const serverResponse = await rawServerResponse.json();

//     console.log(serverResponse);

//     //if server responds with err 23505 --> user exists already
//     if (serverResponse.err === "23505") {
//         console.log("user already exists");
//         return setEmailError((emailError = true));
//     }
//     //if serverresponds with user_id --> success
//     if (serverResponse.user_id) {
//         console.log("success");
//         return window.location.reload(false);
//     }
