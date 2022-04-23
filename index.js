const projectNameInput = document.getElementById("project-name-input");
const estTimeInput = document.getElementById("project-time-input");
const worksWrapper = document.getElementById("works-wrapper");

document
  .getElementById("project-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    add();
  });

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};

function onPageLoad() {
  saveSortByDate();
  const projectList = JSON.parse(localStorage.getItem("projectList"));
  if (projectList != null) {
    worksWrapper.innerHTML = "";
    for (let proj of projectList) {
      addProjectLine(proj);
      changeAberrant(proj);
      changePayed(proj);
    }
    showLabels();
  }
}

function Project() {
  Project.id = JSON.parse(localStorage.getItem("indexing"));
  this.name = projectNameInput.value;
  this.estTime = estTimeInput.value;
  if (Project.id === undefined) {
    Project.id = 1;
  } else {
    ++Project.id;
  }
  this.id = Project.id;
  this.dateCreated = new Date().toISOString();
  this.counters = [];
  this.isPayed = false;
  this.aberrant = { is: false, timer: 0 };
}

function add() {
  const project = new Project();
  addToLocalStorage(project);
  addProjectLine(project);
  showLabels();
  startTimer(project.id);
  formReset();
}

function addToLocalStorage(project) {
  let projectList = localStorage.getItem("projectList");
  if (projectList === null) {
    projectList = [];
    projectList.push(project);
  } else {
    projectList = JSON.parse(projectList);
    projectList.push(project);
  }
  localStorage.setItem("projectList", JSON.stringify(projectList));
  localStorage.setItem("indexing", JSON.stringify(project.id));
}

function startTimer(id) {
  const index = getId(id);
  const timer = {
    timerStart: new Date().getTime(),
    timerEnd: new Date().getTime(),
    intervalId: setInterval(() => intervalFunction(index, timer), 1000),
  };
  document.getElementById(`pause-${index}`).addEventListener(
    "click",
    function () {
      stopTimer(id, timer);
    },
    { once: true }
  );
  const playBtn = document.getElementById(`play-${index}`);
  const pauseBtn = document.getElementById(`pause-${index}`);
  playBtn.classList.add("hide");
  pauseBtn.classList.remove("hide");
}

function intervalFunction(index, timer) {
  timer.timerEnd = new Date().getTime();
  timer.timerCalc = Math.floor((timer.timerEnd - timer.timerStart) / 1000);
  document.getElementById(`timer-${index}`).innerText = timer.timerCalc
    .toString()
    .toHHMMSS();
  compareEstToTotal(index, timer.timerCalc);
}

function stopTimer(id, timer) {
  clearInterval(timer.intervalId);
  if (timer.timerCalc === undefined) {
    timer.timerCalc = 0;
  }
  const index = getId(id);
  const thisProject = getThisProject(id);
  const localList = getAllWithoutThisProject(id);
  thisProject.counters.push(timer);
  localList.push(thisProject);
  localStorage.setItem("projectList", JSON.stringify(localList));
  const playBtn = document.getElementById(`play-${index}`);
  const pauseBtn = document.getElementById(`pause-${index}`);
  playBtn.classList.remove("hide");
  pauseBtn.classList.add("hide");
  calcTimeOnPause(index);
}

function calcTimeOnPause(index) {
  document.getElementById(`timer-${index}`).innerText = "00:00:00";
  document.getElementById(`sum-timer-${index}`).innerText = calcTime(
    getThisProject(index)
  );
}

function calcTime(project) {
  if (project.counters !== []) {
    let sum = 0;
    for (let counter of project.counters) {
      sum += counter.timerCalc;
    }
    return sum.toString().toHHMMSS();
  } else {
    return "00:00:00";
  }
}

function formReset() {
  document.getElementById("project-form").reset();
}

function playPauseToggle(id) {
  const playBtn = document.getElementById(`play-${id}`);
  const pauseBtn = document.getElementById(`pause-${id}`);
  playBtn.classList.toggle("hide");
  pauseBtn.classList.toggle("hide");
}

function deletProject(element) {
  localStorage.setItem(
    "projectList",
    JSON.stringify(getAllWithoutThisProject(element.id))
  );
  const workLine = element.parentElement;
  workLine.remove();
  showLabels();
}

function getAllWithoutThisProject(projectId) {
  projectId = getId(projectId);
  return JSON.parse(localStorage.getItem("projectList")).filter(
    (item) => item.id != projectId
  );
}

function getThisProject(projectId) {
  projectId = getId(projectId);
  return JSON.parse(localStorage.getItem("projectList"))
    .filter((item) => item.id == projectId)
    .pop();
}

function getId(id) {
  if (typeof id == "string") {
    id = id.split("-");
    id = id[1];
  }
  return +id;
}

function isPayed(element) {
  const index = getId(element.id);
  const thisProject = getThisProject(index);
  const otherProjects = getAllWithoutThisProject(index);
  if (element.checked === true) {
    document.getElementById(`${index}`).classList.add("checked");
    thisProject.isPayed = true;
  } else {
    document.getElementById(`${index}`).classList.remove("checked");
    thisProject.isPayed = false;
  }
  otherProjects.push(thisProject);
  localStorage.setItem("projectList", JSON.stringify(otherProjects));
}

function changePayed(project) {
  if (project.isPayed === true) {
    document.getElementById(project.id).classList.add("checked");
    document
      .getElementById(`checkbox-${project.id}`)
      .setAttribute("checked", "true");
  }
}

function changeAberrant(project) {
  if (project.aberrant.is === true) {
    document.getElementById(project.id).classList.add("aberrant");
    document.getElementById(`compare-${project.id}`).innerText =
      project.aberrant.timer.toString().toHHMMSS();
  }
}

function sortByDate(item1, item2) {
  return (
    new Date(item1.dateCreated).getTime() -
    new Date(item2.dateCreated).getTime()
  );
}
function saveSortByDate() {
  const projectList = JSON.parse(localStorage.getItem("projectList"));
  const sortByDateList = projectList.sort(sortByDate);
  localStorage.setItem("projectList", JSON.stringify(sortByDateList));
}

function handlePlayPauseBtn(element) {
  if (event.target.tagName != element.tagName) {
    return;
  }
  const index = getId(element.id);
  if (document.getElementById(`play-${index}`).classList.contains("hide")) {
    document.getElementById(`pause-${index}`).click();
  } else {
    document.getElementById(`play-${index}`).click();
  }
}

function compareEstToTotal(id, curentTime) {
  const estimateTime = document
    .getElementById(`est-${id}`)
    .innerText.split(":");
  const totalTime = document
    .getElementById(`sum-timer-${id}`)
    .innerText.split(":");
  const estInSec = estimateTime[0] * 3600 + estimateTime[1] * 60;
  const totalInSec =
    +totalTime[0] * 3600 + +totalTime[1] * 60 + +totalTime[2] + curentTime;
  if (estInSec < totalInSec) {
    document.getElementById(`compare-${id}`).style.display = "inline-block";
    document.getElementById(`compare-${id}`).innerText = (
      +totalInSec - estInSec
    )
      .toString()
      .toHHMMSS();
    document.getElementById(id).classList.add("aberrant");
    const thisProject = getThisProject(id);
    thisProject.aberrant.is = true;
    thisProject.aberrant.timer = +totalInSec - estInSec;
    const localList = getAllWithoutThisProject(id);
    localList.push(thisProject);
    localStorage.setItem("projectList", JSON.stringify(localList));
  }
}
function showLabels() {
  const labels = document.getElementsByClassName("works-labels-wrapper");
  if (worksWrapper.innerHTML != "") {
    labels[0].style.display = "flex";
  } else {
    labels[0].style.display = "none";
  }
}

function addProjectLine(project) {
  const projectLine = 
  `<div class="work-line" id="${project.id}">
     <div class="inputs-wrapper">
       <div class="form-element-wrapper">
         <div class="round">
           <input type="checkbox" id="checkbox-${project.id}" onclick="isPayed(this)"/>
           <label for="checkbox-${project.id}"></label>
          </div>
        </div>
        <div class="form-element-wrapper">
          <span class="project-date-span">${new Date(project.dateCreated).getDate()}/${new Date(project.dateCreated).getMonth()}</span>
        </div>
        <div class="tooltip">
          <div class="form-element-wrapper">
            <span class="project-name-span">${project.name}</span>
            <span class="tooltiptext">${project.name}</span>
          </div>
        </div>
        <div class="form-element-wrapper">
          <span class="project-est-span" id="est-${project.id}">${project.estTime}</span>
        </div>
        <div class="form-element-wrapper">
          <span class="project-sum-time-span" id="sum-timer-${project.id}">${calcTime(project)}</span>
        </div>
        <div class="form-element-wrapper">
          <span class="project-working-time-span" id="timer-${project.id}">00:00:00</span>
        </div>
        <div class="form-element-wrapper">
          <span class="project-compare-time-span" id="compare-${project.id}">00:00:00</span>
        </div>
      </div>
      <div class="form-element-wrapper">
        <button class="play-pause-btn" id="playpause-${project.id}" onclick="handlePlayPauseBtn(this)">
          <i class="fa-solid fa-circle-pause fa-2x hide" id="pause-${project.id}"></i>
          <i class="fa-solid fa-circle-play fa-2x" id="play-${project.id}" onclick="startTimer(this.id)"></i>
        </button>
      </div>
      <i class="fa-solid fa-trash" id="del-${project.id}" onclick="deletProject(this)"></i>
    </div>`;
  worksWrapper.innerHTML += projectLine;
}