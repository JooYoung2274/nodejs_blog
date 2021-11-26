const express = require("express");
const Comments = require("../schemas/comment");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

// comment작성 API
router.post("/comment", authMiddleware, async (req, res) => {
  //Token이 오니까 middelware추가
  const { user } = res.locals; // middleware에서 res.locals에 담아온 user할당
  const name = user.name;
  const { postId, comment } = req.body; // req.body로 받아온 data
  const recentComment = await Comments.find().sort("-commentId").limit(1); // 가장 최근 commentId 찾기
  let commentId = 1; //시작은 1부터

  if (recentComment.length !== 0) {
    //길이가 0이 아니면 최근걸 찾아서 +1
    commentId = recentComment[0]["commentId"] + 1;
  }

  const comments = new Comments({ name, postId, comment, commentId }); // 로그인한 사람의 name, 해당 포스트의 postId
  await comments.save(); // DB저장
  res.status(201).send({});
});

// comment 불러오기 API
router.get("/comment/:postId", async (req, res) => {
  const { postId } = req.params;
  const commentList = await Comments.find({ postId });
  res.status(201).send({ result: commentList });
});

// comment 삭제 API
router.delete(
  "/delete/comment/:commentId",
  authMiddleware,
  async (req, res) => {
    const { user } = res.locals;
    const { name } = req.body;
    const { commentId } = req.params;
    console.log(commentId);
    if (name !== user.name) {
      // token에서 받아온 name과 body에서 받아온 name값이 다르면 실패! 이러려고 저 미들웨어를 쓴다
      res.send({ result: "fail" });
    } else {
      await Comments.deleteOne({ commentId });
      res.status(200).send({});
    }
  }
);
router.get("/edit/comment/:commentId", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { commentId } = req.params;
  const commentList = await Comments.findOne({ commentId });
  if (user.name !== commentList.name) {
    // token에서 받아온 name과 DB에서 받아온 name값이 다르면 실패! 이러려고 저 미들웨어를 쓴다
    res.send({ result: "fail" });
  } else {
    res.status(200).send({});
  }
});

router.post("/save/comment", async (req, res) => {
  const { commentId, comment } = req.body;
  await Comments.updateOne({ commentId }, { $set: { comment: comment } });
  res.status(200).send({});
});

module.exports = router;
