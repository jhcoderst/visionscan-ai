const video = document.getElementById('webcam');
const snapshotCanvas = document.getElementById('snapshotCanvas');
const cameraContainer = document.getElementById('cameraContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const cameraErrorView = document.getElementById('cameraErrorView');
const scanLine = document.getElementById('scanLine');
const camStatusText = document.getElementById('camStatusText');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const resultContent = document.getElementById('resultContent');
const resTitle = document.getElementById('resTitle');
const resCategory = document.getElementById('resCategory');
const resConfidence = document.getElementById('resConfidence');
const resDescription = document.getElementById('resDescription');
const resFunFact = document.getElementById('resFunFact');
const resTags = document.getElementById('resTags');
const historyContainer = document.getElementById('historyContainer');
const emptyHistoryText = document.getElementById('emptyHistoryText');
const historyCount = document.getElementById('historyCount');
const autoBtnText = document.getElementById('autoBtnText');
const autoIndicator = document.getElementById('autoIndicator');
const retryCameraBtn = document.getElementById('retryCameraBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const switchCamBtn = document.getElementById('switchCamBtn');
const scanBtn = document.getElementById('scanBtn');
const fileInput = document.getElementById('fileInput');
const speakBtn = document.getElementById('speakBtn');

let currentStream = null;
let facingMode = 'environment';
let autoScanInterval = null;
let isAutoScanOn = false;
let isAnalyzing = false;
let currentAnalysisData = null;

window.addEventListener('load', () => {
  startCamera();
  loadHistoryFromStorage();
});

async function startCamera() {
  cameraErrorView.classList.add('hidden');
  camStatusText.textContent = 'INICIANDO...';

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
    video.classList.toggle('scale-x-[-1]', facingMode === 'user');
    camStatusText.textContent = 'ACTIVA';
  } catch (err) {
    try {
      currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = currentStream;
      video.classList.toggle('scale-x-[-1]', false);
      camStatusText.textContent = 'ACTIVA';
    } catch (error) {
      showCameraError('No se pudo conectar a la cámara. Revisa los permisos del navegador o usa una imagen local.');
    }
  }
}

function showCameraError(msg) {
  document.getElementById('errorMessage').textContent = msg;
  cameraErrorView.classList.remove('hidden');
  camStatusText.textContent = 'ERROR';
}

switchCamBtn.addEventListener('click', () => {
  facingMode = facingMode === 'environment' ? 'user' : 'environment';
  startCamera();
});

retryCameraBtn.addEventListener('click', startCamera);
scanBtn.addEventListener('click', captureAndAnalyze);
clearHistoryBtn.addEventListener('click', clearHistory);
speakBtn.addEventListener('click', speakResult);

fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result.split(',')[1];
    analyzeImage(base64, reader.result);
  };
  reader.readAsDataURL(file);
});

document.getElementById('toggleAutoBtn').addEventListener('click', toggleAutoMode);

function toggleAutoMode() {
  isAutoScanOn = !isAutoScanOn;

  if (isAutoScanOn) {
    autoBtnText.textContent = 'Auto-Escaneo: ON';
    autoIndicator.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
    autoScanInterval = setInterval(() => {
      if (!isAnalyzing && currentStream) {
        captureAndAnalyze();
      }
    }, 7000);
  } else {
    autoBtnText.textContent = 'Auto-Escaneo: OFF';
    autoIndicator.className = 'w-2 h-2 rounded-full bg-gray-500';
    clearInterval(autoScanInterval);
  }
}

function captureFrameBase64() {
  const context = snapshotCanvas.getContext('2d');
  snapshotCanvas.width = video.videoWidth || 640;
  snapshotCanvas.height = video.videoHeight || 480;

  if (facingMode === 'user') {
    context.translate(snapshotCanvas.width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
  return snapshotCanvas.toDataURL('image/jpeg', 0.85).split(',')[1];
}

async function captureAndAnalyze() {
  if (isAnalyzing) return;

  if (!currentStream || video.readyState !== 4) {
    alert('La cámara no está lista todavía.');
    return;
  }

  const base64Image = captureFrameBase64();
  const fullDataUri = snapshotCanvas.toDataURL('image/jpeg', 0.85);
  await analyzeImage(base64Image, fullDataUri);
}

async function analyzeImage(base64Image, displayUri) {
  setLoadingState(true);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al analizar la imagen.');
    }

    currentAnalysisData = data;
    displayResult(data);
    saveToHistory(data, displayUri);
  } catch (error) {
    console.error(error);
    alert(error.message || 'Ocurrió un error al analizar la imagen.');
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(loading) {
  isAnalyzing = loading;

  if (loading) {
    loadingOverlay.classList.remove('opacity-0', 'pointer-events-none');
    scanLine.classList.remove('hidden');
    cameraContainer.classList.add('scanning');
  } else {
    loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
    scanLine.classList.add('hidden');
    cameraContainer.classList.remove('scanning');
  }
}

function displayResult(data) {
  resultPlaceholder.classList.add('hidden');
  resultContent.classList.remove('hidden');
  resultContent.classList.add('flex');

  resTitle.textContent = data.nombre || 'Objeto Desconocido';
  resCategory.textContent = data.categoria || 'General';
  resConfidence.textContent = `${data.confianza || '95'}%`;
  resDescription.textContent = data.descripcion || 'Sin descripción disponible.';
  resFunFact.textContent = data.datoCurioso || 'No se dispone de más información.';

  resTags.innerHTML = '';
  const tags = data.elementosSecundarios || [];

  if (!tags.length) {
    resTags.innerHTML = '<span class="text-xs text-gray-500 italic">Ninguno especificado</span>';
    return;
  }

  tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = 'px-2.5 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 border border-gray-700 hover:border-cyan-500/50 transition-colors';
    span.textContent = tag;
    resTags.appendChild(span);
  });
}

function speakResult() {
  if (!currentAnalysisData || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(
    `Detectado: ${currentAnalysisData.nombre}. Categoría: ${currentAnalysisData.categoria}. ${currentAnalysisData.descripcion}`
  );
  utterance.lang = 'es-ES';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function saveToHistory(data, imageUri) {
  let history = JSON.parse(localStorage.getItem('vision_history') || '[]');

  const newItem = {
    id: Date.now(),
    nombre: data.nombre,
    categoria: data.categoria,
    descripcion: data.descripcion,
    datoCurioso: data.datoCurioso,
    confianza: data.confianza,
    elementosSecundarios: data.elementosSecundarios,
    imageUri,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  history.unshift(newItem);
  if (history.length > 10) history.pop();

  localStorage.setItem('vision_history', JSON.stringify(history));
  renderHistoryCards(history);
}

function loadHistoryFromStorage() {
  const history = JSON.parse(localStorage.getItem('vision_history') || '[]');
  renderHistoryCards(history);
}

function renderHistoryCards(history) {
  historyContainer.innerHTML = '';
  historyCount.textContent = `${history.length} guardados`;

  if (!history.length) {
    historyContainer.appendChild(emptyHistoryText);
    return;
  }

  history.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'glass-card min-w-[140px] max-w-[140px] p-2 rounded-2xl flex-shrink-0 cursor-pointer snap-start relative group';
    card.onclick = () => {
      currentAnalysisData = item;
      displayResult(item);
    };

    card.innerHTML = `
      <div class="relative h-20 w-full rounded-xl overflow-hidden mb-2 bg-gray-900">
        <img src="${item.imageUri}" alt="${item.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://placehold.co/200x200/1e293b/06b6d4?text=Vision'">
        <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-cyan-300 font-mono backdrop-blur-sm">${item.timestamp}</span>
      </div>
      <h5 class="text-xs font-bold text-gray-200 truncate">${item.nombre}</h5>
      <p class="text-[10px] text-gray-400 truncate">${item.categoria}</p>
    `;

    historyContainer.appendChild(card);
  });
}

function clearHistory() {
  if (!confirm('¿Deseas borrar el historial de detecciones guardadas?')) return;
  localStorage.removeItem('vision_history');
  loadHistoryFromStorage();
}

