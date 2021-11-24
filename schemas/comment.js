const mongoose = require("mongoose");

const { Schema } = mongoose;
const commentSchema = new Schema({
  postId: Number,
  comment: String,
  name: String,
  commentId: Number,
});

module.exports = mongoose.model("Comment", commentSchema);
