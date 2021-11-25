function loginBtn() {
  if (localStorage.getItem("token")) {
    $("#loginBtn").text("로그아웃");
  }
}

function logInOut() {
  if (localStorage.getItem("token")) {
    localStorage.clear();
    location.reload();
  } else {
    window.location.href = "/login";
  }
}
