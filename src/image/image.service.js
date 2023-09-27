const config = require("../lib/config");
const { generateSmallId, generateId } = require("../lib/id");
const { internalServerError } = require("../lib/response");
const path = require("node:path");
const Image = require("./image.model");
const storageService = require("./localstorage.service");

const ROOT_DIR = path.join(".", config.files.uploadDir, "images").normalize();

// function upload(file, explicit) {
//   storageService.
// }