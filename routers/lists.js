const express = require("express");
const Lists = require("../schemas/lists");
const Comments = require("../schemas/comment");
const router = express.Router();

// 사용자 인증용 middleware
const authMiddleware = require("../middlewares/auth-middleware");

// list 목록 불러오기 API
router.get("/lists", async (req, res, next) => {
  try {
    const { lists } = req.query;
    // page가 이동하면서 url로 데이터를 넘겨줘서 Query parameter로 받아옴.
    // 아! page 이동할때 Path variable로 넘겨주고 해당 인자만 따로 빼서
    // 객체 구조 분할이 아니라 그냥 변수에 할당해주면 쓸 수 있는거 아닌가?!?!!?!?!!?!?!
    const list = await Lists.find({ lists }).sort("-postId");
    res.json({ list: list });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 글발행 API
router.post("/write", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const name = user["name"];
  const recentList = await Lists.find().sort("-postId").limit(1); // 최근 리스트들을 postId 역순으로 정렬
  let postId = 1;
  if (recentList.length !== 0) {
    postId = recentList[0]["postId"] + 1; // postId가 글발행될때마다 최근 postId + 1
  }
  const { title, value, password } = req.body;
  const writeDay = new Date().format("yyyy-MM-dd a/p hh:mm:ss");
  await Lists.create({ postId, title, name, value, password, writeDay });
  res.send({ result: "success" });
});

// 글수정 API
router.post("/edit", authMiddleware, async (req, res) => {
  const { user } = res.locals;
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

// 수정하기 버튼의 사용자 인증 및 미로그인 확인 API
router.get("/editCheck/:editPostId", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { editPostId } = req.params;
  let name = user.name;
  const list = await Lists.findOne({ postId: editPostId });
  if (list.name === name) {
    res.status(200).send({});
  } else {
    res.status(401).send({
      errorMessage: "권한이 없습니다.",
    });
  }
});

// 수정하기 버튼 클릭이 통과되면 실행되는 클릭한 postId의 정보를 가져오는 API
router.get("/edit/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const clickList = await Lists.findOne({ postId });
    res.json({ list: clickList });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 상세 페이지 조회하는 API
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

// 삭제하기 API
router.delete("/delete/:postId", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const name = user.name;
  const { postId } = req.params;
  const { password } = req.body;

  const deleteList = await Lists.findOne({ postId });
  if (
    parseInt(password, 10) === deleteList.password &&
    name === deleteList.name
  ) {
    await Lists.deleteOne({ postId });
    await Comments.deleteMany({ postId });
    res.send({ result: "success" });
  } else {
    res.send({ result: "비밀번호가 틀렸습니다.. " });
  }
});

// 날짜 지정 양식
// 어디서 퍼옴.. 이해해봐야지
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
