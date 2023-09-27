const { default: mongoose } = require("mongoose");
const { ID_SCHEMA } = require("../lib/id");

const imageSchema = new mongoose.Schema({
  _id: ID_SCHEMA,
  mimeType: {
    type: String,
    enum: [ "avif", "gif", "jpeg", "png", "svg+html", "tiff", "webp" ],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  explicit: {
    type: Boolean,
    required: true,
    default: true
  }
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;