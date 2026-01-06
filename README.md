# Vision-Scroll: AI Gesture Control Interface

A computer vision project that enables hands-free web navigation through real-time facial landmark detection. 

## Purpose
This project explores **Assistive Technologies**. By mapping physical head movements to browser scroll events, it provides a functional prototype for users with motor impairments or for scenarios where touch/mouse input is not feasible.



## Technology Stack
- **Engine:** MediaPipe Face Landmarker.
- **Frontend:** Vanilla JavaScript (ES6+), HTML5 Video API.
- **Cryptography/Math:** Euclidean distance calculation for gesture thresholds.

## How It Works
1. **Calibration:** On startup, the system captures the "home" coordinates of the nose tip.
2. **Tracking:** The script monitors the Y-axis displacement of the nose.
3. **Trigger:** - Move head **Down** (> 40px from center) → `window.scrollBy(0, 100)`
   - Move head **Up** (> 40px from center) → `window.scrollBy(0, -100)`
4. **Dead Zone:** A neutral center zone prevents jittery or accidental scrolling.

## Installation & Usage
1. Clone the repo.
2. Open `index.html` via a local server (needed for webcam permissions).
3. Allow camera access and stay in the center for calibration.
