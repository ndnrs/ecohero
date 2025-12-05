/**
 * AudioManager - Singleton para gerir audio do jogo
 * Usa Web Audio API para gerar sons programaticamente
 * Inclui sistema de musica de fundo (BGM) com sintese
 */

class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.3;
        this.bgmVolume = 0.15;
        this.initialized = false;

        // BGM state
        this.currentBGM = null;
        this.bgmOscillators = [];
        this.bgmGains = [];
        this.bgmIntervals = [];
        this.bgmTimeouts = [];
        this.bgmMasterGain = null;
        this.isFading = false;
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
        if (!this.enabled) {
            this.stopBGM();
        }
        return this.enabled;
    }

    /**
     * Definir volume (0-1)
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    /**
     * Definir volume da musica de fundo (0-1)
     */
    setBGMVolume(vol) {
        this.bgmVolume = Math.max(0, Math.min(1, vol));
        if (this.bgmMasterGain) {
            this.bgmMasterGain.gain.setValueAtTime(this.bgmVolume, this.context.currentTime);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // SISTEMA DE MUSICA DE FUNDO (BGM)
    // ═══════════════════════════════════════════════════════════

    /**
     * Parar musica atual e limpar recursos
     */
    stopBGM(fadeTime = 0.5) {
        if (!this.context) return;

        this.isFading = true;

        // Fade out master gain
        if (this.bgmMasterGain) {
            const now = this.context.currentTime;
            this.bgmMasterGain.gain.setValueAtTime(this.bgmMasterGain.gain.value, now);
            this.bgmMasterGain.gain.linearRampToValueAtTime(0, now + fadeTime);
        }

        // Limpar apos fade
        setTimeout(() => {
            this.cleanupBGM();
            this.isFading = false;
        }, fadeTime * 1000 + 50);
    }

    /**
     * Limpar todos os recursos BGM
     */
    cleanupBGM() {
        // Parar osciladores
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { /* ignore */ }
            try { osc.disconnect(); } catch (e) { /* ignore */ }
        });
        this.bgmOscillators = [];

        // Desconectar gains
        this.bgmGains.forEach(gain => {
            try { gain.disconnect(); } catch (e) { /* ignore */ }
        });
        this.bgmGains = [];

        // Limpar intervals
        this.bgmIntervals.forEach(id => clearInterval(id));
        this.bgmIntervals = [];

        // Limpar timeouts
        this.bgmTimeouts.forEach(id => clearTimeout(id));
        this.bgmTimeouts = [];

        // Desconectar master gain
        if (this.bgmMasterGain) {
            try { this.bgmMasterGain.disconnect(); } catch (e) { /* ignore */ }
            this.bgmMasterGain = null;
        }

        this.currentBGM = null;
    }

    /**
     * Iniciar musica de fundo
     * @param {string} trackName - Nome da track: 'intro', 'menu', 'level1', 'level2', 'boss', 'victory', 'gameover'
     * @param {object} options - Opcoes adicionais (intensity, mood, etc)
     */
    playBGM(trackName, options = {}) {
        if (!this.enabled || !this.context) return;
        this.resume();

        // Se ja esta a tocar a mesma musica, nao reiniciar
        if (this.currentBGM === trackName && !this.isFading) return;

        // Parar musica atual
        this.stopBGM(0.3);

        // Aguardar fade out antes de iniciar nova
        setTimeout(() => {
            this.currentBGM = trackName;
            this.startBGMTrack(trackName, options);
        }, 350);
    }

    /**
     * Crossfade para nova musica
     */
    crossfadeBGM(newTrack, fadeTime = 1.0, options = {}) {
        if (!this.enabled || !this.context) return;
        this.resume();

        if (this.currentBGM === newTrack) return;

        // Fade out atual
        this.stopBGM(fadeTime);

        // Iniciar nova apos fade
        setTimeout(() => {
            this.currentBGM = newTrack;
            this.startBGMTrack(newTrack, options);
        }, fadeTime * 1000);
    }

    /**
     * Iniciar track especifica
     */
    startBGMTrack(trackName, options) {
        if (!this.context || !this.enabled) return;

        // Criar master gain
        this.bgmMasterGain = this.context.createGain();
        this.bgmMasterGain.gain.setValueAtTime(0, this.context.currentTime);
        this.bgmMasterGain.connect(this.context.destination);

        // Fade in
        this.bgmMasterGain.gain.linearRampToValueAtTime(this.bgmVolume, this.context.currentTime + 0.5);

        // Selecionar track
        switch (trackName) {
            case 'intro':
                this.playIntroBGM(options);
                break;
            case 'intro-villain':
                this.playIntroVillainBGM(options);
                break;
            case 'intro-hero':
                this.playIntroHeroBGM(options);
                break;
            case 'menu':
                this.playMenuBGM(options);
                break;
            case 'level1':
                this.playLevel1BGM(options);
                break;
            case 'level2':
                this.playLevel2BGM(options);
                break;
            case 'boss':
                this.playBossBGM(options);
                break;
            case 'victory':
                this.playVictoryBGM(options);
                break;
            case 'gameover':
                this.playGameOverBGM(options);
                break;
            default:
                console.warn('BGM track not found:', trackName);
        }
    }

    /**
     * Ajustar intensidade da musica atual (para boss phases)
     */
    setBGMIntensity(intensity) {
        // Intensity 1-3 para diferentes fases
        if (this.currentBGM === 'boss' && this.bgmMasterGain) {
            const newVolume = this.bgmVolume * (0.8 + intensity * 0.2);
            this.bgmMasterGain.gain.linearRampToValueAtTime(
                Math.min(newVolume, 0.3),
                this.context.currentTime + 0.5
            );
        }
    }

    // ═══════════════════════════════════════════════════════════
    // TRACKS DE MUSICA - INTRO
    // ═══════════════════════════════════════════════════════════

    /**
     * Musica de intro - misteriosa e epica
     */
    playIntroBGM(options) {
        const ctx = this.context;
        const bpm = 70;
        const beatDuration = 60 / bpm;

        // Pad atmosferico (acordes menores)
        const padNotes = [
            [196, 233, 294], // G minor
            [175, 220, 262], // F minor
            [165, 196, 247], // E minor
            [147, 175, 220]  // D minor
        ];

        let noteIndex = 0;

        const playPadChord = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'intro') return;

            const chord = padNotes[noteIndex % padNotes.length];
            noteIndex++;

            chord.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
                gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + beatDuration * 2 - 0.3);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + beatDuration * 2);

                osc.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + beatDuration * 2 + 0.1);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            });
        };

        // Low drone
        const droneOsc = ctx.createOscillator();
        const droneGain = ctx.createGain();
        droneOsc.type = 'sine';
        droneOsc.frequency.value = 55; // A1
        droneGain.gain.value = 0.08;
        droneOsc.connect(droneGain);
        droneGain.connect(this.bgmMasterGain);
        droneOsc.start();
        this.bgmOscillators.push(droneOsc);
        this.bgmGains.push(droneGain);

        // LFO para tremolo no drone
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(droneGain.gain);
        lfo.start();
        this.bgmOscillators.push(lfo);
        this.bgmGains.push(lfoGain);

        // Iniciar loop
        playPadChord();
        const intervalId = setInterval(playPadChord, beatDuration * 2 * 1000);
        this.bgmIntervals.push(intervalId);
    }

    /**
     * Musica de intro quando aparece o vilao - tons graves ameacadores
     */
    playIntroVillainBGM(options) {
        const ctx = this.context;
        const bpm = 60;
        const beatDuration = 60 / bpm;

        // Drone grave ameacador
        const droneOsc1 = ctx.createOscillator();
        const droneOsc2 = ctx.createOscillator();
        const droneGain = ctx.createGain();

        droneOsc1.type = 'sawtooth';
        droneOsc1.frequency.value = 41; // E1
        droneOsc2.type = 'sawtooth';
        droneOsc2.frequency.value = 41.5; // Slight detune for thickness

        droneGain.gain.value = 0.06;

        // Filter para escurecer
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        droneOsc1.connect(filter);
        droneOsc2.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(this.bgmMasterGain);

        droneOsc1.start();
        droneOsc2.start();
        this.bgmOscillators.push(droneOsc1, droneOsc2);
        this.bgmGains.push(droneGain);

        // Acordes de tensao
        const tensionChords = [
            [82, 98, 131],  // E2, G2, C3
            [78, 93, 123],  // D#2, F#2, B2
            [73, 87, 117],  // D2, F2, Bb2
            [69, 82, 110]   // C#2, E2, A2
        ];

        let chordIndex = 0;

        const playTensionChord = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'intro-villain') return;

            const chord = tensionChords[chordIndex % tensionChords.length];
            chordIndex++;

            chord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3);
                gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + beatDuration * 2 - 0.5);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + beatDuration * 2);

                osc.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + beatDuration * 2 + 0.1);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            });

            // Hit percussivo ocasional
            if (chordIndex % 4 === 0) {
                this.playBGMHit(60, 0.15, 0.3);
            }
        };

        playTensionChord();
        const intervalId = setInterval(playTensionChord, beatDuration * 2 * 1000);
        this.bgmIntervals.push(intervalId);
    }

    /**
     * Musica de intro quando aparece a heroina - tons brilhantes e esperancosos
     */
    playIntroHeroBGM(options) {
        const ctx = this.context;
        const bpm = 80;
        const beatDuration = 60 / bpm;

        // Acordes maiores brilhantes
        const heroChords = [
            [262, 330, 392, 523], // C major
            [294, 370, 440, 587], // D major
            [330, 415, 494, 659], // E major
            [349, 440, 523, 698]  // F major
        ];

        let chordIndex = 0;

        const playHeroChord = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'intro-hero') return;

            const chord = heroChords[chordIndex % heroChords.length];
            chordIndex++;

            chord.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = i < 2 ? 'sine' : 'triangle';
                osc.frequency.value = freq;

                const vol = i === 3 ? 0.08 : 0.12;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.2);
                gain.gain.linearRampToValueAtTime(vol * 0.7, ctx.currentTime + beatDuration * 2 - 0.3);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + beatDuration * 2);

                osc.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + beatDuration * 2 + 0.1);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            });
        };

        // Arpejo ascendente de fundo
        const arpeggioNotes = [262, 330, 392, 523, 659, 784];
        let arpeggioIndex = 0;

        const playArpeggio = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'intro-hero') return;

            const freq = arpeggioNotes[arpeggioIndex % arpeggioNotes.length];
            arpeggioIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.35);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        playHeroChord();
        const chordInterval = setInterval(playHeroChord, beatDuration * 2 * 1000);
        this.bgmIntervals.push(chordInterval);

        playArpeggio();
        const arpeggioInterval = setInterval(playArpeggio, beatDuration * 0.5 * 1000);
        this.bgmIntervals.push(arpeggioInterval);
    }

    // ═══════════════════════════════════════════════════════════
    // TRACKS DE MUSICA - MENU (Chiptune/8-bit)
    // ═══════════════════════════════════════════════════════════

    /**
     * Musica de menu - chiptune alegre
     */
    playMenuBGM(options) {
        const ctx = this.context;
        const bpm = 130;
        const beatDuration = 60 / bpm;

        // Melodia principal (onda quadrada para som 8-bit)
        const melody = [
            523, 587, 659, 587, 523, 494, 440, 494,
            523, 587, 659, 784, 659, 587, 523, 494,
            440, 494, 523, 587, 659, 587, 523, 440,
            392, 440, 494, 523, 587, 523, 494, 440
        ];

        let melodyIndex = 0;

        const playMelodyNote = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'menu') return;

            const freq = melody[melodyIndex % melody.length];
            melodyIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.setValueAtTime(0.06, ctx.currentTime + beatDuration * 0.8);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + beatDuration);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration + 0.05);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Baixo (onda triangular)
        const bassNotes = [131, 147, 165, 147, 131, 123, 110, 123];
        let bassIndex = 0;

        const playBassNote = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'menu') return;

            const freq = bassNotes[bassIndex % bassNotes.length];
            bassIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + beatDuration * 2);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration * 2 + 0.05);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Drum pattern (noise)
        let drumBeat = 0;

        const playDrum = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'menu') return;

            drumBeat++;

            // Kick no beat 1 e 3
            if (drumBeat % 4 === 1 || drumBeat % 4 === 3) {
                this.playBGMKick(0.1);
            }

            // Hi-hat em todos
            this.playBGMHiHat(0.04);

            // Snare no beat 2 e 4
            if (drumBeat % 4 === 2 || drumBeat % 4 === 0) {
                this.playBGMSnare(0.06);
            }
        };

        // Iniciar loops
        playMelodyNote();
        const melodyInterval = setInterval(playMelodyNote, beatDuration * 1000);
        this.bgmIntervals.push(melodyInterval);

        playBassNote();
        const bassInterval = setInterval(playBassNote, beatDuration * 2 * 1000);
        this.bgmIntervals.push(bassInterval);

        playDrum();
        const drumInterval = setInterval(playDrum, beatDuration * 1000);
        this.bgmIntervals.push(drumInterval);
    }

    // ═══════════════════════════════════════════════════════════
    // TRACKS DE MUSICA - NIVEIS
    // ═══════════════════════════════════════════════════════════

    /**
     * Musica de nivel 1 - energetica e motivadora
     */
    playLevel1BGM(options) {
        const ctx = this.context;
        const bpm = 120;
        const beatDuration = 60 / bpm;

        // Melodia energetica
        const melody = [
            392, 440, 494, 523, 587, 523, 494, 440,
            392, 494, 587, 659, 587, 494, 392, 330,
            349, 392, 440, 494, 523, 494, 440, 392,
            330, 392, 440, 523, 494, 440, 392, 349
        ];

        let melodyIndex = 0;

        const playMelody = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level1') return;

            const freq = melody[melodyIndex % melody.length];
            melodyIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            // Filter para suavizar
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + beatDuration * 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Baixo pulsante
        const bassPattern = [196, 196, 220, 220, 175, 175, 165, 165];
        let bassIndex = 0;

        const playBass = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level1') return;

            const freq = bassPattern[bassIndex % bassPattern.length];
            bassIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + beatDuration);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration + 0.05);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Acordes de fundo
        const chords = [
            [196, 247, 294], // G
            [220, 277, 330], // A
            [175, 220, 262], // F
            [165, 208, 247]  // E
        ];
        let chordIndex = 0;

        const playChord = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level1') return;

            const chord = chords[chordIndex % chords.length];
            chordIndex++;

            chord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + beatDuration * 4);

                osc.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + beatDuration * 4 + 0.1);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            });
        };

        // Drums
        let drumBeat = 0;
        const playDrums = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level1') return;
            drumBeat++;
            if (drumBeat % 4 === 1) this.playBGMKick(0.12);
            if (drumBeat % 4 === 3) this.playBGMSnare(0.08);
            if (drumBeat % 2 === 0) this.playBGMHiHat(0.03);
        };

        // Iniciar loops
        playMelody();
        const melodyInterval = setInterval(playMelody, beatDuration * 1000);
        this.bgmIntervals.push(melodyInterval);

        playBass();
        const bassInterval = setInterval(playBass, beatDuration * 1000);
        this.bgmIntervals.push(bassInterval);

        playChord();
        const chordInterval = setInterval(playChord, beatDuration * 4 * 1000);
        this.bgmIntervals.push(chordInterval);

        playDrums();
        const drumInterval = setInterval(playDrums, beatDuration * 1000);
        this.bgmIntervals.push(drumInterval);
    }

    /**
     * Musica de nivel 2 - mais intensa
     */
    playLevel2BGM(options) {
        const ctx = this.context;
        const bpm = 135; // Mais rapido
        const beatDuration = 60 / bpm;

        // Melodia mais intensa com notas mais altas
        const melody = [
            523, 587, 659, 698, 784, 698, 659, 587,
            523, 659, 784, 880, 784, 659, 523, 440,
            494, 587, 659, 784, 880, 784, 659, 587,
            523, 587, 659, 784, 698, 659, 587, 523
        ];

        let melodyIndex = 0;

        const playMelody = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level2') return;

            const freq = melody[melodyIndex % melody.length];
            melodyIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2500;

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + beatDuration * 0.85);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Baixo mais agressivo
        const bassPattern = [220, 220, 247, 247, 196, 196, 185, 185];
        let bassIndex = 0;

        const playBass = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level2') return;

            const freq = bassPattern[bassIndex % bassPattern.length];
            bassIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + beatDuration * 0.8);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Arpeggio rapido
        const arpeggioNotes = [523, 659, 784, 880, 784, 659];
        let arpeggioIndex = 0;

        const playArpeggio = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level2') return;

            const freq = arpeggioNotes[arpeggioIndex % arpeggioNotes.length];
            arpeggioIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + beatDuration * 0.5);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration * 0.6);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Drums mais intensos
        let drumBeat = 0;
        const playDrums = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'level2') return;
            drumBeat++;
            if (drumBeat % 2 === 1) this.playBGMKick(0.14);
            if (drumBeat % 4 === 3) this.playBGMSnare(0.1);
            this.playBGMHiHat(0.04);
        };

        // Iniciar loops
        playMelody();
        const melodyInterval = setInterval(playMelody, beatDuration * 1000);
        this.bgmIntervals.push(melodyInterval);

        playBass();
        const bassInterval = setInterval(playBass, beatDuration * 1000);
        this.bgmIntervals.push(bassInterval);

        playArpeggio();
        const arpeggioInterval = setInterval(playArpeggio, beatDuration * 0.5 * 1000);
        this.bgmIntervals.push(arpeggioInterval);

        playDrums();
        const drumInterval = setInterval(playDrums, beatDuration * 1000);
        this.bgmIntervals.push(drumInterval);
    }

    // ═══════════════════════════════════════════════════════════
    // TRACKS DE MUSICA - BOSS
    // ═══════════════════════════════════════════════════════════

    /**
     * Musica de boss - epica e tensa
     */
    playBossBGM(options) {
        const ctx = this.context;
        const bpm = 140;
        const beatDuration = 60 / bpm;
        const intensity = options.intensity || 1;

        // Ostinato dramatico (baixo)
        const ostinato = [82, 82, 87, 82, 77, 82, 73, 77];
        let ostinatoIndex = 0;

        const playOstinato = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'boss') return;

            const freq = ostinato[ostinatoIndex % ostinato.length];
            ostinatoIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 500;

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + beatDuration * 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Acordes epicos (strings simulados)
        const epicChords = [
            [165, 196, 247, 330], // E minor
            [175, 220, 262, 349], // F major
            [147, 175, 220, 294], // D minor
            [165, 208, 247, 330]  // E diminished feel
        ];
        let chordIndex = 0;

        const playEpicChord = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'boss') return;

            const chord = epicChords[chordIndex % epicChords.length];
            chordIndex++;

            chord.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.value = freq;

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1500;

                const vol = i < 2 ? 0.06 : 0.04;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.2);
                gain.gain.linearRampToValueAtTime(vol * 0.8, ctx.currentTime + beatDuration * 4 - 0.5);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + beatDuration * 4);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + beatDuration * 4 + 0.1);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            });
        };

        // Melodia heroica de contra-ataque
        const heroMelody = [
            659, 698, 784, 880, 784, 698, 659, 587,
            523, 587, 659, 784, 880, 784, 659, 587
        ];
        let melodyIndex = 0;

        const playHeroMelody = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'boss') return;

            const freq = heroMelody[melodyIndex % heroMelody.length];
            melodyIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + beatDuration * 0.8);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Drums epicos
        let drumBeat = 0;
        const playDrums = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'boss') return;
            drumBeat++;

            // Kick forte no 1 e 3
            if (drumBeat % 4 === 1 || drumBeat % 4 === 3) {
                this.playBGMKick(0.18);
            }

            // Snare no 2 e 4
            if (drumBeat % 4 === 2 || drumBeat % 4 === 0) {
                this.playBGMSnare(0.12);
            }

            // Hi-hat constante
            this.playBGMHiHat(0.05);

            // Timpani ocasional
            if (drumBeat % 16 === 0) {
                this.playBGMTimpani(0.15);
            }
        };

        // Iniciar loops
        playOstinato();
        const ostinatoInterval = setInterval(playOstinato, beatDuration * 1000);
        this.bgmIntervals.push(ostinatoInterval);

        playEpicChord();
        const chordInterval = setInterval(playEpicChord, beatDuration * 4 * 1000);
        this.bgmIntervals.push(chordInterval);

        playHeroMelody();
        const melodyInterval = setInterval(playHeroMelody, beatDuration * 1000);
        this.bgmIntervals.push(melodyInterval);

        playDrums();
        const drumInterval = setInterval(playDrums, beatDuration * 1000);
        this.bgmIntervals.push(drumInterval);
    }

    // ═══════════════════════════════════════════════════════════
    // TRACKS DE MUSICA - VITORIA E GAME OVER
    // ═══════════════════════════════════════════════════════════

    /**
     * Musica de vitoria - triunfante
     */
    playVictoryBGM(options) {
        const ctx = this.context;
        const bpm = 110;
        const beatDuration = 60 / bpm;

        // Fanfarra inicial
        const fanfareNotes = [
            { freq: 523, dur: 0.5 },
            { freq: 659, dur: 0.5 },
            { freq: 784, dur: 0.5 },
            { freq: 1047, dur: 1.5 }
        ];

        let fanfareDelay = 0;
        fanfareNotes.forEach(note => {
            const timeout = setTimeout(() => {
                if (!this.bgmMasterGain || this.currentBGM !== 'victory') return;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'square';
                osc.frequency.value = note.freq;

                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + note.dur * beatDuration);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + note.dur * beatDuration + 0.2);

                osc.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + note.dur * beatDuration + 0.3);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            }, fanfareDelay);
            this.bgmTimeouts.push(timeout);
            fanfareDelay += note.dur * beatDuration * 1000;
        });

        // Loop de celebracao apos fanfarra
        const celebrationTimeout = setTimeout(() => {
            if (!this.bgmMasterGain || this.currentBGM !== 'victory') return;

            // Acordes maiores alegres
            const chords = [
                [523, 659, 784], // C major
                [587, 740, 880], // D major
                [659, 831, 988], // E major
                [698, 880, 1047] // F major
            ];

            let chordIndex = 0;

            const playChord = () => {
                if (!this.bgmMasterGain || this.currentBGM !== 'victory') return;

                const chord = chords[chordIndex % chords.length];
                chordIndex++;

                chord.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = i === 0 ? 'triangle' : 'sine';
                    osc.frequency.value = freq;

                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
                    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + beatDuration * 2);

                    osc.connect(gain);
                    gain.connect(this.bgmMasterGain);

                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + beatDuration * 2 + 0.1);

                    this.bgmOscillators.push(osc);
                    this.bgmGains.push(gain);
                });
            };

            // Arpejo de celebracao
            const arpeggioNotes = [523, 659, 784, 1047, 784, 659];
            let arpeggioIndex = 0;

            const playArpeggio = () => {
                if (!this.bgmMasterGain || this.currentBGM !== 'victory') return;

                const freq = arpeggioNotes[arpeggioIndex % arpeggioNotes.length];
                arpeggioIndex++;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + beatDuration * 0.4);

                osc.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + beatDuration * 0.5);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            };

            playChord();
            const chordInterval = setInterval(playChord, beatDuration * 2 * 1000);
            this.bgmIntervals.push(chordInterval);

            playArpeggio();
            const arpeggioInterval = setInterval(playArpeggio, beatDuration * 0.5 * 1000);
            this.bgmIntervals.push(arpeggioInterval);

        }, fanfareDelay + 500);
        this.bgmTimeouts.push(celebrationTimeout);
    }

    /**
     * Musica de game over - triste e melancolica
     */
    playGameOverBGM(options) {
        const ctx = this.context;
        const bpm = 60;
        const beatDuration = 60 / bpm;

        // Acordes menores descendentes
        const sadChords = [
            [220, 262, 330], // A minor
            [196, 247, 294], // G minor
            [175, 220, 262], // F minor
            [165, 196, 247]  // E minor
        ];

        let chordIndex = 0;

        const playSadChord = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'gameover') return;

            const chord = sadChords[chordIndex % sadChords.length];
            chordIndex++;

            chord.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5);
                gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + beatDuration * 3);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + beatDuration * 4);

                osc.connect(gain);
                gain.connect(this.bgmMasterGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + beatDuration * 4 + 0.1);

                this.bgmOscillators.push(osc);
                this.bgmGains.push(gain);
            });
        };

        // Melodia melancolica simples
        const melodyNotes = [659, 587, 523, 494, 440, 392, 349, 330];
        let melodyIndex = 0;

        const playMelodyNote = () => {
            if (!this.bgmMasterGain || this.currentBGM !== 'gameover') return;

            const freq = melodyNotes[melodyIndex % melodyNotes.length];
            melodyIndex++;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + beatDuration * 1.8);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + beatDuration * 2);

            osc.connect(gain);
            gain.connect(this.bgmMasterGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + beatDuration * 2 + 0.1);

            this.bgmOscillators.push(osc);
            this.bgmGains.push(gain);
        };

        // Iniciar loops
        playSadChord();
        const chordInterval = setInterval(playSadChord, beatDuration * 4 * 1000);
        this.bgmIntervals.push(chordInterval);

        // Melodia comeca com delay
        const melodyTimeout = setTimeout(() => {
            playMelodyNote();
            const melodyInterval = setInterval(playMelodyNote, beatDuration * 2 * 1000);
            this.bgmIntervals.push(melodyInterval);
        }, beatDuration * 2 * 1000);
        this.bgmTimeouts.push(melodyTimeout);
    }

    // ═══════════════════════════════════════════════════════════
    // HELPERS - SONS DE PERCUSSAO PARA BGM
    // ═══════════════════════════════════════════════════════════

    playBGMKick(vol) {
        if (!this.context || !this.bgmMasterGain) return;
        const ctx = this.context;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.bgmMasterGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);

        this.bgmOscillators.push(osc);
        this.bgmGains.push(gain);
    }

    playBGMSnare(vol) {
        if (!this.context || !this.bgmMasterGain) return;
        const ctx = this.context;

        // Noise
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmMasterGain);

        noise.start(ctx.currentTime);

        this.bgmGains.push(gain);
    }

    playBGMHiHat(vol) {
        if (!this.context || !this.bgmMasterGain) return;
        const ctx = this.context;

        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const gain = ctx.createGain();
        gain.gain.value = vol;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmMasterGain);

        noise.start(ctx.currentTime);

        this.bgmGains.push(gain);
    }

    playBGMTimpani(vol) {
        if (!this.context || !this.bgmMasterGain) return;
        const ctx = this.context;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.bgmMasterGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);

        this.bgmOscillators.push(osc);
        this.bgmGains.push(gain);
    }

    playBGMHit(freq, vol, duration) {
        if (!this.context || !this.bgmMasterGain) return;
        const ctx = this.context;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.bgmMasterGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration + 0.1);

        this.bgmOscillators.push(osc);
        this.bgmGains.push(gain);
    }

    // ═══════════════════════════════════════════════════════════
    // SONS DO JOGO (SFX)
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
