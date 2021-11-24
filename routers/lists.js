const express = require("express");
const Users = require("../schemas/user");
const Lists = require("../schemas/lists");
const Comments = require("../schemas/comment");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");

router.get("/lists", async (req, res, next) => {
  try {
    const { lists } = req.query;
    const list = await Lists.find({ lists }).sort("-postId");
    res.json({ list: list });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/write", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  console.log(user);
  const name = user["name"];
  const recentList = await Lists.find().sort("-postId").limit(1);
  let postId = 1;

  if (recentList.length !== 0) {
    postId = recentList[0]["postId"] + 1;
  }

  const { title, value, password } = req.body;

  const writeDay = new Date().format("yyyy-MM-dd a/p hh:mm:ss");
  await Lists.create({ postId, title, name, value, password, writeDay });
  res.send({ result: "success" });
});

router.post("/edit", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  console.log(user);
  let { postId, title, value, password } = req.body;
  let pass = await Lists.findOne({ postId });
  password = parseInt(password, 10);
  if (pass["password"] === password && user["name"] === pass["name"]) {
    await Lists.updateOne({ postId }, { $set: { title: title, value: value } });
    res.send({ result: "success" });
  } else if (pass["password"] !== password && user["name"] === pass["name"]) {
    res.send({ result: "비밀번호가 틀립니다.." });
  } else if (pass["password"] === password && user["name"] !== pass["name"]) {
    res.send({ result: "잘못된 접근입니다." });
  } else {
    res.send({ result: "잘못된 접근입니다." });
  }
});

router.get("/edit/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const clickList = await Lists.findOne({ postId });
    res.json({ list: clickList });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/detail/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const list = await Lists.findOne({ postId });
    res.json({ list: list });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/delete/:postId", async (req, res) => {
  const { postId } = req.params;
  const { password } = req.body;

  const deleteList = await Lists.findOne({ postId });
  if (parseInt(password, 10) === deleteList.password) {
    await Lists.deleteOne({ postId });
    res.send({ result: "success" });
  } else {
    res.send({ result: "비밀번호가 틀렸습니다.. " });
  }
});

router.post("/comment", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const name = user.name;
  const { postId, comment } = req.body;
  const recentComment = await Comments.find().sort("-commentId").limit(1);
  let commentId = 1;

  if (recentComment.length !== 0) {
    commentId = recentComment[0]["commentId"] + 1;
  }

  const comments = new Comments({ name, postId, comment, commentId });
  await comments.save();
  res.status(201).send({});
});

router.get("/comment/:postId", async (req, res) => {
  const { postId } = req.params;
  const commentList = await Comments.find({ postId });
  res.status(201).send({ result: commentList });
});

router.delete(
  "/delete/comment/:commentId",
  authMiddleware,
  async (req, res) => {
    const { user } = res.locals;
    const { name, postId } = req.body;
    const { commentId } = req.params;
    console.log(commentId);
    if (name !== user.name) {
      res.send({ result: "fail" });
    } else {
      await Comments.deleteOne({ commentId, postId });
      res.status(200).send({});
    }
  }
);
router.get("/edit/comment/:commentId", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { commentId } = req.params;
  const commentList = await Comments.findOne({ commentId });
  if (user.name !== commentList.name) {
    res.send({ result: "fail" });
  } else {
    res.status(200).send({});
  }
});

router.post("/save/comment", async (req, res) => {
  const { postId, commentId, comment } = req.body;
  await Comments.updateOne({ commentId }, { $set: { comment: comment } });
  res.status(200).send({});
});

////////////////////////////////////////////
// 회원가입
///////////////////////////////////////////
const registerSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{4,30}$")).required(),
  confirmPassword: Joi.string().required(),
});
router.post("/users", async (req, res) => {
  try {
    const { name, password, confirmPassword } =
      await registerSchema.validateAsync(req.body);

    const passArr = password.split(name); //password와 nickname 확인하기 위해서 배열화
    if (password !== confirmPassword || passArr.length !== 1) {
      //안겹치면 무조건 길이는 1개
      res.status(400).send({
        errorMessage: "패스워드 입력이 올바르지 않습니다.",
      });
      return;
    }

    const isUser = await Users.find({ name });
    if (isUser.length) {
      res.status(400).send({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    }
    const user = new Users({ name, password });
    await user.save();
    res.status(201).send({});
  } catch (error) {
    console.log(error);
    res.status(400).send({
      errorMessage: "입력된 정보가 틀립니다",
    });
  }
});

router.post("/auth", async (req, res) => {
  const { name, password } = req.body;
  const isUser = await Users.findOne({ name, password });

  if (!isUser) {
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요",
    });
    return;
  }
  const token = jwt.sign({ userId: isUser.userId }, "182436aajo");
  console.log(token);
  res.send({ token });
});

router.get("/users/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;

  res.send({ user });
});

Date.prototype.format = function (f) {
  if (!this.valueOf()) return " ";

  var weekName = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  var d = this;

  return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function ($1) {
    switch ($1) {
      case "yyyy":
        return d.getFullYear();
      case "yy":
        return (d.getFullYear() % 1000).zf(2);
      case "MM":
        return (d.getMonth() + 1).zf(2);
      case "dd":
        return d.getDate().zf(2);
      case "E":
        return weekName[d.getDay()];
      case "HH":
        return d.getHours().zf(2);
      case "hh":
        return ((h = d.getHours() % 12) ? h : 12).zf(2);
      case "mm":
        return d.getMinutes().zf(2);
      case "ss":
        return d.getSeconds().zf(2);
      case "a/p":
        return d.getHours() < 12 ? "오전" : "오후";
      default:
        return $1;
    }
  });
};
String.prototype.string = function (len) {
  var s = "",
    i = 0;
  while (i++ < len) {
    s += this;
  }
  return s;
};
String.prototype.zf = function (len) {
  return "0".string(len - this.length) + this;
};
Number.prototype.zf = function (len) {
  return this.toString().zf(len);
};

module.exports = router;
