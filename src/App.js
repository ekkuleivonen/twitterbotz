import "./App.css";

//PAGES
import Home from "./pages/home/home.js";
import Tweets from "./pages/tweets/tweets.js";
import Analytics from "./pages/analytics/analytics.js";
////////////////////////////////////////////////////////////////

//COMPONENTS
import NavBar from "./components/nav-bar/nav-bar.js";
import Oauth from "./components/oauth/oauth.js";
////////////////////////////////////////////////////////////////

//HOOKS
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
////////////////////////////////////////////////////////////////

//FUNCTIONS
import { getDemoData, getRealData } from "./client-functions/api.js";
////////////////////////////////////////////////////////////////

function App({ user }) {
    //STATE
    ///////////////////////////////////////////////////
    let [demo, setDemo] = useState(true);
    let [showOauth, setOauth] = useState(false);
    let [twitterClient, setTwitterClient] = useState(null);
    const [twitterData, setTwitterData] = useState(null);
    ///////////////////////////////////////////////////

    //USE EFFECT
    ///////////////////////////////////////////////////
    useEffect(() => {
        async function getData() {
            const res1 = await fetch("api/twitter-client");
            const foundTwitterClient = await res1.json();
            if (foundTwitterClient.error === "NO CLIENT") {
                setDemo(true);
                const { data } = await getDemoData();
                setTwitterData(data);
                return setOauth(true);
            }
            if (foundTwitterClient.error === "CLIENT EXPIRED") {
                const { data } = await getDemoData();
                setTwitterData(data);
                return setOauth(true);
            }
            if (foundTwitterClient.success) {
                setDemo(false);
                const { data } = await getDemoData();
                setTwitterData(data);
                //REPLACE ABOVE
                //TODO: setTwitterData(getRealData());
                // const res2 = await fetch("api/real-twitter-data");
                // const foundStats = await res2.json();
                // console.log(foundStats);
                const realData = await getRealData();
                setTwitterData(realData);
                console.log(realData);
                setTwitterClient(foundTwitterClient.client);
            }
        }
        getData();
    }, [user]);
    ///////////////////////////////////////////////////

    //FUNCTIONS
    ///////////////////////////////////////////////////

    ///////////////////////////////////////////////////
    return (
        <div className="App">
            <BrowserRouter>
                <>
                    {user && (
                        <NavBar
                            user={user}
                            twitterClient={twitterClient}
                            demo={demo}
                            setOauth={setOauth}
                        />
                    )}
                    <Routes>
                        {
                            <Route
                                exact
                                path="/"
                                element={
                                    twitterData && (
                                        <Home
                                            user={user}
                                            twitterClient={twitterClient}
                                            demo={demo}
                                            setOauth={setOauth}
                                            twitterData={twitterData}
                                        />
                                    )
                                }
                            ></Route>
                        }
                        <Route
                            exact
                            path="/analytics"
                            element={
                                <Analytics
                                    user={user}
                                    twitterClient={twitterClient}
                                    demo={demo}
                                    setOauth={setOauth}
                                />
                            }
                        ></Route>
                        <Route
                            exact
                            path="/tweets"
                            element={
                                <Tweets
                                    user={user}
                                    twitterClient={twitterClient}
                                    demo={demo}
                                    setOauth={setOauth}
                                />
                            }
                        ></Route>
                    </Routes>
                    {showOauth && <Oauth setOauth={setOauth} />}
                </>
            </BrowserRouter>
        </div>
    );
}

export default App;
