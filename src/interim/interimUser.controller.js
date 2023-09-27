const Joi = require("joi");

const interimUserService = require("./interimUser.service");
const userService = require("../user/user.service");
const config = require("../lib/config");
const logger = require("../lib/logger");
const { conflict, badRequest, CREATED } = require("../lib/response");
const { ID_LENGTH } = require("../lib/id");
const User = require("../user/user.model");

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .min(3)
    .required()
});

const checkSchema = Joi.object({
  token: Joi.string()
    .length(ID_LENGTH)
    .required()
});

const confirmSchema = Joi.object({
  token: Joi.string()
    .length(ID_LENGTH)
    .required(),
  username: Joi.string()
    .min(3)
    .max(24)
    .required()
});

function register(req, res, next) {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw error;
  }
  const { email, password } = value;
  interimUserService.create(email, password)
    .then(interim => {
      // TODO Replace with emailing the confirmation token
      if (config.env.dev) {
        logger.info(`Interim user created: token=${interim._id}, email=${interim.email}`);
      }
      res.status(201).send();
    })
    .catch(next);
}

function checkToken(req, res, next) {
  // make it a post request to not display sensitive information (token) in
  // an otherwise unencrypted GET request
  const { error, value } = checkSchema.validate(req.body);
  if (error) {
    throw error;
  }
  const { token } = value;
  interimUserService.find(token)
    .then(iuser => {
      if (iuser) {
        // check if token has expired
        if (iuser.expiresAt.getTime() < new Date().getTime()) {
          interimUserService.deleteById(iuser._id)
            .then(() => res.send(false))
            .catch(next);
        } else {
          res.send(true);
        }
      } else {
        res.send(false);
      }
    })
    .catch(next);
}

function confirm(req, res, next) {
  const { error, value } = confirmSchema.validate(req.body);
  if (error) {
    throw error;
  }
  const { token, username } = value;
  userService.findByUsername(username)
    .then(user => {
      if (user) {
        throw conflict("Username is not unique", { username });
      }
      return interimUserService.find(token);
    })
    .then(iuser => {
      if (!iuser) {
        throw badRequest("Invalid verification token");
      }
      if (iuser.expiresAt.getTime() < new Date().getTime()) {
        return interimUserService.deleteById(iuser._id)
          .then(() => {
            throw badRequest("Expired verification token");
          }).catch(next);
      } else {
        return userService.findByEmail(iuser.email)
          .then(user => {
            if (user) {
              throw conflict("Email is not unique", { email: user.email });
            }
            return User.create({
              email: iuser.email,
              username: username,
              usernameLower: username.toLowerCase(),
              authToken: iuser.authToken
            });
          });
      }
    })
    .then(user => {
      res.status(CREATED).send(user);
    })
    .catch(next);
}

module.exports = {
  register,
  checkToken,
  confirm
};