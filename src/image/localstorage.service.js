const logger = require("../lib/logger");
const { badRequest } = require("../lib/response");
const path = require("node:path");
const fs = require("node:fs/promises");
const config = require("../lib/config");
const sanitize = require("sanitize-filename");
const { Stats } = require("node:fs");

const ROOT_DIR = path.join(".", config.files.uploadDir).normalize();

/**
 * Resolve paths against the root directory of local storage
 * @param  {...String} paths Array of paths to be used in path.join
 * @returns {String} Sanitized and normalized file path
 * @throws If a malicious path was detected
 */
function resolve(...paths) {
  // remove potential for backtracing attack
  const sPaths = paths.map(p => sanitize(p));
  return path.join(ROOT_DIR, ...sPaths).normalize();
}

/**
 * Upload a file
 * @param {*} file - A file from express-fileupload middleware
 * @param {String|[String]} [dstFilePath] - Relative path of destination file
 * @returns {Promise<String>} Promise which returns relative path of uploaded file
 */
function upload(file, dstFilePath) {
  if (!dstFilePath) {
    dstFilePath = file.name;
  }
  if (typeof(dstFilePath) === "string") {
    dstFilePath = dstFilePath.split("/");
  } else if (!Array.isArray(dstFilePath)) {
    throw new Error("dstFilePath should be an array of strings or a string");
  }
  if (config.files.tempUploadDir) {
    if (!file.tempFilePath) {
      throw internalServerError("FILES_USE_TEMP is enabled, but no temp file was found");
    }
    const dstPath = resolve(...dstFilePath);
    // check if the root dir isn't part of the final normalized path
    const parentDir = path.dirname(dstPath);
    let p = Promise.resolve();
    if (parentDir !== ROOT_DIR) {
      p = fs.access(parentDir, fs.constants.F_OK)
        .then(() => null)
        // the file doesn't exist, so create it
        .catch(() => fs.mkdir(parentDir));
    }
    return p
      .then(createdDir => {
        if (createdDir) {
          logger.info(`Created parent directory: ${createdDir}`);
        }
        return file.mv(dstPath);
      })
      .then(() => {
        logger.info(`Uploaded new file to ${dstPath}`);
        // return the relative path
        return dstPath.substring(dstPath.indexOf(ROOT_DIR) + ROOT_DIR.length);
      });
  } else {
    throw internalServerError("Non-temp files are not yet supported");
  }
}

/**
 * Remove a file if it exists
 * @param {String} filePath - Relative path of the file to remove
 * @returns {Promise<boolean>} Promise which returns `true` if removed, `false` otherwise
 */
function remove(filePath) {
  const nPath = resolve(filePath);
  return fs.access(nPath, fs.constants.F_OK)
    .then(() => {
      return fs.rm(nPath).then(() => true);
    })
    .catch(() => {
      return false;
    });
}

/**
 * Get all file paths in local storage
 * @param {String} dir Relative directory path
 * @returns {[String]} Array of file paths
 */
function listFiles(dir) {
  if (!dir) {
    dir = ".";
  }
  const nDir = resolve(dir);
  // filter out directories
  return fs.readdir(nDir)
    .then(files => {
      return Promise.all(files.map(file => fs.stat(file).then(stats => { file, stats })));
    })
    .then(files => {
      return files.filter(obj => !obj.stats.isDirectory()).map(obj => obj.file);
    });
}

/**
 * Get a file's stats
 * @param {String} filePath Relative file path
 * @return {Promise<Stats>} Promise which resolves to a stats object if the file
 * exists, rejects otherwise
 */
function stats(filePath) {
  const nPath = resolve(filePath);
  return fs.stat(nPath);
}

module.exports = {
  ROOT_DIR,
  resolve,
  upload,
  remove,
  listFiles,
  stats
}