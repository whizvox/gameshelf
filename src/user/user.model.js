const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const { roles, roleNames } = require("./role");
const config = require("../lib/config");
const { ID_SCHEMA } = require("../lib/id");

paginate.paginate.options = {
    limit: config.db.defaultLimit,
    sort: { email: 1 }
};

const userSchema = new mongoose.Schema({
    _id: ID_SCHEMA,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    usernameLower: {
        type: String,
        required: true,
        unique: true
    },
    authToken: {
        type: String,
        required: true,
        minLength: 60,
        maxLength: 60
    },
    role: {
        type: String,
        required: true,
        default: roles.MEMBER.name,
        enum: roleNames
    },
    restricted: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    // want to exclude the __v and _id fields
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.usernameLower;
        }
    },
    timestamps: true
});

userSchema.plugin(paginate);

const User = mongoose.model("User", userSchema);

module.exports = User;