const Joi = require("joi");

const sessionService = require("./session.service");
const { CREATED, forbidden } = require("../lib/response");
const { SESSION_KEY } = require("../middleware/auth.middleware");
const { addDays } = require("../lib/date.util");

const loginSchema = Joi.object({
  email: Joi.string(),
  password: Joi.string(),
  rememberMe: Joi.any()
});

function login(req, res, next) {
  const v = loginSchema.validate(req.body);
  if (v.error) {
    throw v.error;
  }
  if (req.cookies[SESSION_KEY]) {
    throw forbidden("Already logged in");
  }
  const { email, password, rememberMe } = v.value;
  // rememberMe just has to be defined. if not, rely on default value from mongo
  let expiresAt = undefined;
  if (rememberMe !== undefined) {
    expiresAt = addDays(new Date(), 30);
  }
  sessionService.createFromCredentials(email, password, expiresAt)
    .then(session => {
      res.cookie(SESSION_KEY, session._id, { expires: session.expiresAt });
      res.status(CREATED).send(true);
    })
    .catch(next);
}

function logout(req, res, next) {
  const key = req.cookies[SESSION_KEY];
  if (!key) {
    return res.send(false);
  }
  sessionService.deleteByKey(key)
    .then(deleted => {
      res.clearCookie(SESSION_KEY);
      res.send(deleted);
    })
    .catch(next);
}

module.exports = {
  login,
  logout
};