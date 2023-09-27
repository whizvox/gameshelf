const express = require("express");
const userService = require("./user.service");
const { grabSession, hasMinRole } = require("../middleware/auth.middleware");
const { roles } = require("./role");

function get(req, res, next) {
  const id = req.session.user;
  userService.findById(id)
    .then(user => res.send(user))
    .catch(next);
}

function update(req, res, next) {
  const id = req.session.user;
  const query = req.body;
  userService.update(id, query)
    .then(user => res.send(user))
    .catch(next);
}

function updatePassword(req, res, next) {
  const id = req.session.user;
  const { currentPassword, password } = req.body;
  userService.updatePassword(id, currentPassword, password)
    .then(user => res.send(user))
    .catch(next);
}

function destroy(req, res, next) {
  const id = req.session.user;
  userService.destroy(id)
    .then(deleted => res.send({ deleted }))
    .catch(next);
}

const router = express.Router();
router.get("/", grabSession, hasMinRole(roles.MEMBER), get);
router.post("/", grabSession, hasMinRole(roles.MEMBER), update);
router.put("/pwd", grabSession, hasMinRole(roles.MEMBER), updatePassword);
router.put("/", grabSession, hasMinRole(roles.MEMBER), update);
router.delete("/", grabSession, hasMinRole(roles.MEMBER), destroy);

module.exports = router;