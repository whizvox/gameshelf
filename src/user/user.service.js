const bcrypt = require("bcrypt");
const User = require("./user.model");
const { roleToString, roles } = require("./role");
const config = require("../lib/config");
const interimUserService = require("../interim/interimUser.service");
const { badRequest, conflict } = require("../lib/response");

function findById(id) {
    return User.findById(id);
}

function findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
}

function findByUsername(username) {
    return User.findOne({ usernameLower: username.toLowerCase() });
}

function findAll(options) {
    return User.paginate({}, options);
}

function exists(filter) {
    return User.exists(filter);
}

function create(email, username, password, role) {
    if (role) {
        role = roleToString(role) ?? undefined;
    }
    return Promise.all([ findByEmail(email), findByUsername(username) ])
        .then(users => {
            const matchingEmail = users[0];
            const matchingUsername = users[1];
            if (!matchingEmail && !matchingUsername) {
                return bcrypt.hash(password, config.security.saltRounds);
            } else {
                let problems = [];
                if (matchingEmail) {
                    problems.push("Email is not unique");
                }
                if (matchingUsername) {
                    problems.push("Username is not unique");
                }
                throw conflict("Email and/or username is not unique", problems);
            }
        })
        .then(hashedPassword => {
            return User.create({
                email: email.toLowerCase(),
                username,
                usernameLower: username.toLowerCase(),
                authToken: hashedPassword,
                role
            });
        });
}

function createFromInterim(interimToken, username) {
    return interimUserService.find(interimToken)
        .then(iuser => {
            if (iuser) {
                return Promise.all([
                    User.exists({ email: iuser.email.toLowerCase() }),
                    User.exists({ usernameLower: username.toLowerCase() })
                ])
                .then(results => {
                    if (results[0] || results[1]) {
                        let problems = "";
                        if (results[0]) {
                            problems += "email is already taken";
                        }
                        if (results[1]) {
                            if (problems.length > 0) {
                                problems += ", ";
                            }
                            problems += "username is already taken"
                        }
                        return Promise.reject(badRequest(problems));
                    } else {
                        return interimUserService.deleteByEmail(iuser.email);
                    }
                })
                .then(() => {
                    return User.create({
                        email: iuser.email,
                        username,
                        authToken: iuser.authToken,
                        role: roles.MEMBER.name
                    });
                });
            } else {
                return Promise.reject(
                    badRequest("Unknown token", { token: interimToken })
                );
            }
        });
}

function update(id, query) {
    delete query.authToken;
    delete query.id;
    return User.findOneAndUpdate({ id }, query);
}

function updatePassword(id, currentPassword, newPassword) {
    return findById(id)
        .then(user => {
            if (!user) {
                return Promise.reject("User not found");
            }
            return bcrypt.compare(currentPassword, user.authToken)
                .then(matches => {
                    if (!matches) {
                        return Promise.reject("Incorrect password");
                    }
                    return bcrypt.hash(newPassword, config.security.saltRounds);
                })
                .then(hashedPassword => {
                    user.authToken = hashedPassword;
                    return user.save();
                });
        });
}

function destroy(id) {
    return User.deleteOne({ id })
        .then(countUpdated => countUpdated === 1);
}

module.exports = {
    findById,
    findByEmail,
    findByUsername,
    findAll,
    exists,
    create,
    createFromInterim,
    update,
    updatePassword,
    destroy
};