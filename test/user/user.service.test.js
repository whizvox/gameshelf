require("../setup");
const assert = require("assert");
const mongoose = require("mongoose");
const config = require("../../src/lib/config");

const User = require("../../src/user/user.model");
const userService = require("../../src/user/user.service");
const { roles } = require("../../src/user/role");

before(() => {
    return mongoose.connect(config.db.url);
});

after(() => {
    return mongoose.disconnect();
});

beforeEach(() => {
    return User.deleteMany({}).then(() => {
        return Promise.all([
            User.create({ _id: "NuHYR6ecDuxJ9zM3IC9R2", email: "test1@example.com", username: "test1", usernameLower: "test1", authToken: "$2b$10$tYfquW2YVyoxhCaSD2O1OuRlSvvLYQbVxNTEzl4OTPY1jdPpzwUhm", role: roles.MEMBER.name, restricted: 0 }),
            User.create({ _id: "zVofwNUdY4omQco9RHvmk", email: "test2@example.com", username: "test2", usernameLower: "test2", authToken: "$2b$10$y24dZNaeD098AG48c7gSIuqS36iN1fXJ2qytrFxydYsWDUE1NdKE2", role: roles.EDITOR.name, restricted: 0 }),
            User.create({ _id: "ZQYXE7Rv69Rf7Qg7IRBGI", email: "test3@example.com", username: "test3", usernameLower: "test3", authToken: "$2b$10$sX4yDlUOR9xMdd5Vfqo.NeAxv7WIX8RbSlN9cuRmT6W934qMmuJMC", role: roles.MODERATOR.name, restricted: 0 }),
            User.create({ _id: "E4s246hJP8qEahAMm67JE", email: "test4@example.com", username: "test4", usernameLower: "test4", authToken: "$2b$10$T7JHmbNe3tlPxCP3J/qZNOl9gnafUMbJJrskdTFEzhLcBUoWOJ78e", role: roles.ADMIN.name, restricted: 0 })
        ]);
    });
});

describe("#findById", () => {
    it("known ID -> correct user", () => {
        return userService.findById("NuHYR6ecDuxJ9zM3IC9R2").then(user => {
            assert.notEqual(user, null);
        });
    });
});