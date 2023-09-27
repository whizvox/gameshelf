const { forbidden, unauthorized, ServiceResponse, abort, abort500 } = require("../lib/response");
const { parseRole } = require("../user/role");
const sessionService = require("../session/session.service");
const userService = require("../user/user.service");
const config = require("../lib/config");

const SESSION_KEY = "SESSIONKEY";

function grabSession(req, res, next) {
  const key = req.cookies[SESSION_KEY];
  if (key) {
    sessionService.findByKey(key)
      .then(session => {
        if (session) {
          const role = parseRole(session.role);
          if (!role) {
            abort500(res, "Unknown user role", config.env.dev && { role });
          }
          const { _id, user, expiresAt } = session;
          req.session = { _id, user, expiresAt, role };
        }
        next();
      })
      .catch(err => {
        abort500(res, "Error while grabbing session", err);
      });
  } else {
    next();
  }
}

function grabUser(req, res, next) {
  const session = req.session;
  if (session) {
    userService.findById(session.user)
      .then(user => {
        if (user) {
          req.user = user;
        }
        next();
      })
      .catch(err => {
        abort(500, "Error while grabbing user", err);
      });
  } else {
    next();
  }
}

function authorize(authFunc) {
  return (req, res, next) => {
    if (!req.session) {
      throw unauthorized();
    }
    if (req.session.expiresAt.getTime() < new Date().getTime()) {
      // if session expired, delete cookie and return 403
      sessionService.deleteByKey(req.session._id)
        .then(() => {
          res.clearCookie(SESSION_KEY);
          next(forbidden("Session expired"));
        }).catch(next);
    } else {
      const result = authFunc(req);
      if (result instanceof Promise) {
        result
          .then(() => next())
          .catch(next);
      } else {
        next();
      }
    }
  };
}

function hasMinRole(minRole) {
  return authorize(req => {
    if (!req.session.role.hasPermission(minRole)) {
      throw forbidden("Do not have permission");
    }
  });
}

function isSelf(userIdFunc) {
  return authorize(req => {
    if (req.session.user !== userIdFunc(req)) {
      throw forbidden("Must be self");
    }
  });
}

function hasMinRoleOrIsSelf(minRole, userIdFunc) {
  return authorize(req => {
    if (req.session.user !== userIdFunc(req)) {
      if (!session.role.hasPermission(minRole)) {
        throw forbidden("Do not have permission");
      }
    }
  });
}

function isNotLoggedIn(redirectUrl) {
  if (!redirectUrl) {
    redirectUrl = "/";
  }
  return (req, res, next) => {
    if (req.cookies[SESSION_KEY]) {
      res.redirect(redirectUrl);
    } else {
      next();
    }
  }
}

function isLoggedIn() {
  return authorize(req => true);
}

module.exports = {
  SESSION_KEY,
  grabSession,
  grabUser,
  authorize,
  hasMinRole,
  isSelf,
  hasMinRoleOrIsSelf,
  isNotLoggedIn,
  isLoggedIn
};