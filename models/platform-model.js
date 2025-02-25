const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PlatformSchema = new Schema({
  name: { type: String },
  url: { type: String, unique: true },
});

module.exports = model("Platform", PlatformSchema);
