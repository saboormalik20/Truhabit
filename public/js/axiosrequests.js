export const form_login = async (data) => {
  try {
    console.log("ok");
    // console.log(data);
    const res = await axios({
      method: "POST",
      url: "https://rebalance.dejuretechnologies.com/api/v1/admin/login2",
      data,
    });
    if (res.data.status === "success") {
      document.querySelector(".onebuta").classList.remove("d-none");
      document.querySelector(".twobuta").classList.add("d-none");
      document.querySelector(".noload").classList.remove("d-none");
      document.querySelector(".load").classList.add("d-none");
      console.log(res.data);
      localStorage.setItem("jwt", res.data.token);

      document.querySelector(".as").classList.add("anim");
      document.querySelector(".as").textContent = "Login Successful";
      setTimeout(function () {
        document.querySelector(".as").classList.remove("anim");
      }, 3000);
      //   document.querySelector(".noload").classList.remove("d-none");
      //   document.querySelector(".load").classList.add("d-none");
      //   window.setTimeout(() => {
      //     location.assign("/restaurants");
      //   }, 1500);

      //aa
      // showAlert("success", "Logged In Successfully!");
    }
    // console.log(res);
  } catch (err) {
    document.querySelector(".as").classList.add("anim");
    document.querySelector(".as").textContent = err.response.data.message;
    setTimeout(function () {
      document.querySelector(".as").classList.remove("anim");
    }, 3000);
    document.querySelector(".onebuta").classList.remove("d-none");
    document.querySelector(".twobuta").classList.add("d-none");
    document.querySelector(".noload").classList.remove("d-none");
    document.querySelector(".load").classList.add("d-none");
    console.log(err);
    // showAlert("error", err.response.data.message);
  }
};
