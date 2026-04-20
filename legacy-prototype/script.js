// State management
let isLocked = true;
let temperature = 24.8;
let humidity = 47;
let latencyMs = 12;
let signalStrength = 98;
let networkHealth = 96;
let isAlarming = false;

// Real-time Communication Channel
const bc = new BroadcastChannel('iot_simulation');

// Web Audio Siren
let audioCtx = null;
let oscillator = null;

function startSiren() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    oscillator.loop = true;
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Siren effect
    setInterval(() => {
        if (isAlarming) {
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.0);
        }
    }, 1000);
    
    oscillator.start();
}

function stopSiren() {
    if (oscillator) {
        oscillator.stop();
        audioCtx.close();
        audioCtx = null;
        oscillator = null;
    }
}

let isManualMode = false;

// Listen for Simulator Commands
bc.onmessage = (event) => {
    const { type, value } = event.data;
    isManualMode = true; // Stop auto-randomization once simulator is used
    
    if (type === 'TEMP_CHANGE') {
        temperature = parseFloat(value);
        checkSafetyProtocols();
        renderUI();
    }
    
    if (type === 'SMOKE_DETECTED') {
        smokeActive = value;
        if (value === true) triggerAlarm("SMOKE DETECTED! Emergency Unlock Initiated.");
        else resetAlarm();
    }
};

function checkSafetyProtocols() {
    if (temperature >= 45 && !isAlarming) {
        triggerAlarm("CRITICAL TEMPERATURE! Emergency Unlock Initiated.");
    }
}

let smokeActive = false;
function triggerAlarm(message) {
    if (isAlarming) return;
    isAlarming = true;
    isLocked = false; // Auto Unlock
    addLog(`⚠️ ${message}`);
    document.body.classList.add('emergency-mode');
    startSiren();
    renderUI();
}

function resetAlarm() {
    isAlarming = false;
    smokeActive = false;
    document.body.classList.remove('emergency-mode');
    stopSiren();
    addLog("System alarm cleared.");
    renderUI();
}

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
    if (isAlarming) {
        el("statusGreeting").textContent = "EMERGENCY: SYSTEM UNLOCKED";
        el("statusGreeting").style.color = "var(--danger)";
    } else {
        el("statusGreeting").textContent = isLocked ? "Home is Secure" : "Front Door is Open";
        el("statusGreeting").style.color = "var(--text)";
    }

    el("globalStatusDot").className = `status-dot ${networkHealth > 90 ? 'green' : 'yellow'}`;
    el("globalStatusText").textContent = networkHealth > 90 ? 'Connected' : 'Checking...';

    // Door Panel
    const badge = el("doorBadge");
    badge.textContent = isLocked ? "Locked" : "Unlocked";
    badge.className = `pill ${isLocked ? "green" : "yellow"}`;
    el("doorPanel").classList.toggle("unlocked", !isLocked);
    
    if (isAlarming) {
        el("doorNodeNote").textContent = "⚠️ EMERGENCY UNLOCK ACTIVE. Manual controls disabled for safety.";
        el("doorNodeNote").style.color = "var(--danger)";
    } else {
        el("doorNodeNote").textContent = isLocked 
            ? "The door is currently locked and secure."
            : "The door is open. Please close it when done.";
        el("doorNodeNote").style.color = "var(--text-muted)";
    }

    // Disable buttons during emergency
    el("unlockBtn").disabled = isAlarming;
    el("lockBtn").disabled = isAlarming;
    el("unlockBtn").style.opacity = isAlarming ? "0.5" : "1";
    el("lockBtn").style.opacity = isAlarming ? "0.5" : "1";
    el("unlockBtn").style.cursor = isAlarming ? "not-allowed" : "pointer";
    el("lockBtn").style.cursor = isAlarming ? "not-allowed" : "pointer";

    // Smoke Alert Toggle
    const smokeAlert = el("smokeAlertCard");
    if (smokeAlert) {
        smokeAlert.style.display = smokeActive ? "block" : "none";
        if (smokeActive) {
            smokeAlert.style.marginBottom = "20px";
        }
    }

    // Quick Stats
    el("roomTemp").textContent = `${temperature.toFixed(1)}°C`;
    el("humidity").textContent = `${humidity}%`;

    // Devices & System
    el("doorNodeState").textContent = isAlarming ? "EMERGENCY UNLOCK" : (isLocked ? "Locked" : "Unlocked");
    el("sensorNodeState").textContent = signalStrength > 92 ? "Excellent Signal" : "Weak Signal";
    el("networkHealth").textContent = networkHealth > 90 ? "Excellent" : "Stable";
    el("latencyMetric").textContent = `${latencyMs} ms`;

    // Cooling Advice (Safety Progressive Logic)
    let advice = "Environment is within target range.";
    let adviceColor = "var(--text-muted)";

    if (temperature >= 60) {
        advice = "🚨 EXTREME HEAT: Immediate evacuation recommended. Structure fire risk high.";
        adviceColor = "var(--danger)";
    } else if (temperature >= 45) {
        advice = "⚠️ EMERGENCY: Safety protocols active. Door unlocked for evacuation.";
        adviceColor = "var(--danger)";
    } else if (temperature >= 40) {
        advice = "🔥 CRITICAL: High temperature detected. System will auto-unlock at 45°C.";
        adviceColor = "var(--warning)";
    } else if (temperature >= 30) {
        advice = "🌡️ WARNING: Room is getting hot. Activate cooling systems immediately.";
        adviceColor = "var(--warning)";
    } else if (temperature < 23) {
        advice = "❄️ COOL: Room temperature is low. Heating is optional.";
    }

    el("coolingAdvice").textContent = advice;
    el("coolingAdvice").style.color = adviceColor;

    renderCharts();
}

function renderCharts() {
    const chart = el("chart");
    if (!chart) return;
    
    const minTemp = 20;
    const maxTemp = 60;
    const safetyLimit = 45;

    chart.innerHTML = temperatureHistory.map((value, index) => {
        const tempHeight = clamp(((value - minTemp) / (maxTemp - minTemp)) * 100, 8, 100);
        const thresholdHeight = clamp(((safetyLimit - minTemp) / (maxTemp - minTemp)) * 100, 8, 100);
        
        const isCritical = value >= safetyLimit;

        // Label for the safety threshold line (only on first bar)
        const thresholdLabel = index === 0 ? `
            <div style="position:absolute; bottom:${thresholdHeight}%; left:0; width:150px; transform:translateY(-50%); z-index:2; pointer-events:none;">
                <span style="background:var(--danger); color:white; font-size:8px; padding:2px 6px; border-radius:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    Critical Limit (${safetyLimit}°C)
                </span>
            </div>
        ` : '';

        return `
            <div style="display:flex; align-items:flex-end; position:relative; height:100%; width:100%; padding: 0 2px;">
                ${thresholdLabel}
                <!-- Safety Threshold Line -->
                <div style="position:absolute; bottom:${thresholdHeight}%; left:0; right:0; height:0; border-top: 2px dashed var(--danger); opacity:0.4; z-index:1;"></div>
                
                <!-- Ionic-style Bar -->
                <span class="chart-bar temp" 
                    style="height:${tempHeight}%; 
                           width:100%; 
                           background:${isCritical ? 'linear-gradient(180deg, #f43f5e, #991b1b)' : 'linear-gradient(180deg, #38bdf8, #1d4ed8)'}; 
                           transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                           border-radius: 6px 6px 2px 2px;
                           box-shadow: ${isCritical ? '0 0 10px rgba(244, 63, 94, 0.4)' : 'none'};">
                </span>
            </div>
        `;
    }).join("");

    // Add a small mobile-friendly analytics note below the chart
    const currentStatus = temperature >= safetyLimit ? "CRITICAL HEAT DETECTED" : "SYSTEM TEMPERATURE STABLE";
    const noteHTML = `
        <div style="margin-top:12px; display:flex; align-items:center; gap:8px; font-size:11px; color: ${temperature >= safetyLimit ? 'var(--danger)' : 'var(--text-dim)'}; font-weight:600;">
            <div style="width:6px; height:6px; border-radius:50%; background:${temperature >= safetyLimit ? 'var(--danger)' : 'var(--success)'};"></div>
            ${currentStatus}: ${temperature.toFixed(1)}°C
        </div>
    `;
    
    if (!el("chartNote")) {
        const noteDiv = document.createElement("div");
        noteDiv.id = "chartNote";
        chart.parentNode.appendChild(noteDiv);
    }
    el("chartNote").innerHTML = noteHTML;
}

function updateData() {
    // Only randomize if simulator HAS NOT been used (isManualMode is false)
    if (!isManualMode && !isAlarming) {
        temperature = clamp(Number((temperature + (Math.random() * 0.6 - 0.3)).toFixed(1)), 22.0, 29.5);
    }
    
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
    if (isAlarming) return;
    if (!isLocked) {
        addLog("Door is already open");
        return;
    }
    isLocked = false;
    addLog("Door unlocked via Mobile App");
    renderUI();
});

el("lockBtn").addEventListener("click", () => {
    if (isAlarming) return;
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
