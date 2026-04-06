// ============================================================
// sound.js — Web Audio API synthesised sound effects
// ============================================================

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    _play(freq, type, duration, volume = 0.3, slide = 0) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slide) {
            osc.frequency.linearRampToValueAtTime(
                freq + slide,
                this.ctx.currentTime + duration,
            );
        }
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + duration,
        );
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    jump() {
        this._play(400, 'square', 0.15, 0.2, 200);
    }

    score() {
        this._play(600, 'sine', 0.1, 0.15);
        setTimeout(() => this._play(900, 'sine', 0.15, 0.15), 80);
    }

    milestone() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
            setTimeout(() => this._play(f, 'sine', 0.12, 0.12), i * 70);
        });
    }

    hit() {
        this._play(150, 'sawtooth', 0.3, 0.25, -100);
    }

    duck() {
        this._play(200, 'triangle', 0.08, 0.1, -50);
    }
}

const soundManager = new SoundManager();
