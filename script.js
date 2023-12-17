const uploadField = document.getElementById("upload");
const dropArea = document.getElementById("img-container");
const img = document.getElementById("target");
const body = document.getElementsByTagName("body")[0];

function handleFileSelect(evt) {
  let files = evt.target.files;

  handleFiles(files);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(e) {
  dropArea.classList.add("highlight");
}

function unhighlight(e) {
  dropArea.classList.remove("highlight");
}

function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;

  handleFiles(files);
}

function handleFiles(files) {
  if (files.length == 0) {
    return;
  }
  if (files.length != 1) {
    alert("Bitte nur ein Bild auswählen");
    return;
  }

  updateImage(files[0]);
}

function updateImage(f) {
  let reader = new FileReader();

  reader.onloadend = function () {
    img.src = reader.result;
    dropArea.classList.add("has-image");
  };

  reader.readAsDataURL(f);
}

function deletePersonalData() {
  [
    "name",
    "vorname",
    "geb",
    "str",
    "plz",
    "ort",
    "eintritt",
    "abgelegt",
    "kombi",
    "selbsterklaerung",
  ].forEach((item) => {
    document.getElementById(item).value = "";
  });
  ["pruefungen", "tauglichkeit"].forEach((name) => {
    const elements = document.getElementsByName(name);
    elements.forEach((item) => {
      item.checked = false;
    });
    img.src = "";
    dropArea.classList.remove("has-image");
  });
}

function deleteNonPersonalData() {
  ["lv", "bezirk", "gliederung", "wettkampfjahr"].forEach((item) => {
    document.getElementById(item).value = "";
  });
}

function prepareFileUpload() {
  uploadField.addEventListener("change", handleFileSelect, false);

  dropArea.addEventListener("click", () => {
    uploadField.click();
  });

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    body.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    body.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener("drop", handleDrop, false);

  const printButton = document.getElementById("printButton");
  const deleteButton = document.getElementById("deleteButton");
  const deletePersonalDataButton = document.getElementById(
    "deletePersonalDataButton"
  );

  printButton.addEventListener("click", () => {
    window.print();
  });

  deleteButton.addEventListener("click", () => {
    deleteNonPersonalData();
    deletePersonalData();
  });

  deletePersonalDataButton.addEventListener("click", () => {
    deletePersonalData();
  });
}

prepareFileUpload();
