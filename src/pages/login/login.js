import "./login.css";

//HOOKS
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
///////////////////////////////////////////////////////

//FUNCTIONS
import { isValidEmail } from "../../client-functions/regex.js";
import { loginUser } from "../../client-functions/api.js";
///////////////////////////////////////////////////////////

function Login() {
    //STATE
    const [loginInput, setLoginInput] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState({
        email: false,
        password: false,
    });
    ///////////////////////////////////////////////////

    //USE EFFECT
    useEffect(() => {
        console.log("Login component mounted");
    }, []);
    ///////////////////////////////////////////////////

    //FUNCTIONS
    const handleUserInput = (e) => {
        setLoginInput({
            ...loginInput,
            [e.target.name]: e.target.value,
        });
        setError({ ...error, email: false, password: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        //empty fields are shown as errors in UI
        for (const input in loginInput) {
            if (loginInput[input] === "") setError((error[input] = true));
        }
        //invalid email is shown as error in UI
        if (!isValidEmail(loginInput.email))
            setError({ ...error, email: true });
        //no errors are allowed when submitting
        Object.values(error).forEach((err) => {
            if (err) return console.log("INPUT ERRORS: ", error);
        });
        //server logs user in if valid credentials
        const response = await loginUser(loginInput);
        if (response.error)
            return setError({ ...error, email: true, password: true });

        if (response.success) return window.location.replace("/");
    };
    ///////////////////////////////////////////////////

    return (
        <div className="component-login">
            <h1>Login</h1>
            <form className="login-form">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleUserInput}
                    className={`text-input-field ${error.email ? "error" : ""}`}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleUserInput}
                    className={`text-input-field ${
                        error.password ? "error" : ""
                    }`}
                />
                <button onClick={handleSubmit}>Log in</button>
            </form>
            <p>
                No account yet? <Link to="/">Register</Link>
            </p>
        </div>
    );
}

export default Login;
