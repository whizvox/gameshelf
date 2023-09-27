const mongoose = require("mongoose");
const { ID_SCHEMA } = require("../lib/id");

/*
An INTERIM USER is an entity representing an end user's request to create a new
account with this service, but doesn't yet have their email address confirmed.
An end user must specify an email address and password upon account
registration.

If the end user verifies their email, all other interim users with the same
email are deleted. This is assuming all other users that attempted to register
with the conflicting email do not actually have access to it.

Once the email is verified, the end user is prompted with a form to choose a
username. Only when the username is actually picked is the email "verified",
and the user account is actually created.
*/

const interimUserSchema = new mongoose.Schema({
    _id: ID_SCHEMA,
    email: {
        type: String,
        required: true,
        maxLength: 255
    },
    authToken: {
        type: String,
        required: true,
        minLength: 60,
        maxLength: 60
    },
    expiresAt: {
        type: Date,
        required: true,
        // 1 day
        default: () => new Date(new Date().getTime() + 86400000)
    }
});

const InterimUser = mongoose.model("InterimUser", interimUserSchema);

module.exports = InterimUser;