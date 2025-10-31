// Motore audio avanzato per Hardcore/Gabber
class HardcoreAudioEngine {
    constructor() {
        this.audioContext = null;
        this.samples = {};
        this.isPlaying = false;
        this.currentBPM = 180;
        this.scheduleAheadTime = 0.1;
        this.nextNoteTime = 0.0;
        this.timerID = null;
        this.sequence = [];
        this.activeTracks = {
            kick: [],
            bass: [],
            synth: [],
            fx: []
        };
    }

    // Inizializza l'audio context
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSamples();
            console.log('Audio engine inizializzato');
            return true;
        } catch (error) {
            console.error('Errore inizializzazione audio:', error);
            return false;
        }
    }

    // Carica i campioni audio
    async loadSamples() {
        const sampleList = [
            // Kicks
            { name: 'kick1', url: 'samples/kick1.wav' },
            { name: 'kick2', url: 'samples/kick2.wav' },
            { name: 'kick3', url: 'samples/kick3.wav' },
            
            // Bass
            { name: 'bass1', url: 'samples/bass1.wav' },
            { name: 'bass2', url: 'samples/bass2.wav' },
            
            // Synths
            { name: 'synth1', url: 'samples/synth1.wav' },
            { name: 'synth2', url: 'samples/synth2.wav' },
            
            // FX
            { name: 'fx1', url: 'samples/fx1.wav' },
            { name: 'fx2', url: 'samples/fx2.wav' },
            { name: 'fx3', url: 'samples/fx3.wav' }
        ];

        for (const sample of sampleList) {
            try {
                this.samples[sample.name] = await this.loadSample(sample.url);
            } catch (error) {
                console.warn(`Campione ${sample.name} non caricato:`, error);
                // Crea un campione sintetico di fallback
                this.samples[sample.name] = this.createFallbackSample(sample.name);
            }
        }
    }

    // Carica un singolo campione
    async loadSample(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    // Crea campioni sintetici di fallback
    createFallbackSample(type) {
        const duration = type.includes('kick') ? 0.2 : 1.0;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        if (type.includes('kick')) {
            // Kick sintetico
            for (let i = 0; i < data.length; i++) {
                const t = i / buffer.sampleRate;
                data[i] = Math.sin(2 * Math.PI * 100 * Math.exp(-10 * t)) * Math.exp(-5 * t);
            }
        } else if (type.includes('bass')) {
            // Bass sintetico
            for (let i = 0; i < data.length; i++) {
                const t = i / buffer.sampleRate;
                data[i] = Math.sin(2 * Math.PI * 50 * t) * Math.exp(-0.5 * t);
            }
        } else {
            // Synth/FX sintetico
            for (let i = 0; i < data.length; i++) {
                const t = i / buffer.sampleRate;
                data[i] = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-0.2 * t);
            }
        }
        
        return buffer;
    }

    // Riproduci un campione con effetti
    playSample(sampleName, options = {}) {
        if (!this.samples[sampleName]) {
            console.warn(`Campione ${sampleName} non trovato`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.samples[sampleName];

        // Crea nodi per gli effetti
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const distortion = this.audioContext.createWaveShaper();

        // Configura distorsione
        distortion.curve = this.makeDistortionCurve(options.distortion || 30);
        distortion.oversample = '4x';

        // Configura filtro
        filter.type = 'lowpass';
        filter.frequency.value = options.filterFreq || 2000;

        // Configura volume
        gainNode.gain.value = (options.volume || 80) / 100;

        // Connessioni
        source.connect(distortion);
        distortion.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Pitch/velocità
        if (options.speed) {
            source.playbackRate.value = options.speed / 100;
        }

        source.start();
        return source;
    }

    // Crea curva di distorsione
    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    // Aggiungi traccia alla sequenza
    addToSequence(sampleName, position, options = {}) {
        this.sequence.push({
            sample: sampleName,
            time: position,
            options: options
        });
    }

    // Avvia la riproduzione
    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.nextNoteTime = this.audioContext.currentTime;
        this.scheduler();
    }

    // Ferma la riproduzione
    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
        }
    }

    // Scheduler per la sequenza
    scheduler() {
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.nextNoteTime);
            this.nextNoteTime += 60.0 / this.currentBPM;
        }

        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), 50);
        }
    }

    // Programma una nota
    scheduleNote(time) {
        // Implementa la logica della sequenza qui
        // Per ora riproduci un kick ogni battito
        if (Math.random() > 0.5) {
            this.playSample('kick1', { volume: 80 });
        }
    }

    // Processa file audio caricato
    async processUploadedAudio(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            return {
                buffer: audioBuffer,
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate
            };
        } catch (error) {
            console.error('Errore processamento audio:', error);
            throw error;
        }
    }

    // Applica effetti a un buffer audio
    applyEffects(audioBuffer, effects = {}) {
        return new Promise((resolve) => {
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            // Chain effetti
            const gainNode = offlineContext.createGain();
            const filter = offlineContext.createBiquadFilter();
            const distortion = offlineContext.createWaveShaper();

            // Configura effetti
            gainNode.gain.value = (effects.bass || 50) / 50; // Boost bassi
            distortion.curve = this.makeDistortionCurve(effects.distortion || 40);
            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            // Connessioni
            source.connect(distortion);
            distortion.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(offlineContext.destination);

            // Render
            source.start();
            offlineContext.startRendering().then(renderedBuffer => {
                resolve(renderedBuffer);
            });
        });
    }
}
