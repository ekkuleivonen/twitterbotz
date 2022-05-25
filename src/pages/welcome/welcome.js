import "./welcome.css";

//COMPONENTS
import Login from "../login/login";
////////////////////////////////////////////////////////////

//HOOKS
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
///////////////////////////////////////////////////////////

//FUNCTIONS
import { isValidEmail } from "../../client-functions/regex.js";
import { registerUser } from "../../client-functions/api.js";
///////////////////////////////////////////////////////////

function Welcome() {
    //STATE
    const [registerInput, setRegisterInput] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
    });
    const [error, setError] = useState({
        username: false,
        email: false,
        password: false,
    });
    let [login, setLogin] = useState(false);
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("register component mounted");
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS
    const handleUserInput = (e) => {
        setRegisterInput({
            ...registerInput,
            [e.target.name]: e.target.value,
        });
        setError({ ...error, [e.target.name]: false });
        if (e.target.name.includes("password"))
            setError({ ...error, password: false });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        //empty fields are shown as errors in UI
        for (const input in registerInput) {
            if (registerInput[input] === "") setError((error[input] = true));
            if (
                registerInput.password1 === "" ||
                registerInput.password2 === ""
            )
                setError((error.password = true));
        }
        //invalid email is shown as error in UI
        if (!isValidEmail(registerInput.email))
            setError({ ...error, email: true });
        //inconsistent passwords is shown as errors in UI
        if (registerInput.password1 !== registerInput.password2) {
            return setError({ ...error, password: true });
        }
        //no errors are allowed when submitting
        Object.values(error).forEach((err) => {
            if (err) return console.log("INPUT ERRORS: ", error);
        });
        //server registers a new user if it doesn't already exist
        const response = await registerUser(registerInput);
        if (response.error === "23505") {
            console.log("EMAIL ALREADY EXISTS");
            return setError({ ...error, email: true });
        }
        if (response.success) return window.location.replace("/");
    };
    ///////////////////////////////////////////////////
    //if user clicks login return login, else return register
    if (login) return <Login />;
    return (
        <BrowserRouter>
            <>
                <Routes>
                    <Route exact path="/login" element={<Login />}></Route>
                </Routes>
                <div className="Register">
                    <div className="register-grid">
                        <h1>
                            Create an account and start automating your twitter
                            growth today
                        </h1>
                        <p className="welcome-text">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                        </p>
                        <form className="register-form" onSubmit={handleSubmit}>
                            <h2>Register</h2>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                onChange={handleUserInput}
                                className={`text-input-field ${
                                    error.username ? "error" : ""
                                }`}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleUserInput}
                                className={`text-input-field ${
                                    error.email ? "error" : ""
                                }`}
                            />
                            <input
                                type="password"
                                name="password1"
                                placeholder="Password"
                                onChange={handleUserInput}
                                className={`text-input-field ${
                                    error.password ? "error" : ""
                                }`}
                            />
                            <input
                                type="password"
                                name="password2"
                                placeholder="Password"
                                onChange={handleUserInput}
                                className={`text-input-field ${
                                    error.password ? "error" : ""
                                }`}
                            />
                            <button type="submit">Register</button>
                            <p>
                                Already a member?{" "}
                                <Link to="/login">Log in</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </>
        </BrowserRouter>
    );
}

export default Welcome;
