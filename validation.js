module.exports = {
  register: (password, confirmPassword, nickname) => {
    let pass = password.split(nickname);

    if (!/^([a-zA-Z0-9]).{2,}$/.test(nickname)) {
      return false;
    } else if (password !== confirmPassword || password.length < 4) {
      return false;
    } else if (pass.length === 2) {
      return false;
    }

    return true;
  },
};
