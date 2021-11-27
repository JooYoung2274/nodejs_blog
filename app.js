const express = require("express");
const app = express();
const port = 3000;
const connect = require("./schemas");
const lists = require("./routers/lists"); //router 분리
const user = require("./routers/user"); //router 분리
const comment = require("./routers/comment"); //router 분리

// npm으로 설치해준 것들 불러오기
const swaggerUI = require("swagger-ui-express");
const swaggereJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    info: {
      title: "NodeJS_blog API",
      version: "1.0.0",
    },
  },
  apis: ["app.js"],
};

const specs = swaggereJsdoc(options);
console.log(specs);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

//미들웨어 순서에 대해서 공부하기. 공식문서 ㄱㄱ
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

//mongoDB연결
connect();

//ejs사용
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

/**
 *  @swagger
 *  /register:
 *    post:
 *      description: resgister
 *      produces:
 *        - application/json
 *      parameters:
 *        - in: formData
 *          name: name
 *          required: true
 *          schema:
 *            type: string
 *            description: nickname
 *        - in: formData
 *          name: password
 *          required: true
 *          schema:
 *            type: string
 *            description: password
 *        - in: formData
 *          name: confirmPassword
 *          required: true
 *          schema:
 *            type: string
 *            description: confirmPassword
 *      responses:
 *        201:
 *          description: Success
 *
 */

//router middleware
app.use("/api", [lists]);
app.use("/api", [user]);
app.use("/api", [comment]);

// 아래에 있는 get요청들도 routers 폴더로 빼보기. 일단 과제 제출부터하고
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/write", (req, res) => {
  res.render("write");
});

app.get("/detail", (req, res) => {
  res.render("detail");
});

app.get("/edit", (req, res) => {
  res.render("edit");
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
