const express = require("express");
const app = express();
const port = 3000;
const connect = require("./schemas");
const lists = require("./routers/lists");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

//mongoDB연결

connect();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/api", [lists]);

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
