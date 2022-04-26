import { UpdatedDocument } from "./Update.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKNuQhNDM9MmMalMQWU1E3uDSI4F-9XiI",
  authDomain: "rebalance-a57a1.firebaseapp.com",
  projectId: "rebalance-a57a1",
  storageBucket: "rebalance-a57a1.appspot.com",
  messagingSenderId: "317724135093",
  appId: "1:317724135093:web:530bea880b3fb555cd78fc",
  measurementId: "G-3EY13ERFN6",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

$(".openstoreinit").on("click", async function () {
  const res = await axios({
    method: "GET",
    url: `http://localhost:3000/api/v1/admin/getAllCountries`,
    headers: {
      jwt: localStorage.getItem("jwt"),
    },
  });
  let allFinals = [];
  res.data.data.map((item) => {
    allFinals.push(
      `<option data-id=${item._id} value=${item.name}>${item.name}</option>`
    );
  });
  $(".inputCountrypopo").html("");
  $(".inputCountrypopo").html(allFinals.join(""));

  const ress = await axios({
    method: "GET",
    url: `http://localhost:3000/api/v1/users/getAllRegionss/${res.data.data[0]._id}`,
    headers: {
      jwt: localStorage.getItem("jwt"),
    },
  });
  let allFinalss = [];
  ress.data.data.map((item) => {
    allFinalss.push(
      `<option data-id=${item._id} value=${item.name}>${item.name}</option>`
    );
  });
  $(".inputRegionpopo").html("");
  $(".inputRegionpopo").html(allFinalss.join(""));

  $("#AddmyEdosModal").modal("show");
});
$(".inputCountrypo").on("change", async function () {
  let country = $("option:selected", this).attr("data-id");
  const res = await axios({
    method: "GET",
    url: `http://localhost:3000/api/v1/users/getAllRegionss/${country}`,
    headers: {
      jwt: localStorage.getItem("jwt"),
    },
  });
  let finalsofregions = [];
  res.data.data.map((item) => {
    finalsofregions.push(
      `<option data-id=${item._id} value=${item.name}>${item.name}</option>`
    );
  });
  $(".inputRegionpo").html("");
  $(".inputRegionpo").html(finalsofregions.join(""));
});

$(".inputCountrypopo").on("change", async function () {
  let country = $("option:selected", this).attr("data-id");
  const res = await axios({
    method: "GET",
    url: `http://localhost:3000/api/v1/users/getAllRegionss/${country}`,
    headers: {
      jwt: localStorage.getItem("jwt"),
    },
  });
  let finalsofregions = [];
  res.data.data.map((item) => {
    finalsofregions.push(
      `<option data-id=${item._id} value=${item.name}>${item.name}</option>`
    );
  });
  $(".inputRegionpopo").html("");
  $(".inputRegionpopo").html(finalsofregions.join(""));
});
$(".tblEdosBtnpopa").on("click", async function () {
  $(".whattoupd").attr("data-id", $(this).attr("data-edi"));
  const res = await axios({
    method: "GET",
    url: `http://localhost:3000/api/v1/admin/getStorebyid/${$(this).attr(
      "data-edi"
    )}`,
    headers: {
      jwt: localStorage.getItem("jwt"),
    },
  });
  const ress = await axios({
    method: "GET",
    url: `http://localhost:3000/api/v1/admin/getAllCountries`,
    headers: {
      jwt: localStorage.getItem("jwt"),
    },
  });
  console.log(ress.data.data);
  let firstcountry = [];
  let endcountry = [];
  ress.data.data.filter((item) => {
    if (String(item.id) === String(res.data.data.country)) {
      firstcountry.push(
        `<option value=${item.name} data-id=${item._id}>${item.name}</option>`
      );
    } else {
      endcountry.push(
        `<option value=${item.name} data-id=${item._id}>${item.name}</option>`
      );
    }
  });
  const resss = await axios({
    method: "GET",
    url: `http://localhost:3000/api/v1/admin/getregions`,
    headers: {
      jwt: localStorage.getItem("jwt"),
    },
  });
  console.log(resss.data.data);
  let firstregion = [];
  let endregion = [];
  resss.data.data.filter((item) => {
    if (String(item.id) === String(res.data.data.region)) {
      firstregion.push(
        `<option value=${item.name} data-id=${item._id}>${item.name}</option>`
      );
    } else {
      endregion.push(
        `<option value=${item.name} data-id=${item._id}>${item.name}</option>`
      );
    }
  });
  $(".edasdtorename").val(res.data.data.name);
  $(".edasdtoreemail").val(res.data.data.email);
  $(".edasdtorephone").val(res.data.data.phone);
  $(".edasdtoreaddress").val(res.data.data.address);
  $(".inputCountrypo").html("");
  $(".inputCountrypo").html(firstcountry.concat(endcountry).join(""));
  $(".inputRegionpo").html("");
  $(".inputRegionpo").html(firstregion.concat(endregion).join(""));
  $("#myEdosModal").modal("show");
});
$(".userstoreupdsopchopi").on("click", async function () {
  console.log($(".inputCountrypo option:selected").attr("data-id"));
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [
      //ALL DATA
      {
        elem: $(".edassdtorename").val(),
        error: "Please Enter Store Name",
        apiBodyName: "name",
      },
      {
        elem: $(".edassdtoreemail").val(),
        error: "Please Enter Store Email",
        apiBodyName: "email",
      },
      {
        elem: $(".edassdtorephone").val(),
        error: "Please Enter Store Phone",
        apiBodyName: "phone",
      },
      {
        elem: $(".edassdtoreaddress").val(),
        error: "Please Enter Store Address",
        apiBodyName: "address",
      },
      {
        elem: $(".inputCountrypopo option:selected").attr("data-id")
          ? $(".inputCountrypopo option:selected").attr("data-id")
          : "",
        error: "Please Select Country",
        apiBodyName: "country",
      },
      {
        elem: $(".inputRegionpopo option:selected").attr("data-id")
          ? $(".inputRegionpopo option:selected").attr("data-id")
          : "",
        error: "Please Select Region",
        apiBodyName: "region",
      },
    ],
    "POST", //API Method
    `http://localhost:3000/api/v1/admin/addStore`, // API URL
    ".twobutapopapa", //BUTTON TO SHOW
    ".onebutapopapa", //BUTTON TO HIDE
    ".noloadpopapa", //BUTTON Main Div
    ".loadpopapa", //BUTTON Under Div
    `Store Added Successfully` //FINAL MESSAGE
  );
});
$(".tblActnBtnlala").on("click", function () {
  $(".storedels").attr("data-id", $(this).attr("data-del"));
  $("#myDelModal").modal("show");
});
$(".storedels").on("click", function () {
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [],
    "DELETE", //API Method
    `http://localhost:3000/api/v1/admin/deleteStorebyid/${$(this).attr(
      "data-id"
    )}`, // API URL
    ".twobutapoa", //BUTTON TO SHOW
    ".onebutapoa", //BUTTON TO HIDE
    ".noloadpoa", //BUTTON Main Div
    ".loadpoa", //BUTTON Under Div
    `Store Deleted Successfully` //FINAL MESSAGE
  );
});
$(".kalak").click(function () {
  if (!$(".kalak").attr("ok")) {
    $("#multiple > option").prop("selected", "selected");
    $("#multiple").trigger("change");
    $(".kalak").attr("ok", "ok");
    $(".kalak").html("Unselect All");
  } else {
    $("#multiple > option").prop("selected", "");
    $("#multiple").trigger("change");
    $(".kalak").removeAttr("ok");
    $(".kalak").html("Select All");
  }
});
$(".okfinish").on("click", async function () {
  // Get a list of cities from your database
  async function getCities() {
    const citiesCol = collection(db, "fcmKey");
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map((doc) => {
      return { id: doc.id, data: doc.data() };
    });
    return cityList;
  }
  let hja = await getCities();

  // let res = await setDoc(doc(db, "cities", "LA"), {
  //   name: "Los Angeles",
  //   state: "CA",
  //   country: "USA",
  // });

  console.log(hja);

  console.log(
    $(".alltext").val(),
    $(".allareas").val(),
    $("#multiple").select2("val")
  );

  let data = new FormData();
  if ($(".alltext").val().length < 1) {
    document.querySelector(".as").classList.add("anim");
    document.querySelector(".as").textContent = "Please Add Title";
    setTimeout(function () {
      document.querySelector(".as").classList.remove("anim");
    }, 3000);
  }
  if ($(".allareas").val().length < 1) {
    document.querySelector(".as").classList.add("anim");
    document.querySelector(".as").textContent = "Please Add message";
    setTimeout(() => {
      document.querySelector(".as").classList.remove("anim");
    }, 3000);
  }
  if ($("#multiple").select2("val").length < 1) {
    document.querySelector(".as").classList.add("anim");
    document.querySelector(".as").textContent = "Please Select User";
    setTimeout(() => {
      document.querySelector(".as").classList.remove("anim");
    }, 3000);
  }
  if (
    $(".alltext").val().length >= 1 &&
    $(".allareas").val().length >= 1 &&
    $("#multiple").select2("val").length >= 1
  ) {
    let finalToPush = [];
    $("#multiple")
      .select2("val")
      .filter((item) => {
        hja.filter((item2) => {
          if (String(item) === String(item2.id)) {
            finalToPush.push(item2);
          }
        });
      });

    console.log(finalToPush);
    let promisesofpushnotifications = [];
    finalToPush.map((item) => {
      let data = {
        to: item.data.fcm,
        notification: {
          body: $(".allareas").val(),
          title: $(".alltext").val(),
          vibrate: 1,
          sound: 1,
          largeIcon: "large_icon",
          smallIcon: "small_icon",
        },
      };
      promisesofpushnotifications.push(
        axios({
          method: "POST",
          url: "https://fcm.googleapis.com/fcm/send",
          data,
          headers: {
            Authorization: `key=AAAASfnVjrU:APA91bEccJQG_9deXc8y7A1bNuS_YusJe-_NFAC5E4zCrGrE6ktJmI1n4Oa3B0ClfMXm1SDONP_s4CoS5pNOH2B--oOkestxNrqpGRaJEyWrsusJVqO4E3NVPj3Yv0Ai-YpsWKX_avMk`,
          },
        })
      );
    });
    data.append("title", $(".alltext").val());
    data.append("message", $(".allareas").val());
    data.append("users", JSON.stringify($("#multiple").select2("val")));
    console.log(data.get("users"));
    console.log(promisesofpushnotifications);
    await Promise.all(promisesofpushnotifications);
    const res = await axios({
      method: "POST",
      url: `http://localhost:3000/api/v1/admin/sendNotifications`,
      data,
      headers: {
        jwt: localStorage.getItem("jwt"),
      },
    });
    console.log(res);
  }
});
$("#multiple").select2({
  placeholder: "Select a category",
  allowClear: true,
});
$(".userstoreupds").on("click", async function () {
  console.log($(".inputCountrypo option:selected").attr("data-id"));
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [
      //ALL DATA
      {
        elem: $(".edasdtorename").val(),
        error: "Please Enter Store Name",
        apiBodyName: "name",
      },
      {
        elem: $(".edasdtoreemail").val(),
        error: "Please Enter Store Email",
        apiBodyName: "email",
      },
      {
        elem: $(".edasdtorephone").val(),
        error: "Please Enter Store Phone",
        apiBodyName: "phone",
      },
      {
        elem: $(".edasdtoreaddress").val(),
        error: "Please Enter Store Address",
        apiBodyName: "address",
      },
      {
        elem: $(".inputCountrypo option:selected").attr("data-id")
          ? $(".inputCountrypo option:selected").attr("data-id")
          : "",
        error: "Please Select Country",
        apiBodyName: "country",
      },
      {
        elem: $(".inputRegionpo option:selected").attr("data-id")
          ? $(".inputRegionpo option:selected").attr("data-id")
          : "",
        error: "Please Select Region",
        apiBodyName: "region",
      },
    ],
    "PATCH", //API Method
    `http://localhost:3000/api/v1/admin/updateStorebyid/${$(this).attr(
      "data-id"
    )}`, // API URL
    ".twobutapopa", //BUTTON TO SHOW
    ".onebutapopa", //BUTTON TO HIDE
    ".noloadpopa", //BUTTON Main Div
    ".loadpopa", //BUTTON Under Div
    `Store Edited Successfully` //FINAL MESSAGE
  );
});
$(".tblEdosBtn").on("click", async function () {
  let countries = ["USA", "UK", "SOUTH AFRICA"];

  document.querySelector(".as").classList.add("anim");
  document.querySelector(".as").textContent = "Loading";
  $(".whattoupd").attr("whattoupd", $(this).attr("data-edi"));
  let cud = localStorage.getItem("jwt");
  console.log($(this).attr("data-edi"));
  const res = await axios({
    method: "GET",
    url: `https://rebalance.dejuretechnologies.com/api/v1/admin/getUser/${$(
      this
    ).attr("data-edi")}`,
    headers: {
      jwt: cud,
    },
  });

  document.querySelector(".as").classList.remove("anim");
  console.log(res.data.data);
  $(".edasname").val(res.data.data.name);
  $(".edasemail").val(res.data.data.email);
  $(".edaspoints").val(res.data.data.points);
  let finalOptions = [];
  if (res.data.data.country) {
    countries.map((item, index) => {
      console.log(index);
      if (index === 0) {
        finalOptions.push(
          `<option value=${res.data.data.country}>${res.data.data.country}</option>`
        );
      }

      if (item !== res.data.data.country) {
        finalOptions.push(`<option value=${String(item)}>${item}</option>`);
      }
    });
  } else {
    countries.map((item) => {
      finalOptions.push(`<option value=${item}>${item}</option>`);
    });
  }
  $(".inputCountry").html(`${finalOptions.join("").toString()}`);
  $("#myEdosModal").modal("show");
});
let a = 1;

$(".uploadexcel").on("click", async function () {
  let data = new FormData();
  data.append("sheet", document.querySelector("#excelupload").files[0]);

  let res = await axios.post(
    "http://localhost:3000/api/v1/admin/addExcelsheet",
    data
  );

  let n = res.data.data.length / 10;
  console.log(`aajjajajaj   ${n}`);
  const result = new Array(Math.ceil(res.data.data.length / Math.ceil(n)))
    .fill()
    .map((_) => res.data.data.splice(0, Math.ceil(n)))
    .map((item) => {
      item = item.map((item2) => {
        return `https://rebalance.dejuretechnologies.com/api/v1/admin/addPointToDB/${item2.prefix}/${item2.code}`;
      });
      return item;
    });
  console.log(result);
  $(".progresss").css("display", "flex");
  $(".progress-bar").css("width", `0%`);
  $(".progress-bar").html(`0%`);
  let a = 10;
  for (item of result) {
    const abc = await axios.all(item.map((endpoint) => axios.get(endpoint)));
    $(".progresss").css("display", "flex");
    $(".progress-bar").css("width", `${a}%`);
    $(".progress-bar").html(`${a}%`);
    console.log(abc);
    a += 10;
  }
});
$(document).on("click", ".ProductView", function () {
  location.assign(`/productDetails/${$(this).attr("data-id")}`);
});
$(".tblActnBtn").on("click", function () {
  //   console.log($(this).attr("data-del"));
  $(".userdels").attr("whattodel", $(this).attr("data-del"));
  $("#myDelModal").modal("show");
});

// UPDATE FUNCTION

//Update User Modal Start

$(".regionupds").on("click", async function () {
  // if(country=== un)
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [
      //ALL DATA
      {
        elem: $(".edasponame").val(),
        error: "Please Enter Region Name",
        apiBodyName: "name",
      },
      {
        elem: $(".intosthat option:selected").attr("data-id")
          ? $(".intosthat option:selected").attr("data-id")
          : "",
        error: "Please Select Country",
        apiBodyName: "country",
      },
    ],
    "POST", //API Method
    `https://rebalance.dejuretechnologies.com/api/v1/admin/addRegion`, // API URL
    ".twopbutap", //BUTTON TO SHOW
    ".onepbutap", //BUTTON TO HIDE
    ".noloadpp", //BUTTON Main Div
    ".loadpp", //BUTTON Under Div
    `Region Added Successfully` //FINAL MESSAGE
  );
});
$(".countryupds").on("click", async function () {
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [
      //ALL DATA
      {
        elem: $(".edasname").val(),
        error: "Please Enter Country Name",
        apiBodyName: "name",
      },
    ],
    "POST", //API Method
    `https://rebalance.dejuretechnologies.com/api/v1/admin/addCountry`, // API URL
    ".twobutap", //BUTTON TO SHOW
    ".onebutap", //BUTTON TO HIDE
    ".noloadp", //BUTTON Main Div
    ".loadp", //BUTTON Under Div
    `Country Added Successfully` //FINAL MESSAGE
  );
});

$(".userupds").on("click", async function () {
  document.querySelector(".onebutap").classList.add("d-none");
  document.querySelector(".twobutap").classList.remove("d-none");
  document.querySelector(".noloadp").classList.add("d-none");
  document.querySelector(".loadp").classList.remove("d-none");
  let countries = ["USA", "UK", "SOUTH AFRICA"];

  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [
      //ALL DATA
      {
        elem: $(".edasname").val(),
        error: "Please enter Password",
        apiBodyName: "name",
      },
      {
        elem: $(".edaspassword").val(),
        error: "Please enter Password",
        apiBodyName: "password",
      },
      {
        elem: $(".edaspoints").val(),
        error: "Please Enter points",
        apiBodyName: "points",
      },
      {
        elem: countries.filter((item) => {
          if (item.startsWith($(".inputCountry option:selected").val())) {
            return true;
          }
          return false;
        }),
        error: "Please select country",
        apiBodyName: "country",
      },
    ],
    "PATCH", //API Method
    `https://rebalance.dejuretechnologies.com/api/v1/admin/updateUser/${$(
      this
    ).attr("whattoupd")}`, // API URL
    ".twobutap", //BUTTON TO SHOW
    ".onebutap", //BUTTON TO HIDE
    ".noloadp", //BUTTON Main Div
    ".loadp", //BUTTON Under Div
    `User Updated` //FINAL MESSAGE
  );
});
//Update User Modal End

//Update Product  Modal Start
$(".userupdsss").on("click", async function () {
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [
      //ALL DATA
      {
        elem: $(".edasname").val(),
        error: "Please enter name",
        apiBodyName: "name",
      },
      {
        elem: $(".edasdesc").val(),
        error: "Please enter Description",
        apiBodyName: "description",
      },
      {
        elem: $(".edaspoints").val(),
        error: "Please Enter points",
        apiBodyName: "points",
      },
      {
        elem: document.querySelector(".edupimage").files[0],
        error: "Please Upload Photo",
        apiBodyName: "photo",
      },
    ],
    "PATCH", //API Method
    `https://rebalance.dejuretechnologies.com/api/v1/admin/updateProductById/${$(
      this
    ).attr("data-id")}`, // API URL
    ".twobutap", //BUTTON TO SHOW
    ".onebutap", //BUTTON TO HIDE
    ".noloadp", //BUTTON Main Div
    ".loadp", //BUTTON Under Div
    `Product Updated` //FINAL MESSAGE
  );
});
//Update Product  Modal End

// Update Function End
// Get Sigle Data And show toModal
async function singleDataShowToModal(
  jwt,
  url,
  method,
  inputs,
  modalname,
  button,
  type,
  selectinto
) {
  if (type === "select") {
    document.querySelector(".as").classList.add("anim");
    document.querySelector(".as").textContent = "Loading...";

    const res = await axios({
      method,
      url,
      headers: {
        jwt,
      },
    });
    $(selectinto).html("");
    let options = [];
    options.push(`<option value="nocountry">Select Country</option>`);
    res.data.data.map((item) => {
      options.push(
        `<option value=${item.name} data-id=${item._id}>${item.name}</option>`
      );
    });
    $(selectinto).html(options.join(""));
    document.querySelector(".as").classList.remove("anim");

    $(modalname).modal("show");
  } else {
    document.querySelector(".as").classList.add("anim");
    document.querySelector(".as").textContent = "Loading...";
    const res = await axios({
      method,
      url,
      headers: {
        jwt,
      },
    });
    console.log(res);
    inputs.map((item) => {
      $(item.inputfield).val(`${res.data.product[item.valuetoshow]}`);
    });
    $(button).attr("data-id", res.data.product._id);
    document.querySelector(".as").classList.remove("anim");
    $(modalname).modal("show");
  }
}
$(".addprodu").on("click", async function () {
  $("#AdisModal").modal("show");
});
$(".edasaduonebutap").on("click", async function () {
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [
      //ALL DATA
      {
        elem: document.querySelector(".edasaduimage").files[0],
        error: "Please Upload Photo",
        apiBodyName: "photo",
      },
      {
        elem: $(".edasaduname").val(),
        error: "Please enter name",
        apiBodyName: "name",
      },
      {
        elem: $(".edasadudesc").val(),
        error: "Please enter Description",
        apiBodyName: "description",
      },
      {
        elem: $(".edasadupoints").val(),
        error: "Please Enter points",
        apiBodyName: "points",
      },
    ],
    "POST", //API Method
    `https://rebalance.dejuretechnologies.com/api/v1/admin/product`, // API URL
    ".twobutapop", //BUTTON TO SHOW
    ".edasaduonebutap", //BUTTON TO HIDE
    ".noloadpop", //BUTTON Main Div
    ".loadpop", //BUTTON Under Div
    `Product Uploaded` //FINAL MESSAGE
  );
});

$(".opendulopa").on("click", async function () {
  $(".onebutapDelas").attr("data-id", $(this).attr("data-id"));
  $("#mydulasModal").modal("show");
});
$(".onebutapDelas").on("click", async function () {
  UpdatedDocument(
    localStorage.getItem("jwt"), //JWT Token ADMIN
    [],
    "DELETE", //API Method
    `https://rebalance.dejuretechnologies.com/api/v1/admin/deleteProductById/${$(
      this
    ).attr("data-id")}`, // API URL
    ".twobutapdelopa", //BUTTON TO SHOW
    ".onebutapDelas", //BUTTON TO HIDE
    ".noloadpdelopa", //BUTTON Main Div
    ".loadpdelopa", //BUTTON Under Div
    `Product Deleted`, //FINAL MESSAGE
    `/products`, //FINAL ASSIGN AFTER DELETE SUCCESSFUL  (ONLY FOR DELETE)
    `#mydulasModal` // MODAL TO CLOSE AFTER DELETE ( ONLY FOR DELETE)
  );
});
$(".addcountryModal").on("click", function () {
  $("#myCountryModal").modal("show");
});
$(".addregionbtn").on("click", async function () {
  singleDataShowToModal(
    localStorage.getItem("jwt"),
    `http://localhost:3000/api/v1/admin/getAllCountries`,
    "GET",
    [],
    "#myRegionModal",
    "",
    "select",
    ".intosthat"
  );
});

$(".openedit").on("click", async function () {
  singleDataShowToModal(
    localStorage.getItem("jwt"),
    `https://rebalance.dejuretechnologies.com/api/v1/admin/getProductById/${$(
      this
    ).attr("data-id")}`,
    "GET",
    [
      { inputfield: ".edasname", valuetoshow: "name" },
      { inputfield: ".edasdesc", valuetoshow: "description" },
      { inputfield: ".edaspoints", valuetoshow: "points" },
    ],
    "#myEdosModal",
    ".userupdsss"
  );
});
// Get Sigle Data And show toModal

$(".userdels").on("click", async function () {
  let cud = localStorage.getItem("jwt");
  document.querySelector(".onebuta").classList.add("d-none");
  document.querySelector(".twobuta").classList.remove("d-none");
  document.querySelector(".noload").classList.add("d-none");
  document.querySelector(".load").classList.remove("d-none");
  const res = await axios({
    method: "DELETE",
    url: `https://rebalance.dejuretechnologies.com/api/v1/admin/delUser/${$(
      this
    ).attr("whattodel")}`,
    headers: {
      jwt: cud,
    },
  });
  console.log(res);
  document.querySelector(".onebuta").classList.remove("d-none");
  document.querySelector(".twobuta").classList.add("d-none");
  document.querySelector(".noload").classList.remove("d-none");
  document.querySelector(".load").classList.add("d-none");
  document.querySelector(".as").classList.add("anim");
  document.querySelector(".as").textContent = "You have deleted this user";
  setTimeout(function () {
    document.querySelector(".as").classList.remove("anim");
  }, 3000);
  $("#myDelModal").modal("hide");
  location.reload();
});
