const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const DeveloperSchema = new Schema({
  name: { type: String },
  url: { type: String, unique: true },
});

module.exports = model("Developer", DeveloperSchema);
