let isLocked = true;
let temperature = 24.8;
let humidity = 47;
let packetRate = 118;
let latencyMs = 12;
let signalStrength = 98;
let networkHealth = 96;
let entriesToday = 14;

const temperatureHistory = [24.2, 24.5, 24.8, 25.0, 25.2, 24.9, 24.7, 24.8, 25.1, 25.0, 24.9, 24.8];
const latencyHistory = [10, 12, 11, 13, 12, 14, 11, 12, 13, 12, 11, 12];

const logs = [
    { text: "Edge lock node acknowledged secure state", time: "08:42 AM" },
    { text: "Temperature sensor heartbeat received", time: "08:31 AM" },
    { text: "Authorized unlock packet accepted", time: "08:15 AM" },
    { text: "Monitoring controller initialized", time: "07:30 AM" }
];

function el(id) {
    return document.getElementById(id);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function nowString() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function updateClock() {
    const now = new Date();
    el("clock").textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
    el("dateLabel").textContent = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function roomState() {
    if (temperature > 27) return "Warm";
    if (temperature < 23) return "Cool";
    return "Normal";
}

function trend() {
    const previous = temperatureHistory[temperatureHistory.length - 2];
    if (temperature > previous) return "Rising slightly";
    if (temperature < previous) return "Cooling slightly";
    return "Stable";
}

function coolingAdvice() {
    if (temperature > 27) return "Increase ventilation on sensor subnet";
    if (temperature < 23) return "No cooling action needed";
    return "Environment is within target range";
}

function addLog(text) {
    logs.unshift({ text, time: nowString() });
    logs.splice(10);
    renderLogs();
}

function renderLogs() {
    el("eventLog").innerHTML = logs.map(item => `
        <div class="log-item">
            <div>
                <strong>${item.text}</strong>
                <small>Network operations event</small>
            </div>
            <div class="stamp">${item.time}</div>
        </div>
    `).join("");
}

function renderSummary() {
    const items = [
        ["Lock Mode", isLocked ? "Secure" : "Temporarily open"],
        ["Sensor State", "Online"],
        ["Room State", roomState()],
        ["Temperature Trend", trend()],
        ["Latency", `${latencyMs} ms`],
        ["Last Action", logs[0]?.text || "No recent events"]
    ];

    el("summaryList").innerHTML = items.map(([label, value]) => `
        <div class="summary-item">
            <small>${label}</small>
            <strong>${value}</strong>
        </div>
    `).join("");
}

function renderTopology() {
    el("doorNodeState").textContent = isLocked ? "Locked" : "Unlocked";
    el("sensorNodeState").textContent = `${signalStrength}% signal`;
    el("controllerState").textContent = `${networkHealth}% health`;
}

function renderTelemetry() {
    el("roomTemp").textContent = `${temperature.toFixed(1)} C`;
    el("humidity").textContent = `${humidity}%`;
    el("trendValue").textContent = trend();
    el("coolingAdvice").textContent = coolingAdvice();
    el("networkHealth").textContent = `${networkHealth}%`;
    el("lastUpdate").textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function renderMetrics() {
    el("doorNodeMetric").textContent = isLocked ? "Locked" : "Unlocked";
    el("doorNodeHint").textContent = isLocked ? "Edge device responding" : "Access session active";
    el("sensorMetric").textContent = `${signalStrength}% signal`;
    el("latencyMetric").textContent = `${latencyMs} ms`;
    el("latencyHint").textContent = latencyMs <= 18 ? "Controller path stable" : "Delay is increasing";
    el("packetMetric").textContent = `${packetRate} pkt/s`;
    el("statusBadge").textContent = networkHealth >= 90 ? "Network Healthy" : "Network Warning";
}

function renderDoorPanel() {
    const badge = el("doorBadge");
    badge.textContent = isLocked ? "Locked" : "Unlocked";
    badge.className = `pill ${isLocked ? "green" : "yellow"}`;
    el("doorPanel").classList.toggle("unlocked", !isLocked);
    el("doorNodeNote").textContent = isLocked
        ? "Edge lock node is waiting for authenticated commands."
        : "Edge lock node is currently allowing access traffic.";
}

function renderCharts() {
    el("chart").innerHTML = temperatureHistory.map((value, index) => {
        const tempHeight = clamp(((value - 22) / 8) * 120 + 24, 18, 144);
        const latencyHeight = clamp((latencyHistory[index] / 30) * 120 + 18, 18, 144);
        return `
            <div style="display:grid;gap:6px;align-items:end;">
                <span class="chart-bar temp" style="height:${tempHeight}px"></span>
                <span class="chart-bar latency" style="height:${latencyHeight}px"></span>
            </div>
        `;
    }).join("");
}

function updateData() {
    temperature = clamp(Number((temperature + (Math.random() * 0.9 - 0.4)).toFixed(1)), 22.0, 29.5);
    humidity = clamp(Math.round(humidity + (Math.random() * 4 - 2)), 40, 62);
    packetRate = clamp(Math.round(packetRate + (Math.random() * 26 - 12)), 80, 180);
    latencyMs = clamp(Math.round(latencyMs + (Math.random() * 5 - 2)), 7, 28);
    signalStrength = clamp(Math.round(signalStrength + (Math.random() * 3 - 2)), 86, 100);
    networkHealth = clamp(Math.round((signalStrength + (100 - latencyMs)) / 2), 78, 99);

    temperatureHistory.push(temperature);
    temperatureHistory.shift();
    latencyHistory.push(latencyMs);
    latencyHistory.shift();

    renderMetrics();
    renderTopology();
    renderTelemetry();
    renderDoorPanel();
    renderSummary();
    renderCharts();
}

function unlockNode() {
    if (!isLocked) {
        addLog("Unlock packet rejected because node was already open");
        return;
    }
    isLocked = false;
    entriesToday += 1;
    addLog("Authorized unlock packet accepted by edge lock node");
    updateData();
}

function lockNode() {
    if (isLocked) {
        addLog("Lock command ignored because node was already secure");
        return;
    }
    isLocked = true;
    addLog("Secure-state packet committed to edge lock node");
    updateData();
}

function pollDevices() {
    addLog("Manual device poll started from controller");
    updateData();
}

el("unlockBtn").addEventListener("click", unlockNode);
el("lockBtn").addEventListener("click", lockNode);
el("pollBtn").addEventListener("click", pollDevices);

updateClock();
renderLogs();
updateData();
setInterval(updateClock, 1000);
setInterval(updateData, 3000);
