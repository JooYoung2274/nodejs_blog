const { register } = require("./validation");

test("닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 이루어져 있어야 합니다", () => {
  expect(register("1234", "1234", "joo2")).toEqual(true);
  expect(register("1234", "1234", "JOO")).toEqual(true);
  expect(register("1234", "1234", "j1")).toEqual(false);
});
test("비밀번호는 최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패합니다.", () => {
  expect(register("jo242", "jo242", "joo2")).toEqual(true);
  expect(register("joo2", "joo2", "joo2")).toEqual(false);
  expect(register("123", "123", "joo2")).toEqual(false);
});
test("비밀번호 확인은 비밀번호와 정확하게 일치해야 합니다.", () => {
  expect(register("1234", "1234", "joo2")).toEqual(true);
  expect(register("1234", "12345", "joo2")).toEqual(false);
});
test("닉네임 중복 확인", () => {
  expect(register("1234", "1234", "joo")).toEqual(true);
  expect(register("1234", "1234", "joo2")).toEqual(true);
});
