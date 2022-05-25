import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Welcome from "./pages/welcome/welcome";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <Welcome />
    </React.StrictMode>
);

// const requireLogin = async () => {
//     const cookieSession = await fetch("/api/user/me");
//     const { isLoggedIn, user } = await cookieSession.json();

//     if (!isLoggedIn) {
//         return root.render(
//             <React.StrictMode>
//                 <Welcome />
//             </React.StrictMode>
//         );
//     }

//     root.render(
//         <React.StrictMode>
//             <App user={user} />
//         </React.StrictMode>
//     );
// };
// requireLogin();
