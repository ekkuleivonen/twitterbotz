import "./oauth.css";

export default function Oauth({ setOauth }) {
    //FUNCTIONS
    const handleOauth = async (e) => {
        e.preventDefault();
        window.location.replace("http://localhost:3001/auth/twitter");
    };

    const handleSkip = (e) => {
        setOauth(false);
    };
    ///////////////////////////////////////////////////

    return (
        <div className="Oauth">
            <div className="modal">
                <h1>
                    Connect to twitter to enable analytics, scheduled tweets,
                    and more...
                </h1>
                <h4 onClick={handleOauth}>Connect</h4>
                <p href="/" onClick={handleSkip}>
                    Continue in demo mode
                </p>
            </div>
        </div>
    );
}
