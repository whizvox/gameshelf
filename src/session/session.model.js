const mongoose = require("mongoose");
const { ID_SCHEMA } = require("../lib/id");
const { roleNames } = require("../user/role");
const { addDays } = require("../lib/date.util");

const sessionSchema = mongoose.Schema({
    _id: ID_SCHEMA,
    user: {
        type: String,
        required: true,
        ref: "User"
    },
    // denormalized from user. document should be deleted if role changes
    role: {
        type: String,
        required: true,
        enum: roleNames
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => addDays(new Date(), 1)
    }
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;