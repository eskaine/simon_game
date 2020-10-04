const levelText = document.getElementById("level");
const turnText = document.getElementById("turn");
const toggleButton = document.getElementById("toggleBtn");
const toggle = toggleButton.parentNode;
const startButton = document.getElementById("startBtn");
const panels = document.getElementById("panels");
const panelsList = panels.children;

// Game Data
var state = {
  level: 0,
  isStrictOn: false,
  isGameover: true,
  isRunning: false,
  isPanelsLock: true,
  sequences: [],
  inputs: [],
  params: {
    toggleColors: { on: "#2E7D32", off: "#c62828" },
    turnStatus: {
      go: { color: "#2ecc71", text: "Your Turn" },
      wait: { color: "#f1c40f", text: "Running Sequence" },
      stop: { color: "#e74c3c", text: "Game Over" },
      retry: { color: "#e74c3c", text: "Retry" },
    },
  },
  audio: {
    clips: [
      "https://res.cloudinary.com/d7bdciwna5/video/upload/v1601099441/sounds/do.wav",
      "https://res.cloudinary.com/d7bdciwna5/video/upload/v1601099441/sounds/re.wav",
      "https://res.cloudinary.com/d7bdciwna5/video/upload/v1601099441/sounds/mi.wav",
      "https://res.cloudinary.com/d7bdciwna5/video/upload/v1601099441/sounds/fa.wav",
    ],
    error:
      "https://res.cloudinary.com/d7bdciwna5/video/upload/v1601099200/sounds/state.audio.error-beep.mp3",
  },
};

startButton.addEventListener("click", (e) => {
  if (!state.isRunning) {
    state.isRunning = true;
    state.isGameover = false;
    resetGame();
    runGame();
  }
});

panels.addEventListener("click", (e) => {
  if (!state.isPanelsLock) {
    playerInput(e.target.dataset.panel);
  }
});

toggle.addEventListener("click", (e) => {
  if (!state.isRunning) {
    if (toggle.style.justifyContent === "flex-start") {
      toggle.style.justifyContent = "flex-end";
      toggleButton.style.backgroundColor = state.params.toggleColors.on;
      state.isStrictOn = true;
    } else {
      toggle.style.justifyContent = "flex-start";
      toggleButton.style.backgroundColor = state.params.toggleColors.off;
      state.isStrictOn = false;
    }
  }
});

function runGame() {
  state.level++;
  state.sequences = [];
  state.inputs = [];
  levelText.innerHTML = `Level: ${state.level}`;
  genSequence();
}

function resetGame() {
  state.level = 0;
  state.sequences = [];
  state.inputs = [];
}

function playerInput(panel) {
  let index = Number(panel);
  playAudio(state.audio.clips[index]);
  state.inputs.push(index);
  if (state.inputs.length === state.sequences.length) {
    state.isPanelsLock = true;
    setTimeout(() => checkInput(), 500);
  }
}

// Compare player input to state.sequences
function checkInput() {
  for (let i in state.sequences) {
    if (state.inputs[i] !== state.sequences[i]) {
      playAudio(state.audio.error);

      // retry if strict is off else game over
      if (!state.isStrictOn) {
        changeStatus(turnText, state.params.turnStatus.retry);
        setTimeout(() => repeatSeq(), 2000);
      } else {
        changeStatus(turnText, state.params.turnStatus.stop);
      }
      break;
    }

    // continue game if all input is correct
    if (i == state.sequences.length - 1) {
      setTimeout(() => runGame(), 500);
    }
  }
}

function genSequence() {
  changeStatus(turnText, state.params.turnStatus.wait);
  let n = state.level;
  state.isRunning = true;

  // generate panel state.sequences
  let interval = setInterval(() => {
    let index = Math.round(Math.random() * (panelsList.length - 1));
    playAudio(state.audio.clips[index]);
    state.sequences.push(index);
    flashPanel(index);
    n--;

    // setup player's turn
    if (n === 0) {
      clearInterval(interval);
      prepPlayer();
    }
  }, 1600);
}

// Retry
function repeatSeq() {
  changeStatus(turnText, state.params.turnStatus.wait);
  state.inputs = [];
  state.isRunning = true;
  let n = 0;

  // run through panel state.sequences
  let interval = setInterval(() => {
    let index = state.sequences[n];
    playAudio(state.audio.clips[index]);
    flashPanel(index);
    n++;

    // setup player's turn
    if (n === state.sequences.length) {
      clearInterval(interval);
      prepPlayer();
    }
  }, 1600);
}

/* Helper functions */
function prepPlayer() {
  setTimeout(() => {
    state.isRunning = false;
    state.isPanelsLock = false;
    changeStatus(turnText, state.params.turnStatus.go);
  }, 1200);
}

function flashPanel(index) {
  panelsList[index].classList.add("hover");
  setTimeout(() => {
    panelsList[index].classList.remove("hover");
  }, 800);
}

function changeStatus(element, status) {
  element.style.color = status.color;
  element.innerHTML = status.text;
}

function playAudio(clips) {
  new Audio(clips).play();
}
