const express = require("express");
const app = express();
const port = 3000;
const connect = require("./schemas");
const lists = require("./routers/lists");

//미들웨어 순서에 대해서 공부하기. 공식문서 ㄱㄱ
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

//mongoDB연결
connect();

//ejs사용
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/api", [lists]);

// 아래에 있는 get요청들도 routers 폴더로 빼보기. 일단 과제 제출부터하고
app.get("/", (req, res) => {
  res.render("home");
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
