function loginBtn() {
  if (localStorage.getItem("token")) {
    $("#loginBtn").text("๋ก๊ทธ์์");
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
