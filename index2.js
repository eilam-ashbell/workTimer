const projectNameInput = document.getElementById("project-name-input");
const estTimeInput = document.getElementById("project-time-input");
const worksWrapper = document.getElementById("works-wrapper");

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
  const projectList = JSON.parse(localStorage.getItem("projectList"));
  if (projectList != null) {
    for (let proj of projectList) {
      addProjectLine(proj);
    }
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
}

function add() {
  const project = new Project();
  addToLocalStorage(project);
  addProjectLine(project);
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

function addProjectLine(project) {
  const projectLine = `<div class="work-line" id="${project.id}">
      <div class="inputs-wrapper"><div class="form-element-wrapper"><span class="project-name-span">${
        project.name
      }</span>
      </div><div class="form-element-wrapper"><span class="project-est-span" id="est-${
        project.id
      }">${project.estTime}</span>
      </div><div class="form-element-wrapper"><span class="project-sum-time-span" id="sum-timer-${
        project.id
      }">${calcTime(project)}</span>
      </div>
      <div class="form-element-wrapper"><span class="project-working-time-span" id="timer-${
        project.id
      }">00:00:00</span>
        </div>
      </div><div class="form-element-wrapper"><i class="fa-solid fa-circle-pause fa-2x hide" id="pause-${
        project.id
      }"></i><i class="fa-solid fa-circle-play fa-2x" id="play-${
    project.id
  }" onclick="startTimer(this.id)"></i></div></div>`;
  worksWrapper.innerHTML += projectLine;
}

function startTimer(id) {
  if (typeof(id) != 'number') {
    id = id.split("-");
    id = id[1]
}
  const timer = {
    timerStart: new Date().getTime(),
    timerEnd: new Date().getTime(),
    intervalId: setInterval(() => intervalFunction(id, timer), 1000),
  };

  document.getElementById(`pause-${id}`).addEventListener("click", () => stopTimer(id, timer));
  playPauseToggle(id);
  const playBtn = document.getElementById(`play-${id}`);
  const pauseBtn = document.getElementById(`pause-${id}`);
  playBtn.classList.add("hide");
  pauseBtn.classList.remove("hide");
}

function intervalFunction(id, timer) {
    timer.timerEnd = new Date().getTime();
    timer.timerCalc = Math.floor((timer.timerEnd - timer.timerStart) / 1000);
    console.log(timer.timerCalc)
    document.getElementById(`timer-${id}`).innerText = timer.timerCalc.toString().toHHMMSS();
}

function stopTimer(id, timer) {
    console.log(timer)
    clearInterval(timer.intervalId);
    const thisProject = JSON.parse(localStorage.getItem("projectList")).filter((item) => item.id == id).pop();
    const localList = JSON.parse(localStorage.getItem("projectList")).filter((item) => item.id != id);
    thisProject.counters.push(timer)
    localList.push(thisProject)
    localStorage.setItem("projectList", JSON.stringify(localList));
    // playPauseToggle(id);
    const playBtn = document.getElementById(`play-${id}`);
    const pauseBtn = document.getElementById(`pause-${id}`);
    playBtn.classList.remove("hide");
    pauseBtn.classList.add("hide");
    calcTimeOnPause(id)
}

function calcTimeOnPause(id) {
  const timerDisplay = document.getElementById(`timer-${id}`);
  const timerSumDisplay = document.getElementById(`sum-timer-${id}`);
  timerDisplay.innerText = "00:00:00";
  const thisProject = JSON.parse(localStorage.getItem("projectList")).filter((item) => item.id == id).pop()
  timerSumDisplay.innerText = calcTime(thisProject);
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