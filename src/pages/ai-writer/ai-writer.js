import React, { useEffect, useState } from "react";
import "./ai-writer.css";
import Typed from "react-typed";

function AiWriter({ setOauth, demo }) {
    //STATE
    let [aiGeneration, setAiGeneration] = useState(null);
    let [aiResponse, setAiResponse] = useState("");
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("AI-WRITER component mounted");
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS

    const handleAiWriter = async (e) => {
        e.preventDefault();
        setAiResponse("");
        const resp = await fetch("/api/ai-writer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ aiGeneration }),
        });
        const response = await resp.json();
        setAiResponse(response.data);
    };

    ///////////////////////////////////////////////////

    return (
        <div className="component-ai-writer">
            <h1>AI-WRITER</h1>
            <div className="two-column-grid">
                <form className="left-cell" onSubmit={handleAiWriter}>
                    <h2>Give instructions for the AI</h2>
                    <input
                        type="text"
                        name="prompt"
                        placeholder="Write an inspiring tweet about innovation"
                        onChange={(e) => setAiGeneration(e.target.value)}
                    />
                    <button type="submit">GENERATE TWEET</button>
                </form>
                <form className="right-cell">
                    {aiResponse && (
                        <Typed
                            strings={[aiResponse]}
                            typeSpeed={40}
                            reset={true}
                        >
                            <textarea id="tweet-area" />
                        </Typed>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AiWriter;
