const pino = require("pino");
const config = require("./config");

const logger = pino({
    name: config.log.name,
    level: config.log.level
});

if (config.env.dev) {
    logger.warn("Dev environment is enabled! Messages sent to clients will " +
        "be more descriptive and can potentially contain confidential " +
        "information. If you do not wish this to happen, set NODE_ENV=prod");
}

module.exports = logger;