// variables
// progress
let ProgressBar = require('progressbar.js');
// btn
const startButton = document.querySelector(".pomodoro-start");
const stopButton = document.querySelector(".pomodoro-stop");
// clock
let isClockRunning = false;
// in seconds = 25 mins
let workSessionDuration = 1500;
let currentTimeLeftInSession = 1500;
// in seconds = 5 mins;
let breakSessionDuration = 300;
let timeSpentInCurrentSession = 0;
let type = "Work";
let currentTaskLabel = document.querySelector(".pomodoro-clock-task");
let updatedWorkSessionDuration;
let updatedBreakSessionDuration;
let workDurationInput = document.querySelector(".input-work-duration");
let breakDurationInput = document.querySelector(".input-break-duration");
let isClockStopped = true;

workDurationInput.value = "25";
breakDurationInput.value = "5";

// listeners
startButton.addEventListener("click", () => {
    toggleClock();
});
stopButton.addEventListener("click", () => {
    toggleClock(true);
});
workDurationInput.addEventListener("input", () => {
    updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
});

breakDurationInput.addEventListener("input", () => {
    updatedBreakSessionDuration = minuteToSeconds(breakDurationInput.value);
});

const progressBar = new ProgressBar.Circle("#pomodoro-timer", {
    strokeWidth: 6,
    text: {
        value: "25:00",
        className: 'progressbar__label',
    },
    color: '#212529',
    trailColor: "#7b0909",
    trailWidth: 0.5,
});

//toggleClock();


function minuteToSeconds(mins) { return mins * 60; };

function toggleClock(reset) {
    togglePlayPauseIcon(reset);
    if (reset) {
        stopClock();
    } else {
        if (isClockStopped) {
            setUpdatedTimers();
            isClockStopped = false;
        }

        if (isClockRunning === true) {
            clearInterval(clockTimer);
            isClockRunning = false;
        } else {
            clockTimer = setInterval(() => {
                stepDown();
                displayCurrentTimeLeftInSession();
                progressBar.set(calculateSessionProgress());
            }, 1000);
            isClockRunning = true;
        }
        showStopIcon();
    }
};

function displayCurrentTimeLeftInSession() {
    const secondsLeft = currentTimeLeftInSession;
    let result = '';
    const seconds = secondsLeft % 60;
    const minutes = parseInt(secondsLeft / 60) % 60;
    let hours = parseInt(secondsLeft / 3600);
    // add leading zeroes if it's less than 10
    function addLeadingZeroes(time) {
        return time < 10 ? `0${time}` : time;
    }
    if (hours > 0) result += `${hours}:`;
    result += `${addLeadingZeroes(minutes)}:${addLeadingZeroes(seconds)}`;
    progressBar.text.innerText = result.toString();
}

function stopClock() {
    setUpdatedTimers();
    displaySessionLog(type);
    clearInterval(clockTimer);
    isClockStopped = true;
    isClockRunning = false;
    currentTimeLeftInSession = workSessionDuration;
    displayCurrentTimeLeftInSession();
    timeSpentInCurrentSession = 0;
    type = type === 'Work' ? 'Break' : 'Work';
};

function stepDown() {
    if (currentTimeLeftInSession > 0) {
        currentTimeLeftInSession--;
        timeSpentInCurrentSession++;
    } else if (currentTimeLeftInSession === 0) {
        timeSpentInCurrentSession = 0;
        if (type === "Work") {
            currentTimeLeftInSession = breakSessionDuration;
            displaySessionLog("Work");
            type = "Break";
            setUpdatedTimers();
            currentTaskLabel.value = "Break";
            currentTaskLabel.disabled = true;
        } else {
            currentTimeLeftInSession = workSessionDuration;
            type = "Work";
            setUpdatedTimers();
            if (currentTaskLabel.value === "Break") {
                currentTaskLabel.value = workSessionLabel;
            }
            currentTaskLabel.disabled = false;
            displaySessionLog("Break");
        }
    }
    displayCurrentTimeLeftInSession();
};

function displaySessionLog(type) {
    const sessionsList = document.querySelector(".pomodoro-sessions");
    const li = document.createElement("li");
    if (type === "Work") {
        sessionLabel = currentTaskLabel.value ? currentTaskLabel.value : "Work";
        workSessionLabel = sessionLabel;
    } else {
        sessionLabel = "Break";
    }
    let elapsedTime = parseInt(timeSpentInCurrentSession / 60);
    elapsedTime = elapsedTime > 0 ? elapsedTime : "< 1";

    const text = document.createTextNode(
        `${sessionLabel} : ${elapsedTime} min`
    );
    li.appendChild(text);
    sessionsList.appendChild(li);
};

function setUpdatedTimers() {
    if (type === "Work") {
        currentTimeLeftInSession = updatedWorkSessionDuration
            ? updatedWorkSessionDuration
            : workSessionDuration;
        workSessionDuration = currentTimeLeftInSession;
    } else {
        currentTimeLeftInSession = updatedBreakSessionDuration
            ? updatedBreakSessionDuration
            : breakSessionDuration;
        breakSessionDuration = currentTimeLeftInSession;
    }
};

// TODO don't work because the style sheet doesn't load
function togglePlayPauseIcon(reset) {
    const playIcon = document.querySelector(".play-icon");
    const pauseIcon = document.querySelector(".pause-icon");
    if (reset) {
        if (playIcon.classList.contains("hidden")) {
            playIcon.classList.remove("hidden");
        }
        if (!pauseIcon.classList.contains("hidden")) {
            pauseIcon.classList.add("hidden");
        }
    } else {
        playIcon.classList.toggle("hidden");
        pauseIcon.classList.toggle("hidden");
    }
};

function showStopIcon() {
    const stopButton = document.querySelector(".pomodoro-stop");
    stopButton.classList.remove("hidden");
};

function calculateSessionProgress() {
    const sessionDuration =
        type === "Work" ? workSessionDuration : breakSessionDuration;
    return (timeSpentInCurrentSession / sessionDuration) * 10;
};
