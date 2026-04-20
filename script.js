// State management
let isLocked = true;
let temperature = 24.8;
let humidity = 47;
let latencyMs = 12;
let signalStrength = 98;
let networkHealth = 96;

const temperatureHistory = [24.2, 24.5, 24.8, 25.0, 25.2, 24.9, 24.7, 24.8, 25.1, 25.0, 24.9, 24.8];
const latencyHistory = [10, 12, 11, 13, 12, 14, 11, 12, 13, 12, 11, 12];

const logs = [
    { text: "System secured by user", time: "08:42 AM" },
    { text: "Environment sensor updated", time: "08:31 AM" },
    { text: "Door unlocked via Mobile App", time: "08:15 AM" },
    { text: "System started successfully", time: "07:30 AM" }
];

// UI Elements Helper
const el = (id) => document.getElementById(id);

// Tab Switching Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update Buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update Content
        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        el(`tab-${targetTab}`).classList.add('active');
    });
});

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function nowString() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addLog(text) {
    logs.unshift({ text, time: nowString() });
    if (logs.length > 8) logs.pop();
    renderLogs();
}

function renderLogs() {
    const logContainer = el("eventLog");
    if (!logContainer) return;
    logContainer.innerHTML = logs.map(item => `
        <div class="log-item">
            <div>
                <strong>${item.text}</strong>
            </div>
            <div class="stamp">${item.time}</div>
        </div>
    `).join("");
}

function renderUI() {
    // Status Text
    el("statusGreeting").textContent = isLocked ? "Home is Secure" : "Front Door is Open";
    el("globalStatusDot").className = `status-dot ${networkHealth > 90 ? 'green' : 'yellow'}`;
    el("globalStatusText").textContent = networkHealth > 90 ? 'Connected' : 'Checking...';

    // Door Panel
    const badge = el("doorBadge");
    badge.textContent = isLocked ? "Locked" : "Unlocked";
    badge.className = `pill ${isLocked ? "green" : "yellow"}`;
    el("doorPanel").classList.toggle("unlocked", !isLocked);
    el("doorNodeNote").textContent = isLocked 
        ? "The door is currently locked and secure."
        : "The door is open. Please close it when done.";

    // Quick Stats
    el("roomTemp").textContent = `${temperature.toFixed(1)}°C`;
    el("humidity").textContent = `${humidity}%`;

    // Devices & System
    el("doorNodeState").textContent = isLocked ? "Locked" : "Unlocked";
    el("sensorNodeState").textContent = signalStrength > 92 ? "Excellent Signal" : "Weak Signal";
    el("networkHealth").textContent = networkHealth > 90 ? "Excellent" : "Stable";
    el("latencyMetric").textContent = `${latencyMs} ms`;

    // Cooling Advice
    let advice = "Environment is within target range.";
    if (temperature > 27) advice = "Room is warm. Consider ventilation.";
    if (temperature < 23) advice = "Room is cool. Heating is optional.";
    el("coolingAdvice").textContent = advice;

    renderCharts();
}

function renderCharts() {
    const chart = el("chart");
    if (!chart) return;
    chart.innerHTML = temperatureHistory.map((value, index) => {
        const tempHeight = clamp(((value - 22) / 8) * 100, 10, 100);
        const latencyHeight = clamp((latencyHistory[index] / 30) * 100, 10, 100);
        return `
            <div style="display:grid;gap:4px;align-items:end;height:100%;">
                <span class="chart-bar temp" style="height:${tempHeight}%"></span>
                <span class="chart-bar latency" style="height:${latencyHeight}%"></span>
            </div>
        `;
    }).join("");
}

function updateData() {
    temperature = clamp(Number((temperature + (Math.random() * 0.6 - 0.3)).toFixed(1)), 22.0, 29.5);
    humidity = clamp(Math.round(humidity + (Math.random() * 4 - 2)), 40, 62);
    latencyMs = clamp(Math.round(latencyMs + (Math.random() * 4 - 2)), 7, 28);
    signalStrength = clamp(Math.round(signalStrength + (Math.random() * 2 - 1)), 86, 100);
    networkHealth = clamp(Math.round((signalStrength + (100 - latencyMs)) / 2), 78, 99);

    temperatureHistory.push(temperature);
    temperatureHistory.shift();
    latencyHistory.push(latencyMs);
    latencyHistory.shift();

    renderUI();
}

// Button Events
el("unlockBtn").addEventListener("click", () => {
    if (!isLocked) {
        addLog("Door is already open");
        return;
    }
    isLocked = false;
    addLog("Door unlocked via Mobile App");
    renderUI();
});

el("lockBtn").addEventListener("click", () => {
    if (isLocked) {
        addLog("Door is already secure");
        return;
    }
    isLocked = true;
    addLog("Door locked via Mobile App");
    renderUI();
});

el("pollBtn").addEventListener("click", () => {
    addLog("Manual status refresh");
    updateData();
});

// Initialization
renderLogs();
renderUI();
setInterval(updateData, 3000);
