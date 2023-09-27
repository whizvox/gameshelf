require("dotenv").config();
const logger = require("./src/lib/logger");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const userRouter = require("./src/user/user.router");
const selfRouter = require("./src/user/self.router");
const interimRouter = require("./src/interim/interimUser.router");
const { login, logout } = require("./src/session/session.controller");
const mongoose = require("mongoose");
const config = require("./src/lib/config");
const { grabSession } = require("./src/middleware/auth.middleware");
const { payloadTooLarge } = require("./src/lib/response");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
    createParentPath: true,
    limitHandler: (req, res, next) => next(payloadTooLarge("File upload limit reached")),
    useTempFiles: !!config.files.tempUploadDir,
    tempFileDir: config.files.tempUploadDir
}));
app.use("/user", userRouter);
app.use("/self", selfRouter);
app.use("/interim", interimRouter);
app.use("/login", login);
app.use("/logout", grabSession, logout);
app.use(require("./src/middleware/error.middleware"));

mongoose.connect(config.db.url)
    .then(() => {
        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    });