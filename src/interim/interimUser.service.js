const bcrypt = require("bcrypt");
const InterimUser = require("./interimUser.model");
const config = require("../lib/config");

function find(token) {
    return InterimUser.findById(token);
}

function create(email, password) {
    return bcrypt.hash(password, config.security.saltRounds)
        .then(hashedPassword => {
            return InterimUser.create({ email, authToken: hashedPassword });
        });
}

function deleteById(token) {
    return InterimUser.deleteOne({ _id: token });
}

function deleteByEmail(email) {
    return InterimUser.deleteMany({ email: email.toLowerCase() });
}

function deleteExpired() {
    return InterimUser.deleteMany({ expiresAt: { $lte: new Date() } });
}

module.exports = {
    find,
    create,
    deleteById,
    deleteByEmail,
    deleteExpired
};