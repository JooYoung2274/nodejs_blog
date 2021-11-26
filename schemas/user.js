const mongoose = require("mongoose");

const { Schema } = mongoose;
const UsersSchema = new Schema({
  name: String,
  password: String,
});

// userId라는 이름으로 _id 사용
UsersSchema.virtual("userId").get(function () {
  return this._id.toHexString();
});
UsersSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("User", UsersSchema);
