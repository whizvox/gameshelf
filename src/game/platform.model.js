const { default: mongoose } = require("mongoose");
const { SMALL_ID_SCHEMA } = require("../lib/id");
const Image = require("../image/image.model");

const platformSchema = new mongoose.Schema({
  _id: SMALL_ID_SCHEMA,
  name: {
    type: String,
    required: true,
  },
  description: String,
  releaseYear: Number,
  discontinuedYear: Number,
  mainImage: {
    type: String,
    ref: Image
  },
  images: [{
    type: String,
    ref: Image
  }]
});

const Platform = mongoose.model("Platform", platformSchema);

module.exports = Platform;