// Gestione navigazione tra sezioni
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Rimuovi classe active da tutti i pulsanti
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Aggiungi classe active al pulsante cliccato
        this.classList.add('active');
        
        // Nascondi tutte le sezioni
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostra la sezione corrispondente
        const sectionId = this.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Gestione slider con display valori
document.querySelectorAll('input[type="range"]').forEach(slider => {
    const display = slider.nextElementSibling;
    
    // Aggiorna display al caricamento
    updateDisplay(slider, display);
    
    // Aggiorna display al cambiamento
    slider.addEventListener('input', function() {
        updateDisplay(this, display);
    });
});

function updateDisplay(slider, display) {
    if (slider.id.includes('bpm')) {
        display.textContent = `${slider.value} BPM`;
    } else {
        display.textContent = `${slider.value}%`;
    }
}

// Gestione campioni audio
document.querySelectorAll('.sample').forEach(sample => {
    sample.addEventListener('click', function() {
        const sampleName = this.getAttribute('data-sample');
        playSample(sampleName);
    });
});

function playSample(sampleName) {
    // Simulazione riproduzione campione
    console.log(`Riproduzione campione: ${sampleName}`);
    
    // In un'implementazione reale, qui si riprodurrebbe il campione audio
    // usando l'API Web Audio o una libreria come Tone.js
}

// Gestione upload file
document.getElementById('upload-btn').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        const fileName = this.files[0].name;
        document.querySelector('#upload-area p').textContent = `File caricato: ${fileName}`;
        
        // In un'implementazione reale, qui si processerebbe il file audio
        console.log(`File caricato: ${fileName}`);
    }
});

// Gestione drag and drop
const uploadArea = document.getElementById('upload-area');

uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.backgroundColor = 'rgba(0, 255, 204, 0.2)';
});

uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.style.backgroundColor = '';
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.backgroundColor = '';
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        document.querySelector('#upload-area p').textContent = `File caricato: ${file.name}`;
        
        // In un'implementazione reale, qui si processerebbe il file audio
        console.log(`File caricato via drag & drop: ${file.name}`);
    }
});

// Simulazione visualizzatore audio
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

function drawVisualizer() {
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Simulazione onde audio
    ctx.fillStyle = '#ff0066';
    ctx.beginPath();
    
    for (let i = 0; i < width; i++) {
        const y = Math.sin(i * 0.05 + Date.now() * 0.01) * 20 + height / 2;
        ctx.lineTo(i, y);
    }
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    requestAnimationFrame(drawVisualizer);
}

// Inizializza visualizzatore
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
drawVisualizer();

// Simulazione visualizzatore remix
const remixCanvas = document.getElementById('remix-visualizer');
const remixCtx = remixCanvas.getContext('2d');

function drawRemixVisualizer() {
    const width = remixCanvas.width;
    const height = remixCanvas.height;
    
    remixCtx.clearRect(0, 0, width, height);
    
    // Simulazione onde audio
    remixCtx.fillStyle = '#00ffcc';
    remixCtx.beginPath();
    
    for (let i = 0; i < width; i++) {
        const y = Math.sin(i * 0.03 + Date.now() * 0.008) * 25 + height / 2;
        remixCtx.lineTo(i, y);
    }
    
    remixCtx.lineTo(width, height);
    remixCtx.lineTo(0, height);
    remixCtx.closePath();
    remixCtx.fill();
    
    requestAnimationFrame(drawRemixVisualizer);
}

// Inizializza visualizzatore remix
remixCanvas.width = remixCanvas.offsetWidth;
remixCanvas.height = remixCanvas.offsetHeight;
drawRemixVisualizer();

// Gestione pulsanti play/stop
document.getElementById('play-btn').addEventListener('click', function() {
    console.log('Riproduzione traccia principale');
    // In un'implementazione reale, qui si avvierebbe la riproduzione audio
});

document.getElementById('stop-btn').addEventListener('click', function() {
    console.log('Stop traccia principale');
    // In un'implementazione reale, qui si fermerebbe la riproduzione audio
});

document.getElementById('remix-play-btn').addEventListener('click', function() {
    console.log('Riproduzione remix');
    // In un'implementazione reale, qui si avvierebbe la riproduzione audio remixata
});

document.getElementById('remix-stop-btn').addEventListener('click', function() {
    console.log('Stop remix');
    // In un'implementazione reale, qui si fermerebbe la riproduzione audio remixata
});

// Gestione salvataggio
document.getElementById('save-btn').addEventListener('click', function() {
    alert('Traccia salvata! (simulazione)');
    // In un'implementazione reale, qui si esporterebbe il file audio
});

document.getElementById('remix-save-btn').addEventListener('click', function() {
    alert('Remix salvato! (simulazione)');
    // In un'implementazione reale, qui si esporterebbe il file audio remixato
});
