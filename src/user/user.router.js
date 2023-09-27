const express = require("express");
const userService = require("./user.service");
const { getPagingOptions } = require("../lib/paging.util");
const { CREATED, abort500, abort, forbidden, ok, ServiceResponse, badRequest } = require("../lib/response");
const auth = require("../middleware/auth.middleware");
const { roles, roleNames } = require("./role");
const Joi = require("joi");
const { ID_LENGTH } = require("../lib/id");

const FORBIDDEN = schema => schema.forbidden();
const REQUIRED = schema => schema.required();

const userSchema = Joi.object({
    id: Joi.string()
        .length(ID_LENGTH)
        .alter({
            create: FORBIDDEN,
            update: REQUIRED,
            destroy: REQUIRED
        }),
    email: Joi.string()
        .email()
        .max(255)
        .alter({
            create: REQUIRED
        }),
    username: Joi.string()
        .min(3)
        .max(24)
        .alter({
            create: REQUIRED
        }),
    password: Joi.string()
        .min(6)
        .alter({
            create: REQUIRED,
            update: FORBIDDEN,
            updatePassword: REQUIRED,
        }),
    role: Joi.string()
        .allow(...roleNames),
    currentPassword: Joi.string()
        .alter({
            updatePassword: REQUIRED
        })
});

const getSchema = userSchema.tailor("get");
const createSchema = userSchema.tailor("create");
const updateSchema = userSchema.tailor("update");
const updatePasswordSchema = userSchema.tailor("updatePassword");
const destroySchema = userSchema.tailor("destroy");

function get(req, res, next) {
    const v = getSchema.validate(req.query);
    if (v.error) {
        throw v.error;
    }
    const { id, email, username } = v.value;
    let promise;
    if (id) {
        promise = userService.findById(id);
    } else if (email) {
        promise = userService.findByEmail(email);
    } else if (username) {
        promise = userService.findByUsername(username);
    } else {
        const options = getPagingOptions(req.query);
        promise = userService.findAll(options);
    }
    promise
        .then(result => res.send(result))
        .catch(next);
}

function create(req, res, next) {
    const v = createSchema.validate(req.body);
    if (v.error) {
        throw v.error;
    }
    const { email, username, password, role } = v.value;
    userService.create(email, username, password, role)
        .then(user => res.status(CREATED).send(user))
        .catch(next);
}

function update(req, res, next) {
    const { id, ...query } = updateSchema.validate(req.body);
    userService.update(id, query)
        .then(user => res.send(user))
        .catch(next);
}

function destroy(req, res, next) {
    const { id } = destroySchema.validate(req.query);
    userService.destroy(id)
        .then(deleted => abort(res, ok(null, deleted)))
        .catch(next);
}

const availableSchema = Joi.object({
    email: Joi.string(),
    username: Joi.string()
}).xor("email", "username");

function isAvailable(req, res, next) {
    const { error, value } = availableSchema.validate(req.query);
    if (error) {
        throw error;
    }
    // schema guarantees that exactly one of these will be defined
    const { email, username } = value;
    if (email !== undefined) {
        userService.findByEmail(email)
            .then(user => res.send(!user))
            .catch(next);
    } else if (username !== undefined) {
        userService.findByUsername(username)
            .then(user => res.send(!user))
            .catch(next);
    } else {
        // shouldn't happen, but check regardless
        throw badRequest("Need either email or password");
    }
}

const router = express.Router();
router.get("/available", isAvailable);
router.get("/", auth.grabSession, auth.hasMinRole(roles.ADMIN), get);
router.post("/", auth.grabSession, auth.hasMinRole(roles.ADMIN), create);
router.put("/", auth.grabSession, auth.hasMinRole(roles.ADMIN), update);
router.delete("/", auth.grabSession, auth.hasMinRole(roles.ADMIN), destroy);
router.put("/", auth.grabSession, update);

module.exports = router;