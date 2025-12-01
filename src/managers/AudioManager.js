/**
 * AudioManager - Singleton para gerir audio do jogo
 * Usa Web Audio API para gerar sons programaticamente
 */

class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initialized = false;
    }

    /**
     * Inicializar contexto de audio (deve ser chamado apos interacao do user)
     */
    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API nao suportada');
            this.enabled = false;
        }
    }

    /**
     * Retomar contexto se suspenso
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Definir volume (0-1)
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // ═══════════════════════════════════════════════════════════
    // SONS DO JOGO
    // ═══════════════════════════════════════════════════════════

    /**
     * Som de apanhar item (coin sound - alegre)
     */
    playCollect() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        // Oscilador 1 - nota alta
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587, now);      // D5
        osc1.frequency.setValueAtTime(880, now + 0.08); // A5

        gain1.gain.setValueAtTime(this.volume * 0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc1.start(now);
        osc1.stop(now + 0.2);

        // Oscilador 2 - harmonia
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(784, now + 0.05); // G5

        gain2.gain.setValueAtTime(this.volume * 0.2, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc2.start(now + 0.05);
        osc2.stop(now + 0.15);
    }

    /**
     * Som de salto (boing)
     */
    playJump() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * Som de dano (impacto grave)
     */
    playHit() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        // Noise burst
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);

        // Tom grave
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

        oscGain.gain.setValueAtTime(this.volume * 0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    /**
     * Som de morte (triste, descendente)
     */
    playDeath() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        const notes = [392, 349, 311, 261]; // G4 -> F4 -> Eb4 -> C4
        const duration = 0.2;

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const startTime = now + i * duration;
            gain.gain.setValueAtTime(this.volume * 0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    /**
     * Som de vitoria (fanfarra alegre)
     */
    playVictory() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        const notes = [523, 659, 784, 1047]; // C5 -> E5 -> G5 -> C6
        const duration = 0.15;

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.value = freq;

            const startTime = now + i * duration;
            gain.gain.setValueAtTime(this.volume * 0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 1.5);

            osc.start(startTime);
            osc.stop(startTime + duration * 1.5);
        });

        // Nota final sustentada
        const finalOsc = ctx.createOscillator();
        const finalGain = ctx.createGain();
        finalOsc.connect(finalGain);
        finalGain.connect(ctx.destination);

        finalOsc.type = 'sine';
        finalOsc.frequency.value = 1047; // C6

        const finalStart = now + notes.length * duration;
        finalGain.gain.setValueAtTime(this.volume * 0.3, finalStart);
        finalGain.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.5);

        finalOsc.start(finalStart);
        finalOsc.stop(finalStart + 0.5);
    }

    /**
     * Som de nivel completo (fanfarra curta)
     */
    playLevelComplete() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        const notes = [392, 523, 659]; // G4 -> C5 -> E5

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + i * 0.1;
            gain.gain.setValueAtTime(this.volume * 0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    /**
     * Som de boss hit (impacto + crack)
     */
    playBossHit() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        // Impacto
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.exponentialRampToValueAtTime(50, now + 0.1);

        gain1.gain.setValueAtTime(this.volume * 0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc1.start(now);
        osc1.stop(now + 0.15);

        // Crack (noise burst)
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = this.volume * 0.3;

        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now + 0.05);
    }

    /**
     * Som de derrota do boss (explosao + vitoria)
     */
    playBossDefeat() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        // Explosao
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(this.volume * 0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);

        // Fanfarra de vitoria apos explosao
        setTimeout(() => this.playVictory(), 600);
    }

    /**
     * Som de click de botao
     */
    playClick() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = 600;

        gain.gain.setValueAtTime(this.volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    /**
     * Som de combo (arpejo rapido)
     */
    playCombo(multiplier = 2) {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        const baseNotes = multiplier >= 3 ? [523, 659, 784, 1047] : [523, 659, 784];

        baseNotes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + i * 0.05;
            gain.gain.setValueAtTime(this.volume * 0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            osc.start(startTime);
            osc.stop(startTime + 0.1);
        });
    }

    /**
     * Som de inicio de jogo
     */
    playGameStart() {
        if (!this.enabled || !this.context) return;
        this.resume();

        const ctx = this.context;
        const now = ctx.currentTime;

        // Arpejo ascendente
        const notes = [262, 330, 392, 523]; // C4 -> E4 -> G4 -> C5

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(this.volume * 0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }
}

// Singleton
const audioManager = new AudioManager();
export default audioManager;
