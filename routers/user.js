const express = require("express");
const Users = require("../schemas/user");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");

////////////////////////////////////////////
// 회원가입
////////////////////////////////////////////
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

module.exports = router;
