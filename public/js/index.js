import { form_login } from "./axiosrequests.js";
const formlogin = document.querySelector(".form-login");
let namesings4;
$(".namesings4").keyup(function () {
  namesings4 = $(this).val();
});
let description;
$(".onas").keyup(function () {
  description = $(this).val();
});
let stop = 0;
function showError(message) {
  document.querySelector(".as").classList.add("anim");
  document.querySelector(".as").textContent = message;
  setTimeout(function () {
    document.querySelector(".as").classList.remove("anim");
  }, 3000);
  stop = 1;
}

function onlySpaces(str) {
  return /^\s*$/.test(str);
}
if (formlogin) {
  formlogin.addEventListener("submit", (e) => {
    e.preventDefault();
    // alert("hj");
    const data = new FormData();
    onlySpaces(document.querySelector(".emailends").value) &&
      showError("Please Enter Email");
    if (stop === 1) {
      stop = 0;
      return;
    }
    onlySpaces(document.querySelector(".passwordends").value) &&
      showError("Please Enter Password");
    if (stop === 1) {
      stop = 0;
      return;
    }
    // console.log(document.querySelector(".emailends").value);
    // console.log(document.querySelector(".passwordends").value);
    data.append("email", document.querySelector(".emailends").value);
    data.append("password", document.querySelector(".passwordends").value);
    // console.log(data);
    document.querySelector(".onebuta").classList.add("d-none");
    document.querySelector(".twobuta").classList.remove("d-none");
    document.querySelector(".noload").classList.add("d-none");
    document.querySelector(".load").classList.remove("d-none");
    form_login(data);
  });
}
