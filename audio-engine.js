// Motore audio avanzato per Hardcore/Gabber con effetti in tempo reale
class HardcoreAudioEngine {
    constructor() {
        this.audioContext = null;
        this.samples = {};
        this.isPlaying = false;
        this.currentBPM = 180;
        this.analyser = null;
        this.audioData = null;
        this.audioSource = null;
        this.gainNode = null;
        this.filterNode = null;
        this.distortionNode = null;
        this.bassBoostNode = null;
        this.pitchShift = null;
        this.playbackRate = 1.0;
        
        // Campioni gratuiti hardcore/gabber da internet
        this.sampleUrls = {
            // Kicks Hardcore
            'kick1': 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_Enthusiast/Enthusiast_-_04_-_Hard_Kick_Drum_2.mp3',
            'kick2': 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Yung_Kartz/Lead_Synth/Yung_Kartz_-_Lead_Synth_-_04_Hard_Kick.mp3',
            'kick3': 'https://cdn.freesound.org/previews/571/571942_11861866-lq.mp3',
            
            // Bass distorts
            'bass1': 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Enrique_Martinez/IDM_Electronic_Experiment/Enrique_Martinez_-_IDM_Electronic_Experiment_-_07_Distorted_Bass.mp3',
            'bass2': 'https://cdn.freesound.org/previews/685/685650_14025725-lq.mp3',
            
            // Synths
            'synth1': 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/TRG_Banks/Breakcore_DrillnBass_DnB_Sample_Pack_Vol3/TRG_Banks_-_Breakcore_DrillnBass_DnB_Sample_Pack_Vol3_-_08_Hardcore_Synth_Lead_C.mp3',
            'synth2': 'https://cdn.freesound.org/previews/612/612609_11861866-lq.mp3',
            
            // FX
            'hoover': 'https://cdn.freesound.org/previews/351/351619_6337830-lq.mp3',
            'fx1': 'https://cdn.freesound.org/previews/612/612625_11861866-lq.mp3',
            'fx2': 'https://cdn.freesound.org/previews/612/612627_11861866-lq.mp3'
        };
    }

    // Inizializza l'audio context
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setupAudioNodes();
            await this.loadSamples();
            console.log('Audio engine inizializzato con successo');
            return true;
        } catch (error) {
            console.error('Errore inizializzazione audio:', error);
            return false;
        }
    }

    // Configura i nodi audio per gli effetti
    setupAudioNodes() {
        this.gainNode = this.audioContext.createGain();
        this.filterNode = this.audioContext.createBiquadFilter();
        this.distortionNode = this.audioContext.createWaveShaper();
        this.analyser = this.audioContext.createAnalyser();
        
        // Configura analyser per il visualizzatore
        this.analyser.fftSize = 256;
        this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Connessione base per effetti
        this.filterNode.connect(this.distortionNode);
        this.distortionNode.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    // Carica i campioni audio da URL
    async loadSamples() {
        const samplePromises = Object.entries(this.sampleUrls).map(async ([name, url]) => {
            try {
                console.log(`Caricamento campione: ${name}`);
                this.samples[name] = await this.loadSampleFromUrl(url);
            } catch (error) {
                console.warn(`Campione ${name} non caricato:`, error);
                // Crea campione di fallback
                this.samples[name] = this.createFallbackSample(name);
            }
        });

        await Promise.all(samplePromises);
        console.log('Tutti i campioni caricati');
    }

    // Carica un campione da URL
    async loadSampleFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error(`Errore caricamento ${url}:`, error);
            throw error;
        }
    }

    // Crea campioni sintetici di fallback
    createFallbackSample(type) {
        const duration = type.includes('kick') ? 0.1 : type.includes('bass') ? 0.5 : 1.0;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        if (type.includes('kick')) {
            // Kick sintetico hardcore
            for (let i = 0; i < data.length; i++) {
                const t = i / buffer.sampleRate;
                const freq = 100 * Math.exp(-40 * t);
                data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-30 * t);
            }
        } else if (type.includes('bass')) {
            // Bass sintetico distorto
            for (let i = 0; i < data.length; i++) {
                const t = i / buffer.sampleRate;
                data[i] = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-2 * t) * 0.7;
                // Aggiungi armoniche
                data[i] += Math.sin(2 * Math.PI * 120 * t) * Math.exp(-3 * t) * 0.3;
            }
        } else {
            // Synth/FX sintetico
            for (let i = 0; i < data.length; i++) {
                const t = i / buffer.sampleRate;
                data[i] = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-0.5 * t) * 0.5;
                data[i] += Math.sin(2 * Math.PI * 400 * t) * Math.exp(-0.7 * t) * 0.3;
            }
        }
        
        return buffer;
    }

    // Riproduci un campione con effetti
    playSample(sampleName, options = {}) {
        if (!this.samples[sampleName]) {
            console.warn(`Campione ${sampleName} non trovato`);
            return null;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.samples[sampleName];

        // Crea una nuova chain di effetti per ogni campione
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const distortion = this.audioContext.createWaveShaper();

        // Configura effetti
        distortion.curve = this.makeDistortionCurve(options.distortion || 30);
        distortion.oversample = '4x';
        
        filter.type = 'lowpass';
        filter.frequency.value = options.filterFreq || 2000;
        
        gainNode.gain.value = (options.volume || 80) / 100;

        // Pitch/velocità
        if (options.speed) {
            source.playbackRate.value = options.speed / 100;
        }

        // Connessioni
        source.connect(distortion);
        distortion.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start();
        return source;
    }

    // Carica e riproduci un file audio con effetti in tempo reale
    async loadAndPlayAudioFile(file, effects = {}) {
        try {
            // Ferma riproduzione precedente
            if (this.audioSource) {
                this.audioSource.stop();
            }

            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = audioBuffer;

            // Applica effetti in tempo reale
            this.applyRealTimeEffects(effects);

            // Connessione alla chain principale
            this.audioSource.connect(this.filterNode);
            
            this.audioSource.start();
            this.isPlaying = true;

            return {
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                channels: audioBuffer.numberOfChannels
            };

        } catch (error) {
            console.error('Errore caricamento file:', error);
            throw error;
        }
    }

    // Applica effetti in tempo reale al file caricato
    applyRealTimeEffects(effects = {}) {
        if (!this.audioSource) return;

        // Velocità/BPM
        this.audioSource.playbackRate.value = (effects.speed || 100) / 100;

        // Distorsione
        this.distortionNode.curve = this.makeDistortionCurve(effects.distortion || 0);

        // Filtro per i bassi
        this.filterNode.frequency.value = effects.filterFreq || 2000;
        
        // Volume
        this.gainNode.gain.value = (effects.volume || 100) / 100;

        // Boost bassi (usando un filtro peaking)
        if (effects.bass) {
            this.filterNode.type = 'lowshelf';
            this.filterNode.frequency.value = 250;
            this.filterNode.gain.value = (effects.bass - 100) / 50;
        }
    }

    // Ferma la riproduzione
    stopPlayback() {
        if (this.audioSource && this.isPlaying) {
            this.audioSource.stop();
            this.isPlaying = false;
        }
    }

    // Aggiorna effetti in tempo reale
    updateEffects(effects) {
        this.applyRealTimeEffects(effects);
    }

    // Ottieni dati per il visualizzatore
    getVisualizerData() {
        if (this.analyser && this.isPlaying) {
            this.analyser.getByteFrequencyData(this.audioData);
            return this.audioData;
        }
        return null;
    }

    // Crea curva di distorsione
    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount * 10 : 300;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    // Esporta audio (simulato - in produzione usa una libreria)
    async exportAudio() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    url: 'blob:simulated-export',
                    format: 'wav',
                    size: '3.2 MB'
                });
            }, 1000);
        });
    }
}
