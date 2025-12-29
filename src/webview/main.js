const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
    const addNowBtn = document.getElementById("add-now-btn");
    if (addNowBtn) {
        addNowBtn.addEventListener("click", handleAddNow);
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function handleAddNow() {
    const now = new Date();
    addHistoryItem(now);
}

function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById("current-time");
    const dateElement = document.getElementById("current-date");

    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString();
    }
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

function addHistoryItem(date) {
    const list = document.getElementById("history-list");
    if (!list) return;

    const itemBlock = document.createElement("div");
    itemBlock.className = "history-item";

    const timeSpan = document.createElement("span");
    timeSpan.textContent = date.toLocaleString();

    const unixSpan = document.createElement("span");
    unixSpan.textContent = `UNIX: ${Math.floor(date.getTime() / 1000)}`;
    unixSpan.className = "unix-time";

    itemBlock.appendChild(timeSpan);
    itemBlock.appendChild(unixSpan);

    // Insert at top
    list.insertBefore(itemBlock, list.firstChild);
}
