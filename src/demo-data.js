const historicDates = (days) => {
    const delay = 864e5;
    const dateArray = [];
    for (let y = 0; y < days; y++) {
        const yesterday_raw = new Date(Date.now() - 1 * delay * [y]);
        dateArray.unshift(yesterday_raw.toGMTString());
    }
    return dateArray;
};

const cutDateNames = (historicDates) => {
    const cutDates = [];
    for (let y = 0; y < historicDates.length; y++) {
        const fragments = historicDates[y].split(",");
        cutDates.push(fragments[0]);
    }
    return cutDates;
};

// var input = 'john smith~123 Street~Apt 4~New York~NY~12345';

// var fields = input.split('~');

// var name = fields[0];
// var street = fields[1];

const historicFollowers = (days) => {
    const followersArray = [];
    let outcome = Math.floor(Math.random() * (4 - 1) + 1);
    //Small account
    if (outcome === 1) {
        for (let i = 0; i < days; i++) {
            let followCount = Math.floor(Math.random() * (300 - 200) + 200);
            followersArray.push(followCount + 5);
        }
        return followersArray;
    }
    //Medium account
    if (outcome === 2) {
        for (let i = 0; i < days; i++) {
            let followCount = Math.floor(Math.random() * (5000 - 4500) + 4500);
            followersArray.push(followCount + 25);
        }

        return followersArray;
    }
    //Large account
    if (outcome === 3) {
        for (let i = 0; i < days; i++) {
            let followCount = Math.floor(
                Math.random() * (15000 - 12000) + 12000
            );
            followersArray.push(followCount + 50);
        }
        return followersArray;
    }
};

const SEVEN_DAY_FOLLOWERS = {
    dates: cutDateNames(historicDates(7)),
    followers: historicFollowers(7),
};
export { SEVEN_DAY_FOLLOWERS };
