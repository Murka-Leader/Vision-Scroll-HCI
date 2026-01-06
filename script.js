import {
    FaceLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";

// --- DOM Elements ---
const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const btnToggle = document.getElementById("btn-toggle");
const btnCalibrate = document.getElementById("btn-calibrate");
const scrollIndicator = document.getElementById("scroll-indicator");
const loadingScreen = document.getElementById("loading");

// --- State Variables ---
let faceLandmarker;
let runningMode = "VIDEO";
let lastVideoTime = -1;
let isCameraActive = false;
let calibrationY = 0.5; 
window.isCalibrating = false;

// --- Hyperparameters ---
const DEAD_ZONE = 0.05; 
const SCROLL_SPEED = 25; 
const NOSE_LANDMARK_INDEX = 4; 

// Populate Gallery
const gallery1 = document.getElementById('gallery-container');
const gallery2 = document.getElementById('gallery-container-2');
for(let i=1; i<=12; i++) {
    const card = `<div class="card"><img src="https://picsum.photos/seed/${i+20}/400/300" alt="Sample"><h3>Project Node ${i}</h3><p>Analysis of gesture metrics.</p></div>`;
    if(i <= 6) gallery1.innerHTML += card;
    else gallery2.innerHTML += card;
}

// --- Initialize MediaPipe ---
async function initializeModel() {
    const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: runningMode,
        numFaces: 1
    });
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.remove(), 500);
}

// --- Camera Logic ---
async function toggleCamera() {
    if (isCameraActive) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        isCameraActive = false;
        btnToggle.textContent = "Start Camera";
        btnToggle.classList.remove('active');
    } else {
        try {
            const constraints = { video: { width: 640, height: 480 } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.addEventListener("loadeddata", predictWebcam);
            isCameraActive = true;
            btnToggle.textContent = "Stop Camera";
            btnToggle.classList.add('active');
            setTimeout(calibrate, 2000);
        } catch (err) {
            console.error("Camera access denied", err);
        }
    }
}

function calibrate() {
    window.isCalibrating = true;
}

async function predictWebcam() {
    if (!isCameraActive) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        const results = faceLandmarker.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const nose = results.faceLandmarks[0][NOSE_LANDMARK_INDEX];

            if (window.isCalibrating) {
                calibrationY = nose.y;
                window.isCalibrating = false;
            }

            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 5, 0, 2 * Math.PI);
            ctx.fill();

            const deltaY = nose.y - calibrationY;

            if (Math.abs(deltaY) > DEAD_ZONE) {
                if (deltaY > 0) {
                    window.scrollBy({ top: SCROLL_SPEED, behavior: 'auto' });
                    updateIndicator('⬇️', true);
                } else {
                    window.scrollBy({ top: -SCROLL_SPEED, behavior: 'auto' });
                    updateIndicator('⬆️', true);
                }
            } else {
                updateIndicator('', false);
            }
        }
    }

    if (isCameraActive) {
        window.requestAnimationFrame(predictWebcam);
    }
}

function updateIndicator(symbol, show) {
    if (show) {
        scrollIndicator.textContent = symbol;
        scrollIndicator.classList.add('active');
    } else {
        scrollIndicator.classList.remove('active');
    }
}

btnToggle.addEventListener("click", toggleCamera);
btnCalibrate.addEventListener("click", calibrate);
initializeModel();
