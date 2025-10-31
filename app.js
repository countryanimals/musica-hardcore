// Applicazione principale con controllo audio completo
class HardcoreMusicApp {
    constructor() {
        this.audioEngine = new HardcoreAudioEngine();
        this.currentSection = 'creator';
        this.uploadedAudio = null;
        this.isInitialized = false;
        this.isRemixPlaying = false;
        this.currentEffects = {
            bass: 100,
            speed: 100,
            bpm: 140,
            distortion: 0,
            pitch: 0,
            volume: 100
        };
        
        this.visualizerInterval = null;
        this.meterInterval = null;
        
        this.init();
    }

    async init() {
        this.showLoading('Inizializzazione audio...');
        
        try {
            const success = await this.audioEngine.init();
            
            if (success) {
                this.setupEventListeners();
                this.setupSampleLibrary();
                this.startVisualizers();
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

        // Controlli creator
        document.getElementById('play-btn').addEventListener('click', () => {
            this.playCreator();
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopAudio();
        });

        // Controlli remix
        document.getElementById('remix-play-btn').addEventListener('click', () => {
            this.toggleRemixPlayback();
        });

        document.getElementById('remix-stop-btn').addEventListener('click', () => {
            this.stopRemix();
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
        uploadArea.addEventListener('dragover', (e) => e.preventDefault());
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleFileUpload(e.dataTransfer.files[0]);
        });

        // Salvataggio
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveCreatorTrack();
        });

        document.getElementById('remix-save-btn').addEventListener('click', () => {
            this.saveRemixTrack();
        });

        // Controlli in tempo reale
        this.setupRealTimeControls();
        
        // Qualità esportazione
        this.setupExportOptions();
    }

    setupRealTimeControls() {
        // Mappa dei controlli remix
        const remixControls = [
            { id: 'remix-bass', key: 'bass', format: (val) => `${val}%` },
            { id: 'remix-speed', key: 'speed', format: (val) => `${val}%` },
            { id: 'remix-bpm', key: 'bpm', format: (val) => `${val} BPM` },
            { id: 'remix-distortion', key: 'distortion', format: (val) => `${val}%` },
            { id: 'remix-pitch', key: 'pitch', format: (val) => `${val} semitoni` },
            { id: 'remix-volume', key: 'volume', format: (val) => `${val}%` }
        ];

        remixControls.forEach(control => {
            const slider = document.getElementById(control.id);
            const display = slider.nextElementSibling;
            
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.currentEffects[control.key] = value;
                display.textContent = control.format(value);
                
                // Applica effetti in tempo reale se la traccia è in riproduzione
                if (this.isRemixPlaying) {
                    this.audioEngine.updateEffects(this.currentEffects);
                }
            });
        });
    }

    setupExportOptions() {
        document.querySelectorAll('.quality-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.quality-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.classList.add('selected');
            });
        });
    }

    setupSampleLibrary() {
        const sampleLibrary = document.querySelector('.sample-library');
        
        const sampleData = [
            { name: 'kick1', display: 'KICK HARDCORE', type: 'kick' },
            { name: 'kick2', display: 'KICK DISTORTO', type: 'kick' },
            { name: 'kick3', display: 'KICK PESANTE', type: 'kick' },
            { name: 'bass1', display: 'BASS ACIDO', type: 'bass' },
            { name: 'bass2', display: 'BASS HOOVER', type: 'bass' },
            { name: 'synth1', display: 'SYNTH LEAD', type: 'synth' },
            { name: 'synth2', display: 'SYNTH ACID', type: 'synth' },
            { name: 'hoover', display: 'HOOVER', type: 'fx' },
            { name: 'fx1', display: 'FX RISER', type: 'fx' },
            { name: 'fx2', display: 'FX IMPACT', type: 'fx' }
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

    playSample(sampleName) {
        if (!this.isInitialized) return;

        const options = {
            volume: parseInt(document.getElementById('kick-volume').value),
            distortion: parseInt(document.getElementById('distortion').value),
            speed: 100
        };

        this.audioEngine.playSample(sampleName, options);
    }

    async playCreator() {
        if (!this.isInitialized) return;
        
        // Simula una sequenza hardcore
        this.playSample('kick1');
        setTimeout(() => this.playSample('kick2'), 250);
        setTimeout(() => this.playSample('bass1'), 500);
        
        document.querySelector('.visualizer').classList.add('pulsing');
    }

    stopAudio() {
        this.audioEngine.stopPlayback();
        document.querySelector('.visualizer').classList.remove('pulsing');
    }

    async toggleRemixPlayback() {
        if (!this.uploadedAudio) {
            alert('Prima carica un file audio!');
            return;
        }

        if (this.isRemixPlaying) {
            this.stopRemix();
        } else {
            await this.playRemix();
        }
    }

    async playRemix() {
        try {
            this.showLoading('Avvio riproduzione...');
            
            await this.audioEngine.loadAndPlayAudioFile(this.uploadedAudio, this.currentEffects);
            this.isRemixPlaying = true;
            
            document.getElementById('remix-play-btn').textContent = 'PAUSA';
            document.querySelector('#remix-visualizer').classList.add('pulsing');
            
            this.startAudioMeter();
            
        } catch (error) {
            this.showError('Errore riproduzione: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    stopRemix() {
        this.audioEngine.stopPlayback();
        this.isRemixPlaying = false;
        
        document.getElementById('remix-play-btn').textContent = 'PLAY REMIX';
        document.querySelector('#remix-visualizer').classList.remove('pulsing');
        
        this.stopAudioMeter();
    }

    async handleFileUpload(file) {
        if (!file || !file.type.includes('audio')) {
            alert('Per favore carica un file audio valido!');
            return;
        }

        this.showLoading('Analisi file audio...');
        
        try {
            this.uploadedAudio = file;
            
            // Analizza il file
            const audioInfo = await this.analyzeAudioFile(file);
            this.displayTrackInfo(audioInfo);
            
            document.querySelector('#upload-area p').textContent = `File pronto: ${file.name}`;
            document.getElementById('track-info').style.display = 'block';
            
            console.log('File analizzato:', audioInfo);
            
        } catch (error) {
            alert('Errore nell\'analisi del file: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async analyzeAudioFile(file) {
        return new Promise((resolve) => {
            const audio = new Audio();
            const url = URL.createObjectURL(file);
            
            audio.addEventListener('loadedmetadata', () => {
                resolve({
                    name: file.name,
                    duration: this.formatTime(audio.duration),
                    size: this.formatFileSize(file.size),
                    type: file.type,
                    bitrate: this.calculateBitrate(file.size, audio.duration)
                });
                
                URL.revokeObjectURL(url);
            });
            
            audio.src = url;
        });
    }

    displayTrackInfo(info) {
        const details = document.getElementById('track-details');
        details.innerHTML = `
            <p><strong>Nome:</strong> ${info.name}</p>
            <p><strong>Durata:</strong> ${info.duration}</p>
            <p><strong>Dimensione:</strong> ${info.size}</p>
            <p><strong>Tipo:</strong> ${info.type}</p>
            <p><strong>Bitrate stimato:</strong> ${info.bitrate} kbps</p>
        `;
    }

    startVisualizers() {
        this.visualizerInterval = setInterval(() => {
            this.updateVisualizers();
        }, 50);
    }

    updateVisualizers() {
        const data = this.audioEngine.getVisualizerData();
        if (!data) return;

        this.drawVisualizer('visualizer', data, '#ff0066');
        this.drawVisualizer('remix-visualizer', data, '#00ffcc');
    }

    drawVisualizer(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Disegna le barre del visualizzatore
        const barWidth = width / data.length;
        ctx.fillStyle = color;

        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / 255) * height;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
    }

    startAudioMeter() {
        this.meterInterval = setInterval(() => {
            this.updateAudioMeter();
        }, 100);
    }

    stopAudioMeter() {
        if (this.meterInterval) {
            clearInterval(this.meterInterval);
            document.getElementById('meter-level').style.width = '0%';
        }
    }

    updateAudioMeter() {
        const data = this.audioEngine.getVisualizerData();
        if (!data) return;

        // Calcola il livello medio
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        const level = (average / 255) * 100;

        document.getElementById('meter-level').style.width = level + '%';
    }

    animateSample(element) {
        element.style.transform = 'scale(0.9)';
        element.style.backgroundColor = 'var(--primary)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.backgroundColor = '';
        }, 100);
    }

    switchSection(section) {
        this.currentSection = section;
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });

        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        document.getElementById(section).classList.add('active');
    }

    async saveCreatorTrack() {
        this.showLoading('Esportazione traccia...');
        
        try {
            const result = await this.audioEngine.exportAudio();
            this.showSuccess(`Traccia esportata con successo! (${result.format.toUpperCase()})`);
        } catch (error) {
            this.showError('Errore nell\'esportazione: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async saveRemixTrack() {
        if (!this.uploadedAudio) {
            alert('Prima carica un file audio da remixare!');
            return;
        }

        this.showLoading('Esportazione remix...');
        
        try {
            const quality = document.querySelector('.quality-option.selected').dataset.quality;
            const result = await this.audioEngine.exportAudio();
            this.showSuccess(`Remix esportato in ${quality.toUpperCase()}!`);
        } catch (error) {
            this.showError('Errore nell\'esportazione: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // Utility functions
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    calculateBitrate(sizeInBytes, durationInSeconds) {
        return Math.round((sizeInBytes * 8) / (durationInSeconds * 1000));
    }

    showLoading(message) {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `<div>${message}</div>`;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        alert('❌ ' + message);
    }

    showSuccess(message) {
        alert('✅ ' + message);
    }
}

// Inizializza l'app
document.addEventListener('DOMContentLoaded', () => {
    window.hardcoreApp = new HardcoreMusicApp();
});
