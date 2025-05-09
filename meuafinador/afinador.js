// Afinador
let audioCtx, analyser, source, dataArray;
const refFreqSelect = document.getElementById("refFreq");
const currentNoteDisplay = document.getElementById("current-note");
const noteCheck = document.getElementById("note-check");
const precisionBar = document.getElementById("precision-indicator");
let refFreq = parseFloat(refFreqSelect.value);
let isTuning = false;

refFreqSelect.addEventListener(
  "change",
  () => (refFreq = parseFloat(refFreqSelect.value))
);
document.getElementById("start-tuner").addEventListener("click", async () => {
  if (!isTuning) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    dataArray = new Float32Array(analyser.fftSize);
    tuneLoop();
    isTuning = true;
  }
});

function tuneLoop() {
  analyser.getFloatTimeDomainData(dataArray);
  const freq = autoCorrelate(dataArray, audioCtx.sampleRate);
  if (freq) {
    const note = freqToNote(freq);
    currentNoteDisplay.textContent = note.name.toUpperCase();
    const cents = 1200 * Math.log2(freq / note.freq);
    const pct = Math.max(0, 1 - Math.abs(cents) / 50);
    precisionBar.style.width = `${pct * 100}%`;
    precisionBar.style.background = pct > 0.9 ? "#00FF00" : "#333";
    noteCheck.textContent = pct > 0.9 ? "✔" : "";
  }
  requestAnimationFrame(tuneLoop);
}

function autoCorrelate(buf, sr) {
  let SIZE = buf.length,
    rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  if (rms < 0.01) return null;
  let r1 = 0,
    r2 = SIZE - 1,
    thresh = 0.2;
  for (let i = 0; i < SIZE / 2; i++)
    if (Math.abs(buf[i]) < thresh) {
      r1 = i;
      break;
    }
  for (let i = 1; i < SIZE / 2; i++)
    if (Math.abs(buf[SIZE - i]) < thresh) {
      r2 = SIZE - i;
      break;
    }
  buf = buf.slice(r1, r2);
  SIZE = buf.length;
  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE - i; j++) c[i] += buf[j] * buf[j + i];
  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxpos = d;
  for (let i = d; i < SIZE; i++) if (c[i] > c[maxpos]) maxpos = i;
  return sr / maxpos;
}

const noteStrings = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
function freqToNote(freq) {
  const noteNum = 12 * (Math.log(freq / refFreq) / Math.log(2)) + 69;
  const index = Math.round(noteNum) % 12;
  const name = noteStrings[index];
  const noteFreq = refFreq * Math.pow(2, (Math.round(noteNum) - 69) / 12);
  return { name, freq: noteFreq };
}

// Metrônomo
const toggleMetroBtn = document.getElementById("toggle-metronome");
const panelMetroDiv = document.getElementById("metronome-panel");
const bpmSlider = document.getElementById("bpmSlider");
const bpmValue = document.getElementById("bpmValue");
const meterSelect = document.getElementById("meterSelect");
const playStopBtn = document.getElementById("play-stop-metronome");
const ledVert = document.getElementById("metro-led-vertical");
let bpm = parseInt(bpmSlider.value, 10);
let meter = parseInt(meterSelect.value, 10);
let beat = 0;
let metroInterval;
let isMetroPlaying = false;

toggleMetroBtn.addEventListener("click", () =>
  panelMetroDiv.classList.toggle("hidden")
);

function playBeat() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = beat % meter === 0 ? 1500 : 1000;
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
  ledVert.style.height = "100%";
  setTimeout(() => (ledVert.style.height = "0"), 100);
  beat = (beat + 1) % meter;
}

function startMetro() {
  beat = 0;
  playBeat();
  metroInterval = setInterval(playBeat, (60 / bpm) * 1000);
}
function stopMetro() {
  clearInterval(metroInterval);
  ledVert.style.height = "0";
}

bpmSlider.addEventListener("input", () => {
  bpm = parseInt(bpmSlider.value, 10);
  bpmValue.textContent = bpm;
  if (isMetroPlaying) {
    stopMetro();
    startMetro();
  }
});
meterSelect.addEventListener("change", () => {
  meter = parseInt(meterSelect.value, 10);
  if (isMetroPlaying) {
    stopMetro();
    startMetro();
  }
});
playStopBtn.addEventListener("click", () => {
  if (isMetroPlaying) {
    stopMetro();
    playStopBtn.textContent = "Tocar";
    isMetroPlaying = false;
  } else {
    startMetro();
    playStopBtn.textContent = "Parar";
    isMetroPlaying = true;
  }
});

// Ritmos de bateria
const audioPlayer = document.getElementById("audio-player");
let currentFile = "";
const speedCtrl = document.getElementById("rhythmSpeed");
const speedPct = document.getElementById("speedPercent");

speedCtrl.addEventListener("input", () => {
  const rate = parseFloat(speedCtrl.value);
  speedPct.textContent = `${Math.round(rate * 100)}%`;
  audioPlayer.playbackRate = rate;
});
document
  .getElementById("toggle-rhythms")
  .addEventListener("click", () =>
    document.getElementById("rhythms-panel").classList.toggle("hidden")
  );
document.querySelectorAll(".btn-rhythm").forEach((btn) =>
  btn.addEventListener("click", () => {
    const file = btn.dataset.file;
    if (currentFile === file) {
      audioPlayer.pause();
      currentFile = "";
    } else {
      audioPlayer.src = file;
      audioPlayer.loop = true;
      audioPlayer.playbackRate = parseFloat(speedCtrl.value);
      audioPlayer.play();
      currentFile = file;
    }
  })
);
