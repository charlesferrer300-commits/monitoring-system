# Smart Home Monitor - Gemini Context

## Project Overview
This is an **Ionic Angular (Standalone)** mobile application for monitoring a Smart Door Lock and Environmental Sensors. It is the mobile-first overhaul of a static prototype, designed to serve as the basis for a professional IoT application.

## Tech Stack
- **Framework:** Ionic Framework with Angular (Standalone Components).
- **State Management:** Angular Signals (located in `DeviceMonitorService`).
- **Communication:** Currently uses `BroadcastChannel` for simulation with `legacy-prototype/simulator.html`. Migration to **Firebase Realtime Database** is planned for Phase 4.
- **Audio:** `SirenService` using Web Audio API for emergency alerts.

## Architectural Mandates
1. **Safety First:** If `temperature >= 45` or `smokeActive == true`, the system MUST force `isLocked` to `false` and disable manual controls.
2. **Mobile-First Design:** Maintain the F-pattern header, dark theme (`global.scss`), and Ionic-style rounded components.
3. **Reactive UI:** All telemetry data must be bound via Angular Signals to ensure real-time UI synchronization without manual DOM manipulation.
4. **IoT Bridge:** The app acts as the Software layer in a 3-Way Architecture (Hardware -> API/Firebase -> Software).

## Key Files
- `src/app/services/device-monitor.ts`: Core logic, safety protocols, and state.
- `src/app/services/siren.ts`: Audio alarm management.
- `src/app/home/home.page.html/ts`: Main UI and chart rendering logic.
- `src/global.scss`: Application-wide design system and variables.

## Current Phase: 4 (Firebase Integration & Push Notifications - IN PROGRESS)
- UI Porting: COMPLETED.
- Signals Integration: COMPLETED.
- Prototype Parity Audit: COMPLETED.
- Firebase Realtime Database Integration: COMPLETED (Standard SDK, awaiting config).
- Capacitor Push Notifications Setup: COMPLETED.
- **Next Step:** Phase 5 - UI Polish and Final Handover.

