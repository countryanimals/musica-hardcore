// Applicazione principale
class HardcoreMusicApp {
    constructor() {
        this.audioEngine = new HardcoreAudioEngine();
        this.currentSection = 'creator';
        this.uploadedAudio = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        // Mostra loading
        this.showLoading('Inizializzazione audio...');
        
        try {
            // Inizializza motore audio
            const success = await this.audioEngine.init();
            
            if (success) {
                this.setupEventListeners();
                this.setupSampleLibrary();
                this.isInitialized = true;
                console.log('App inizializzata con successo');
            } else {
                this.showError('Impossibile inizializzare audio. Usa Chrome o Firefox.');
            }
        } catch (error) {
            console.error('Errore inizializzazione app:', error);
            this.showError('Errore di inizializzazione: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    setupEventListeners() {
        // Navigazione
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Controlli audio
        document.getElementById('play-btn').addEventListener('click', () => {
            this.playCreator();
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopAudio();
        });

        document.getElementById('remix-play-btn').addEventListener('click', () => {
            this.playRemix();
        });

        // Upload file
        document.getElementById('upload-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop
        const uploadArea = document.getElementById('upload-area');
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleFileUpload(e.dataTransfer.files[0]);
        });

        // Aggiorna controlli in tempo reale
        this.setupRealTimeControls();
    }

    setupSampleLibrary() {
        // Popola la libreria campioni dinamicamente
        const sampleLibrary = document.querySelector('.sample-library');
        
        const sampleData = [
            { name: 'kick1', display: 'KICK 1', type: 'kick' },
            { name: 'kick2', display: 'KICK 2', type: 'kick' },
            { name: 'kick3', display: 'KICK 3', type: 'kick' },
            { name: 'bass1', display: 'BASS 1', type: 'bass' },
            { name: 'bass2', display: 'BASS 2', type: 'bass' },
            { name: 'synth1', display: 'SYNTH 1', type: 'synth' },
            { name: 'synth2', display: 'SYNTH 2', type: 'synth' },
            { name: 'fx1', display: 'FX RISER', type: 'fx' },
            { name: 'fx2', display: 'FX DOWN', type: 'fx' },
            { name: 'fx3', display: 'FX REVERSE', type: 'fx' }
        ];

        sampleLibrary.innerHTML = '';
        sampleData.forEach(sample => {
            const sampleElement = document.createElement('div');
            sampleElement.className = `sample ${sample.type}`;
            sampleElement.textContent = sample.display;
            sampleElement.dataset.sample = sample.name;
            
            sampleElement.addEventListener('click', () => {
                this.playSample(sample.name);
                this.animateSample(sampleElement);
            });
            
            sampleLibrary.appendChild(sampleElement);
        });
    }

    setupRealTimeControls() {
        // Controlli sezione creator
        const controls = [
            { id: 'kick-volume', param: 'volume', min: 0, max: 100 },
            { id: 'bass-volume', param: 'volume', min: 0, max: 100 },
            { id: 'bpm', param: 'bpm', min: 140, max: 220 },
            { id: 'distortion', param: 'distortion', min: 0, max: 100 }
        ];

        controls.forEach(control => {
            const slider = document.getElementById(control.id);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.updateAudioParams();
                });
            }
        });

        // Controlli sezione remix
        const remixControls = [
            { id: 'remix-bass', param: 'bass' },
            { id: 'remix-speed', param: 'speed' },
            { id: 'remix-bpm', param: 'bpm' },
            { id: 'remix-distortion', param: 'distortion' }
        ];

        remixControls.forEach(control => {
            const slider = document.getElementById(control.id);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.updateRemixParams();
                });
            }
        });
    }

    playSample(sampleName) {
        if (!this.isInitialized) return;

        const options = {
            volume: parseInt(document.getElementById('kick-volume').value),
            distortion: parseInt(document.getElementById('distortion').value),
            speed: 100
        };

        this.audioEngine.playSample(sampleName, options);
    }

    animateSample(element) {
        element.style.transform = 'scale(0.9)';
        element.style.backgroundColor = 'var(--primary)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.backgroundColor = '';
        }, 100);
    }

    async playCreator() {
        if (!this.isInitialized) return;
        
        this.audioEngine.start();
        document.querySelector('.visualizer').classList.add('pulsing');
    }

    stopAudio() {
        this.audioEngine.stop();
        document.querySelector('.visualizer').classList.remove('pulsing');
    }

    async playRemix() {
        if (!this.uploadedAudio) {
            alert('Prima carica un file audio!');
            return;
        }

        // Implementa la riproduzione del remix
        console.log('Riproduzione remix con effetti applicati');
    }

    async handleFileUpload(file) {
        if (!file) return;

        this.showLoading('Processamento file...');
        
        try {
            this.uploadedAudio = await this.audioEngine.processUploadedAudio(file);
            document.querySelector('#upload-area p').textContent = `File pronto: ${file.name}`;
            console.log('File processato:', this.uploadedAudio);
        } catch (error) {
            alert('Errore nel processamento del file: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Aggiorna UI
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });

        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        document.getElementById(section).classList.add('active');
    }

    updateAudioParams() {
        // Aggiorna parametri audio in tempo reale
        this.audioEngine.currentBPM = parseInt(document.getElementById('bpm').value);
    }

    updateRemixParams() {
        // Aggiorna parametri remix in tempo reale
        if (this.uploadedAudio) {
            // Qui applicheresti gli effetti al file caricato
        }
    }

    showLoading(message) {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `<div>${message}</div>`;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        overlay.querySelector('div').textContent = message;
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        alert('ERRORE: ' + message);
    }
}

// Inizializza l'app quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    window.hardcoreApp = new HardcoreMusicApp();
});
