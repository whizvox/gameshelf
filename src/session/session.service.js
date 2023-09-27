const bcrypt = require("bcrypt");

const { badRequest } = require("../lib/response");
const Session = require("./session.model");
const userService = require("../user/user.service");

function findByKey(key) {
    return Session.findById(key);
}

function createFromUser(user, expiresAt) {
    return Session.create({ user: user._id, role: user.role, expiresAt });
}

function createFromCredentials(email, password, expiresAt) {
    return userService.findByEmail(email)
        .then(user => {
            if (!user) {
                throw badRequest("Unknown email", { email });
            }
            return bcrypt.compare(password, user.authToken)
                .then(matches => {
                    if (!matches) {
                        throw badRequest("Incorrect password");
                    }
                    return createFromUser(user, expiresAt);
                });
        });
}

function deleteByKey(key) {
    return Session.deleteOne({ _id: key });
}

function deleteByUser(user) {
    if (typeof(user) === "object") {
        user = user._id;
    } else if (typeof(user) !== "string") {
        return Promise.reject(badRequest(`Unknown type for user. Expected \`string\` or \`object\`, got ${typeof(user)} instead`));
    }
    return Session.deleteMany({ user });
}

function deleteAllExpired() {
    return Session.deleteMany({ expiresAt: { $lte: new Date() } });
}

module.exports = {
    findByKey,
    createFromUser,
    createFromCredentials,
    deleteByKey,
    deleteByUser,
    deleteAllExpired
};