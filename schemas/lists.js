const mongoose = require("mongoose");

const { Schema } = mongoose;
const listsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  writeDay: {
    type: String,
    required: true,
  },
  postId: {
    type: Number,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Lists", listsSchema);
