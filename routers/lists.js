const express = require("express");

const Lists = require("../schemas/Lists");
const router = express.Router();

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

router.post("/write", async (req, res) => {
  const recentList = await Lists.find().sort("-postId").limit(1);
  let postId = 1;

  if (recentList.length !== 0) {
    postId = recentList[0]["postId"] + 1;
  }
  console.log(req.body);
  const { title, name, value, password } = req.body;
  const writeDay = new Date().format("yyyy-MM-dd a/p hh:mm:ss");
  console.log(writeDay);
  await Lists.create({ postId, title, name, value, password, writeDay });
  res.send({ result: "success" });
});

router.post("/edit", async (req, res) => {
  const { postId, title, value, name } = req.body;
  await Lists.updateOne(
    { postId },
    { $set: { title: title, value: value, name: name } }
  );
  res.send({ result: "success" });
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
    console.log(req.params);
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
  console.log(deleteList.password);
  if (parseInt(password, 10) === deleteList.password) {
    await Lists.deleteOne({ postId });
    res.send({ result: "success" });
  } else {
    res.send({ result: "비밀번호가 틀렸습니다.. " });
  }
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
