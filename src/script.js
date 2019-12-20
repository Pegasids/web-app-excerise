// Canopus Tong
// Syntec Application Excerise
// 19 Dec 2019, Thursday

"use strict";

//initialize proxUrl (bypass CORS), targetUrl (Data API)
var proxyUrl = "https://cors-anywhere.herokuapp.com/",
  targetEmployeeURL = "https://emplistapi-258220.appspot.com/";

// state
var employeeData = [];
var sortOrder = "default";
var loadLength = 0;
var draggedElement = null;
var nextKey = 0;

const modal = document.getElementById("modal"),
  fname = document.getElementById("fname"),
  lname = document.getElementById("lname"),
  jobTitle = document.getElementById("jobTitle"),
  ppUrl = document.getElementById("ppUrl"),
  employeeList = document.getElementById("employeeList"),
  snackbar = document.getElementById("snackbar"),
  sortAcc = document.getElementById("sortAcc"),
  sortDec = document.getElementById("sortDec"),
  loadBtn = document.getElementById("loadBtn"),
  preload = document.getElementById("preload");

function Employee(keyy, first, last, job, url) {
  let key = keyy;
  let firstname = first;
  let lastname = last;
  let jobTitle = job;
  let photoURL = url;

  return {
    getKey: function() {
      return key;
    },
    getFirstName: function() {
      return firstname;
    },
    getLastName: function() {
      return lastname;
    },
    getJobTitle: function() {
      return jobTitle;
    },
    getPhotoURL: function() {
      return photoURL;
    }
  };
}

//async fuction to perform a GET HTTP request
// arg: url:string
// return: json
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("BAD HTTP Request: " + response.status);
    }
  } catch (err) {
    alert(err);
  }
}

//create a HTML li element of an employee
// arg: the employee object
// return: HTML element
function employeeCardBuilder(obj) {
  let photoURL = obj.getPhotoURL()
    ? obj.getPhotoURL()
    : "https://img.icons8.com/nolan/70/000000/user-male-circle.png";
  return `
    <li class="listitem" data-key="${obj.getKey()}" ondragover="dragOver(event)" ondrop="dragDrop(this)">
      <div class="card" draggable="true" ondragstart="dragStart(this)" ondragend="dragEnd(this)">
        <img src="${photoURL}" alt="Avator">
        <h5>${obj.getFirstName()} ${obj.getLastName()}</h5>
        <h6>${obj.getJobTitle()}</h6>
      </div>
    </li>
  `;
}

function openModal() {
  modal.className += " is-active";
}

function closeModal() {
  modal.classList.remove("is-active");
}

//create a new employee obj and add to DOM
// arg: event
// return: employee obj
function saveNewEmployee(e) {
  e.preventDefault();
  let photoURL = ppUrl.value === "" ? null : ppUrl.value;
  //create new employee obj
  let newEmployeeObj = new Employee(
    nextKey++,
    fname.value,
    lname.value,
    jobTitle.options[jobTitle.selectedIndex].value,
    photoURL
  );
  //store sort render
  employeeData.splice(loadLength, 0, newEmployeeObj);
  loadLength++;
  sortEmployeeData();
  renderEmployeeList();
  //show success message
  snackbar.className = "show";
  setTimeout(function() {
    snackbar.className = "";
  }, 3000);
  modal.classList.remove("is-active");
  //returns the new employee obj
  return newEmployeeObj;
}

//onAccend
function sortAccending() {
  if (sortOrder === "accending") {
    sortOrder = "default";
    sortAcc.style.color = "#363636";
    sortDec.style.color = "#363636";
  } else {
    sortOrder = "accending";
    sortAcc.style.color = "royalblue";
    sortDec.style.color = "#363636";
    sortEmployeeData();
    renderEmployeeList();
  }
}

//onDecend
function sortDecending() {
  if (sortOrder === "decending") {
    sortOrder = "default";
    sortDec.style.color = "#363636";
    sortAcc.style.color = "#363636";
  } else {
    sortOrder = "decending";
    sortDec.style.color = "royalblue";
    sortAcc.style.color = "#363636";
    sortEmployeeData();
    renderEmployeeList();
  }
}

//sort in accending, decending or default order
function sortEmployeeData() {
  switch (sortOrder) {
    default:
      break;
    case "accending":
      employeeData = employeeData
        .slice(0, loadLength)
        .sort((a, b) =>
          `${a.getFirstName()} ${a.getLastName()}` <
          `${b.getFirstName()} ${b.getLastName()}`
            ? -1
            : 1
        )
        .concat(employeeData.slice(loadLength));
      break;
    case "decending":
      employeeData = employeeData
        .slice(0, loadLength)
        .sort((a, b) =>
          `${a.getFirstName()} ${a.getLastName()}` >
          `${b.getFirstName()} ${b.getLastName()}`
            ? -1
            : 1
        )
        .concat(employeeData.slice(loadLength));
      break;
  }
}

//render employee data to DOM
function renderEmployeeList() {
  let out = "";
  employeeData.slice(0, loadLength).forEach(employee => {
    if (employee.getJobTitle()) {
      out += employeeCardBuilder(employee);
    }
  });
  employeeList.innerHTML = out;
}

//load 10 more cards
// arg: DOMElement
function loadMore(domEle) {
  loadLength += 10;
  if (loadLength >= employeeData.length) {
    domEle.style.pointerEvents = "none";
    domEle.style.opacity = 0;
  }
  sortEmployeeData();
  renderEmployeeList();
}

//drag related functions
function dragStart(domEle) {
  draggedElement = domEle;
  setTimeout(() => (domEle.style.visibility = "hidden"), 0);
}
function dragEnd(domEle) {
  domEle.style.visibility = "visible";
}
function dragOver(e) {
  e.preventDefault();
}
function dragDrop(domEle) {
  sortOrder = "default"; //disable sorting
  sortDec.style.color = "#363636";
  sortAcc.style.color = "#363636";
  swapDOMElements(domEle, draggedElement.parentNode); //swap dom elements
  let keyA = domEle.getAttribute("data-key"),
    keyB = draggedElement.parentNode.getAttribute("data-key");
  swapEmployeeData(keyA, keyB); //swap data
}

//swap two employee objs in data given data-keys
// args: string, string
function swapEmployeeData(keyA, keyB) {
  let tempArray = employeeData.map(e => e.getKey().toString());
  let indexA = tempArray.indexOf(keyA),
    indexB = tempArray.indexOf(keyB);
  var temp = employeeData[indexB];
  employeeData[indexB] = employeeData[indexA];
  employeeData[indexA] = temp;
}

//swap two child DOM elements of the same parent
// args: DOMElement, DOMElement
function swapDOMElements(domEle1, domEle2) {
  var parent2 = domEle2.parentNode;
  var next2 = domEle2.nextSibling;
  if (next2 === domEle1) {
    parent2.insertBefore(domEle1, domEle2);
  } else {
    domEle1.parentNode.insertBefore(domEle2, domEle1);
    if (next2) {
      parent2.insertBefore(domEle1, next2);
    } else {
      parent2.appendChild(domEle1);
    }
  }
}

fetchData(proxyUrl + targetEmployeeURL).then(data => {
  if (data) {
    data.forEach(e => {
      employeeData.push(
        new Employee(
          nextKey++,
          e.name.first,
          e.name.last,
          e.jobTitle,
          e.photoURL
        )
      );
    });
  }
  loadLength = Math.min(employeeData.length, 10);
  if (loadLength < employeeData.length) {
    loadBtn.style.pointerEvents = "auto";
    loadBtn.style.opacity = 1;
  }
  sortEmployeeData();
  renderEmployeeList();
  //preloader stuff
  preload.style.height = "0px";
  preload.style.opacity = 0;
});
