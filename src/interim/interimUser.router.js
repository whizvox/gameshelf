const express = require("express");

const { register, checkToken, confirm } = require("./interimUser.controller");

const router = express.Router();
router.post("/register", register);
router.post("/check", checkToken);
router.post("/confirm", confirm);

module.exports = router;