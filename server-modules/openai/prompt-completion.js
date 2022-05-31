const { Configuration, OpenAIApi } = require("openai");
const db = require("../../database/db.js");
let configuration;

if (process.env.NODE_ENV === "production") {
    configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
} else {
    configuration = new Configuration({
        apiKey: require("../../secrets.json").OPENAI_API_KEY,
    });
}

const openai = new OpenAIApi(configuration);

const promptTemplates = [
    "Write an inspiring tweet for my <kw1>.",
    "Generate a text that argues for the benefits of <kw1> within the context of work life.",
    "Generate a text that engages positively with the <kw1> community.",
    "Generate a text that connects innovation to <kw1>.",
    "Write a short text about work-life balance within the context of <kw1>.",
    "Explain the main difficulties with <kw1> and relate with the pain points.",
    "Inspire my <kw1> on my twitter account.",
];

module.exports.autoTweet = async (user_input) => {
    const response = await openai.createCompletion("text-davinci-002", {
        prompt: user_input,
        temperature: 0.75,
        max_tokens: 64,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    console.log("OPEN AI response: ", response.data);
    return response.data.choices[0].text;
};
