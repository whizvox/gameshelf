require("../setup");
const { expect } = require("chai");

const assert = require("assert");
const { resolve, ROOT_DIR, upload } = require("../../src/image/localstorage.service");
const { join, normalize } = require("path");
const fs = require("node:fs");
const config = require("../../src/lib/config");
const { createHash } = require("crypto");

function mockFile(fileName, mimeType) {
  const origPath = normalize(join(__dirname, "test/storage", fileName));
  const tempPath = normalize(join(ROOT_DIR, fileName));
  fs.cpSync(origPath, tempPath);
  const stat = fs.statSync(tempPath);
  const buf = fs.readFileSync(tempPath);
  const hash = createHash("md5").update(buf).digest("hex");
  return {
    name: fileName,
    mv: dstPath => {
      fs.renameSync(tempPath, dstPath);
    },
    mimetype: mimeType,
    tempFilePath: tempPath,
    truncated: false,
    size: stat.size,
    md5: hash
  };
}

function mockTextFile() {
  return mockFile("lorem.txt", "text/plain");
}

function mockImageFile() {
  return mockFile("lorem.png", "image/png");
}

describe("Localstorage Service Tests", () => {

  describe("#resolve", () => {
    it("valid file path -> normalized absolute path", () => {
      expect(resolve("test")).to.be.equal(join(ROOT_DIR, "test"));
      expect(resolve("path", "to", "file")).to.be.equal(join(ROOT_DIR, "path", "to", "file"));
    });
    it("unwanted characters -> sanitized file path", () => {
      expect(resolve("../../..")).to.be.equal(ROOT_DIR);
      expect(resolve("\u0000")).to.be.equal(ROOT_DIR);
      expext(resolve("\\?\"")).to.be.equal(ROOT_DIR);
    });
    it("reserved Windows filename -> sanitized file path", () => {
      expect(resolve("CON")).to.be.equal(ROOT_DIR);
      expect(resolve("con", "dir1", "dir2")).to.be.equal(join(ROOT_DIR, "dir1", "dir2"));
      expect(resolve("dir1", "dir2", "AUX")).to.be.equal(join(ROOT_DIR, "dir1", "dir2"));
    });
  });

  describe("#upload", () => {
    it("valid file -> file successfully uploaded", async () => {
      const f1 = mockTextFile();
      const f2 = mockImageFile();
      await upload(f1);
      expect()
    });
  });

});