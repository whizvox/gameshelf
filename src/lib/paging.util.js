const config = require("./config");

const MIN_LIMIT = 5;
const MAX_LIMIT = 100;

const CUSTOM_LABELS = {
    docs: "items",
    totalDocs: "totalItems",
    pagingCounter: false,
    hasPrevPage: false,
    hasNextPage: false
};

function getPagingOptions(query) {
    let { limit, page, sortBy, asc } = query;
    if (limit) {
        if (limit < MIN_LIMIT) {
            limit = MIN_LIMIT;
        } else if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }
    } else {
        limit = config.db.defaultLimit;
    }
    if (page) {
        if (page < 0) {
            page = 0;
        }
    } else {
        page = 0;
    }
    let sort = undefined;
    if (sortBy) {
        sort = { sortBy: 1 };
    }
    if (asc && sort) {
        sort[sortBy] = -1;
    }
    return { limit, page, sort, customLabels: CUSTOM_LABELS };
}

module.exports = {
    getPagingOptions
};