function addHours(date, hours) {
    return new Date(date.getTime() + 3600000 * hours);
}

function addDays(date, days) {
    return new Date(date.getTime() + 86400000 * days);
}

module.exports = {
    addHours,
    addDays
};