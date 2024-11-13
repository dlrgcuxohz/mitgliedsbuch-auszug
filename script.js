const uploadField = document.getElementById("upload");
const dropArea = document.getElementById("img-container");
const img = document.getElementById("target");
const body = document.getElementsByTagName("body")[0];
const urlOutput = document.getElementById('url');

const fields = [
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
  "lv", 
  "bezirk", 
  "gliederung", 
  "wettkampfjahr",
  "pruefungen",
  "tauglichkeit",
];

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
    "name-copy",
    "vorname-copy",
    "geb-copy",
  ].forEach((item) => {
    document.getElementById(item).value = "";
    values[item] = "";
  });
  ["pruefungen", "tauglichkeit"].forEach((name) => {
    const elements = document.getElementsByName(name);
    elements.forEach((item) => {
      item.checked = false;
    });
    values[name] = "";
  });
  img.src = "";
  dropArea.classList.remove("has-image");
  dumpValues();
}

function deleteNonPersonalData() {
  ["lv", "bezirk", "gliederung", "wettkampfjahr", "gliederung-copy"].forEach((item) => {
    document.getElementById(item).value = "";
    values[item] = "";
  });
  dumpValues();
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

function prepareCopyPersonalData() {
  ["name", "vorname", "geb", "gliederung"].forEach((item) => {
    const element = document.getElementById(item);
    element.addEventListener("input", () => {
      document.getElementById(`${item}-copy`).value = element.value;
    });
  });
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    document.body.removeChild(textArea);
    throw err;
  }

  document.body.removeChild(textArea);
}

async function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
    await navigator.clipboard.writeText(text)
}

function parseUrl(str) {
  const url = new URL(str);
  const hash = url.hash;
  const vals = hash.split('#')[1].split('&').map(e => e.split('=')).reduce((acc, cur) => {
    if (!fields.includes(cur[0])) { return acc; }
    acc[cur[0]] = decodeURIComponent(cur[1]);
    return acc;
  }, {});
  values = vals;

  Object.keys(values).forEach(cur => {
    const el = document.getElementById(cur);
    const elCopy = document.getElementById(`${cur}-copy`);
    if (el) {
      if (el.type === "radio") {
        el.checked = values[cur] === "on";
      } else {
        el.value = values[cur];
        if (elCopy) {
          elCopy.value = values[cur];
        }
      }
      return;
    }
    const els = document.getElementsByName(cur);
    els.forEach(el => {
      if (el.type === "radio" && el.id == values[cur]) {
        el.checked = true;
      } else if (el.type === "radio") {
        el.checked = false;
      }
    });
  });
  dumpValues();
}

let values = {};

function dumpValues() {
  const components = Object.keys(values).reduce((acc, cur) => values[cur].trim() !== "" ? `${acc}&${cur}=${encodeURIComponent(values[cur].trim())}` : acc, '').replace(/^&/g, '');
  const url = new URL(window.location.href);
  url.hash = `#${components}`;
  urlOutput.value = url;
  if (url.href !== window.location.href) {
    window.location.href = url;
  }
}

function prepareUrlSupport() {
  urlOutput.addEventListener("focus", () => {
    urlOutput.select();
  });

  const inputs = [...document.getElementsByTagName("input"), ...document.getElementsByTagName("select")];
  inputs.forEach(input => {
    if (input.id == 'url') {
      return;
    }
    input.addEventListener("change", e => {
      if (input.type === "radio") {
        values[input.name] = input.id;
      }  else {
        values[input.id] = e.target.value;
      }
      dumpValues();
    })
  })

  const copyButton = document.getElementById('copy-button');
  copyButton.addEventListener("click", async e => {
    e.preventDefault();
    try {
      await copyTextToClipboard(urlOutput.value);
      copyButton.classList.add("copied");
      window.setTimeout(() => copyButton.classList.remove("copied"), 10000);
    } catch (err) {
      console.error('Could not copy text: ', err);
    }
  });

  window.addEventListener("hashchange", event => {
    const url = event.newURL;
    parseUrl(url);
  });

  parseUrl(window.location.href);
}

prepareFileUpload();
prepareCopyPersonalData();
prepareUrlSupport();
