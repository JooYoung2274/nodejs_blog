const express = require("express");
const Comments = require("../schemas/comment");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

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

module.exports = router;
