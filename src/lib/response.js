class ServiceResponse extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
    isOk() {
        return Math.floor(this.status / 100) === 2;
    }
    isRedirect() {
        return Math.floor(this.status / 100) === 3;
    }
    isBadRequest() {
        return Math.floor(this.status / 100) === 4;
    }
    isInternalServerError() {
        return Math.floor(this.status / 100) === 5;
    }
    toJSON() {
        return { status: this.status, message: this.message, details:
            this.details };
    }
}

const
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    PAYLOAD_TOO_LARGE = 413,
    INTERNAL_SERVER_ERROR = 500;

function abort(res, serviceResponse) {
    res.status(serviceResponse.status).json(serviceResponse.toJSON());
}

function createResponse(status, message, details, defaultMessage) {
    return new ServiceResponse(status, message ?? defaultMessage, details);
}

function ok(message, details) {
    return createResponse(OK, message, details, "OK");
}

function created(message, details) {
    return createResponse(CREATED, message, details, "Created");
}

function badRequest(message, details) {
    return createResponse(BAD_REQUEST, message, details, "Bad request");
}

function unauthorized(message, details) {
    return createResponse(UNAUTHORIZED, message, details, "Unauthorized");
}

function forbidden(message, details) {
    return createResponse(FORBIDDEN, message, details, "Forbidden");
}

function conflict(message, details) {
    return createResponse(CONFLICT, message, details, "Conflict");
}

function payloadTooLarge(message, details) {
    return createResponse(PAYLOAD_TOO_LARGE, message, details, "Payload too large");
}

function internalServerError(message, details) {
    return createResponse(INTERNAL_SERVER_ERROR, message, details, "Internal server error");
}

function abort500(res, message, details) {
    abort(res, new ServiceResponse(INTERNAL_SERVER_ERROR, message ?? "Internal server error", details));
}

module.exports = {
    ServiceResponse,
    abort,
    abort500,
    OK, CREATED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT,
    PAYLOAD_TOO_LARGE, INTERNAL_SERVER_ERROR,
    ok, created, badRequest, unauthorized, forbidden, conflict, payloadTooLarge,
    internalServerError
};