import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./nav-bar.css";

function NavBar({ user, twitterClient, demo }) {
    //STATE
    //let [username, setEmail] = useState("");
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {}, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS

    ///////////////////////////////////////////////////
    return (
        <div className="component-nav-bar">
            <div className="nav-bar-container">
                <img src="/logo1.webp" id="logo" alt="logo" />

                <div className="nav-bar-tabs">
                    <div className="tab">
                        <Link to="/">HOME</Link>
                    </div>
                    <div className="tab">
                        <Link to="/ai-writer">AI WRITER</Link>
                    </div>
                    <div className="tab">
                        <Link to="/automation">AUTOMATION</Link>
                    </div>
                </div>
                <div className="user-controls">
                    <h4>{user.username}</h4>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
