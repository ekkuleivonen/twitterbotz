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

module.exports.getHistoricDates = (nrOfDays) => {
    const dayHistory = historicDates(nrOfDays);
    return cutDateNames(dayHistory);
};
