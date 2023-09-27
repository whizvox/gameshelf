const mongoose = require("mongoose");
const config = require("./config");

function connectToDatabase() {
    return mongoose.connect(config.db.url);
}

module.exports = {
    connectToDatabase
}