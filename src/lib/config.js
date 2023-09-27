const logger = require("./logger");

const { NODE_ENV } = process.env;

const config = {
    app: {
        verifyEmail: process.env.VERIFY_EMAIL || false
    },
    env: {
        // assume dev environment if NODE_ENV is not set
        dev: NODE_ENV ?
            (NODE_ENV === "dev" || NODE_ENV === "development") : true,
        prod: NODE_ENV ?
            (NODE_ENV === "prod" || NODE_ENV === "production") : false
    },
    log: {
        name: process.env.LOG_NAME || "GameShelf",
        level: process.env.LOG_LEVEL || "info"
    },
    db: {
        url: process.env.MONGODB_URL,
        defaultLimit: 20
    },
    security: {
        saltRounds: process.env.SALT_ROUNDS || 10
    },
    files: {
        uploadDir: process.env.UPLOAD_DIR || "./upload",
        tempUploadDir: process.env.TEMP_UPLOAD_DIR || "./temp/upload"
    }
};

if (!config.env.dev && !config.env.prod) {
    throw new Error(`Unknown environment via NODE_ENV: ${NODE_ENV}`);
}

module.exports = config;