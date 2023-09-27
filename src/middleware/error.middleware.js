const config = require("../lib/config");
const logger = require("../lib/logger");
const { abort, badRequest, ServiceResponse, abort500 } = require("../lib/response");

function handleError(err, req, res, next) {
  if (err.isJoi) {
    abort(res, badRequest(err.message, config.env.dev && err.details));
  } else if (err instanceof ServiceResponse) {
    if (err.isOk() || err.isRedirect()) {
      logger.warn(err, "2xx/3xx response was thrown for some reason");
      abort500(res, "Unexpected error", config.env.dev && err);
    } else {
      abort(res, err);
    }
  } else {
    logger.warn(err, "Unexpected error");
    abort500(res, null, config.env.dev && err);
  }
}

module.exports = handleError;