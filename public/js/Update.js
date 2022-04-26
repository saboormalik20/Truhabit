// SHOW ERROR MESSAGE
function showEmptyError(elem, error, method) {
  if (method === "POST") {
    if (error.includes("Photo")) {
      console.log("wywy");
      if (elem === undefined) {
        document.querySelector(".as").classList.add("anim");
        document.querySelector(".as").textContent = `${error}`;
        setTimeout(() => {
          document.querySelector(".as").classList.remove("anim");
        }, 2000);
        return "Stop";
      }
      return "Continue";
    } else if (elem.length < 1) {
      document.querySelector(".as").classList.add("anim");
      document.querySelector(".as").textContent = `${error}`;
      setTimeout(() => {
        document.querySelector(".as").classList.remove("anim");
      }, 2000);
      return "Stop";
    }
    return "Continue";
  } else {
    if (error.includes("Photo")) {
      return "Continue";
    } else if (elem.length < 1) {
      document.querySelector(".as").classList.add("anim");
      document.querySelector(".as").textContent = `${error}`;
      setTimeout(() => {
        document.querySelector(".as").classList.remove("anim");
      }, 2000);
      return "Stop";
    }
    return "Continue";
  }
}
// SHOW ERROR END

export const UpdatedDocument = async (
  jwt,
  alldata,
  method,
  url,
  onloadshowbutton,
  onloadhidebutton,
  onloaddivclass,
  onloadunderclass,
  finalMessage,
  finalDestination,
  modaltohide
) => {
  if (method !== "DELETE") {
    let data = new FormData();
    let flow = [];
    alldata.map((item) => {
      if (flow.includes("Stop")) {
      } else {
        flow.push(showEmptyError(item.elem, item.error, method));
      }
    });
    if (flow.includes("Stop")) {
    } else {
      alldata.map((item) => {
        if (item.elem === undefined) {
        } else {
          data.append(item.apiBodyName, item.elem);
        }
      });
      // MOVE BUTTON LOADER START
      document.querySelector(onloadhidebutton).classList.add("d-none");
      document.querySelector(onloadshowbutton).classList.remove("d-none");
      document.querySelector(onloaddivclass).classList.add("d-none");
      document.querySelector(onloadunderclass).classList.remove("d-none");
      // MOVE BUTTON LOADER END

      const res = await axios({
        method,
        url,
        data,
        headers: {
          jwt,
        },
      });
      console.log(res);
      document.querySelector(".as").classList.add("anim");
      document.querySelector(".as").textContent = finalMessage;
      setTimeout(() => {
        document.querySelector(".as").classList.remove("anim");
      }, 2000);
      document.querySelector(onloadhidebutton).classList.remove("d-none");
      document.querySelector(onloadshowbutton).classList.add("d-none");
      document.querySelector(onloaddivclass).classList.remove("d-none");
      document.querySelector(onloadunderclass).classList.add("d-none");
      location.reload();
    }
  } else {
    // IF METHOD IS DELETE

    // MOVE BUTTON LOADER START
    document.querySelector(onloadhidebutton).classList.add("d-none");
    document.querySelector(onloadshowbutton).classList.remove("d-none");
    document.querySelector(onloaddivclass).classList.add("d-none");
    document.querySelector(onloadunderclass).classList.remove("d-none");
    // MOVE BUTTON LOADER END

    const res = await axios({
      method,
      url,
      headers: {
        jwt,
      },
    });
    document.querySelector(".as").classList.add("anim");
    document.querySelector(".as").textContent = finalMessage;
    setTimeout(() => {
      document.querySelector(".as").classList.remove("anim");
    }, 2000);
    document.querySelector(onloadhidebutton).classList.remove("d-none");
    document.querySelector(onloadshowbutton).classList.add("d-none");
    document.querySelector(onloaddivclass).classList.remove("d-none");
    document.querySelector(onloadunderclass).classList.add("d-none");
    $(modaltohide).modal("show");
    if (finalDestination) {
      location.assign(finalDestination);
    } else {
      location.reload();
    }
  }
};
