const nanoid = require("nanoid");

const SMALL_ID_LENGTH = 8;
const ID_LENGTH = 21;

function generateSmallId() {
    return nanoid.nanoid(SMALL_ID_LENGTH);
}

function generateId() {
    return nanoid.nanoid(ID_LENGTH);
}

const SMALL_ID_SCHEMA = {
    type: String,
    required: true,
    minLength: SMALL_ID_LENGTH,
    maxLength: SMALL_ID_LENGTH,
    default: generateSmallId
};

const ID_SCHEMA = {
    type: String,
    required: true,
    minLength: ID_LENGTH,
    maxLength: ID_LENGTH,
    default: generateId
};

module.exports = {
    SMALL_ID_LENGTH,
    ID_LENGTH,
    SMALL_ID_SCHEMA,
    ID_SCHEMA,
    generateSmallId,
    generateId
};