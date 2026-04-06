// ============================================================
// easter-eggs.js — Character-specific ambient background events
// ============================================================
// Dino:      falling meteors with fire trails
// Ninja:     flying shuriken / kunai across the sky
// Astronaut: UFOs / spaceships drifting by

class EasterEggManager {
    constructor(canvasW, canvasH, groundY) {
        this.w = canvasW;
        this.h = canvasH;
        this.groundY = groundY;
        this.characterId = 'dino';
        this.items = [];
        this.spawnTimer = 0;
        this.spawnInterval = 300; // frames between spawn attempts
    }

    setCharacter(id) {
        this.characterId = id;
        this.items = [];
        this.spawnTimer = 0;
    }

    update(speed) {
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval && this.items.length < 3) {
            if (Math.random() < 0.4) {
                this._spawn();
            }
            this.spawnTimer = 0;
        }

        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.x += item.vx;
            item.y += item.vy;
            item.life--;
            if (item.rotation !== undefined) item.rotation += item.rotSpeed;
            if (item.trail) {
                item.trail.push({ x: item.x, y: item.y, age: 0 });
                if (item.trail.length > 12) item.trail.shift();
                item.trail.forEach(t => t.age++);
            }
            if (item.life <= 0 || item.x < -80 || item.x > this.w + 80 || item.y > this.groundY + 20) {
                this.items.splice(i, 1);
            }
        }
    }

    _spawn() {
        switch (this.characterId) {
            case 'dino':   this._spawnMeteor(); break;
            case 'ninja':  this._spawnNinjaItem(); break;
            case 'astronaut': this._spawnSpaceItem(); break;
        }
    }

    // ── Dino: Meteors ───────────────────────────────────────
    _spawnMeteor() {
        this.items.push({
            type: 'meteor',
            x: randInt(this.w * 0.3, this.w + 50),
            y: -20,
            vx: -(Math.random() * 2 + 1.5),
            vy: Math.random() * 2 + 2,
            size: randInt(4, 8),
            life: 200,
            trail: [],
        });
    }

    // ── Ninja: Shuriken / Kunai ─────────────────────────────
    _spawnNinjaItem() {
        const isShuriken = Math.random() > 0.4;
        const fromRight = Math.random() > 0.5;
        this.items.push({
            type: isShuriken ? 'shuriken' : 'kunai',
            x: fromRight ? this.w + 20 : -20,
            y: randInt(20, this.groundY - 60),
            vx: fromRight ? -(Math.random() * 3 + 2) : (Math.random() * 3 + 2),
            vy: (Math.random() - 0.5) * 0.5,
            size: isShuriken ? 10 : 14,
            life: 250,
            rotation: 0,
            rotSpeed: isShuriken ? 0.2 : 0.05,
            trail: [],
        });
    }

    // ── Astronaut: UFO / Spaceship ──────────────────────────
    _spawnSpaceItem() {
        const isUfo = Math.random() > 0.4;
        const fromRight = Math.random() > 0.5;
        this.items.push({
            type: isUfo ? 'ufo' : 'spaceship',
            x: fromRight ? this.w + 30 : -30,
            y: randInt(15, 70),
            vx: fromRight ? -(Math.random() * 1.5 + 0.8) : (Math.random() * 1.5 + 0.8),
            vy: Math.sin(Math.random() * Math.PI) * 0.3,
            size: isUfo ? 18 : 14,
            life: 400,
            wobble: Math.random() * Math.PI * 2,
            trail: [],
        });
    }

    draw(ctx) {
        this.items.forEach(item => {
            switch (item.type) {
                case 'meteor':    this._drawMeteor(ctx, item); break;
                case 'shuriken':  this._drawShuriken(ctx, item); break;
                case 'kunai':     this._drawKunai(ctx, item); break;
                case 'ufo':       this._drawUfo(ctx, item); break;
                case 'spaceship': this._drawSpaceship(ctx, item); break;
            }
        });
    }

    // ── Draw: Meteor ────────────────────────────────────────
    _drawMeteor(ctx, m) {
        // Fire trail
        m.trail.forEach((t, i) => {
            const alpha = Math.max(0, 1 - t.age / 15);
            const r = m.size * (1 - t.age / 15) * 0.8;
            if (r <= 0) return;
            ctx.globalAlpha = alpha * 0.6;
            ctx.fillStyle = i % 2 === 0 ? '#ff6b35' : '#ffba08';
            ctx.beginPath();
            ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Meteor body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();

        // Hot core
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(m.x - 1, m.y - 1, m.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // ── Draw: Shuriken ──────────────────────────────────────
    _drawShuriken(ctx, s) {
        // Trail
        s.trail.forEach(t => {
            const alpha = Math.max(0, 1 - t.age / 10);
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);

        // 4-pointed star
        ctx.fillStyle = '#c0c0c0';
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 2) * i);
            ctx.beginPath();
            ctx.moveTo(0, -s.size);
            ctx.lineTo(-3, 0);
            ctx.lineTo(0, 3);
            ctx.lineTo(3, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Center circle
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ── Draw: Kunai ─────────────────────────────────────────
    _drawKunai(ctx, k) {
        // Trail
        k.trail.forEach(t => {
            const alpha = Math.max(0, 1 - t.age / 8);
            ctx.globalAlpha = alpha * 0.2;
            ctx.fillStyle = '#aaa';
            ctx.fillRect(t.x - 1, t.y - 1, 2, 2);
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(k.x, k.y);
        const angle = Math.atan2(k.vy, k.vx) + k.rotation;
        ctx.rotate(angle);

        // Blade
        ctx.fillStyle = '#c0c0c0';
        ctx.beginPath();
        ctx.moveTo(k.size, 0);
        ctx.lineTo(0, -3);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();

        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-8, -1.5, 8, 3);

        // Ring
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-11, 0, 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // ── Draw: UFO ───────────────────────────────────────────
    _drawUfo(ctx, u) {
        // Wobble motion
        const wobbleY = Math.sin(u.wobble + u.life * 0.05) * 3;
        const uy = u.y + wobbleY;

        // Beam (sometimes)
        if (u.life % 120 < 40) {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.moveTo(u.x - 6, uy + u.size * 0.4);
            ctx.lineTo(u.x + 6, uy + u.size * 0.4);
            ctx.lineTo(u.x + 18, this.groundY);
            ctx.lineTo(u.x - 18, this.groundY);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Body (dome + disc)
        ctx.fillStyle = '#a8d8ea';
        ctx.beginPath();
        ctx.ellipse(u.x, uy, u.size, u.size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dome
        ctx.fillStyle = '#88c8e8';
        ctx.beginPath();
        ctx.ellipse(u.x, uy - u.size * 0.2, u.size * 0.5, u.size * 0.4, 0, Math.PI, 0);
        ctx.fill();

        // Dome glass
        ctx.fillStyle = 'rgba(150, 255, 200, 0.5)';
        ctx.beginPath();
        ctx.ellipse(u.x, uy - u.size * 0.25, u.size * 0.35, u.size * 0.25, 0, Math.PI, 0);
        ctx.fill();

        // Lights
        const lightColors = ['#ff4444', '#44ff44', '#ffff44'];
        for (let i = 0; i < 3; i++) {
            const lx = u.x + (i - 1) * u.size * 0.5;
            const blink = Math.sin(u.life * 0.15 + i * 2) > 0;
            ctx.fillStyle = blink ? lightColors[i] : '#555';
            ctx.beginPath();
            ctx.arc(lx, uy + u.size * 0.15, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ── Draw: Spaceship ─────────────────────────────────────
    _drawSpaceship(ctx, s) {
        const wobbleY = Math.sin(s.wobble + s.life * 0.03) * 2;
        const sy = s.y + wobbleY;
        const facingRight = s.vx > 0;

        ctx.save();
        ctx.translate(s.x, sy);
        if (!facingRight) ctx.scale(-1, 1);

        // Engine flame
        ctx.fillStyle = '#ff6b35';
        ctx.globalAlpha = 0.6 + Math.random() * 0.3;
        ctx.beginPath();
        ctx.moveTo(-s.size * 0.7, -2);
        ctx.lineTo(-s.size * 0.7, 2);
        ctx.lineTo(-s.size * (0.9 + Math.random() * 0.4), 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Main body
        ctx.fillStyle = '#d0d0d0';
        ctx.beginPath();
        ctx.moveTo(s.size * 0.8, 0);
        ctx.lineTo(s.size * 0.1, -s.size * 0.35);
        ctx.lineTo(-s.size * 0.6, -s.size * 0.25);
        ctx.lineTo(-s.size * 0.7, 0);
        ctx.lineTo(-s.size * 0.6, s.size * 0.25);
        ctx.lineTo(s.size * 0.1, s.size * 0.35);
        ctx.closePath();
        ctx.fill();

        // Cockpit window
        ctx.fillStyle = '#5bc0de';
        ctx.beginPath();
        ctx.ellipse(s.size * 0.3, 0, s.size * 0.15, s.size * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(-s.size * 0.2, -s.size * 0.3);
        ctx.lineTo(-s.size * 0.5, -s.size * 0.6);
        ctx.lineTo(-s.size * 0.55, -s.size * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-s.size * 0.2, s.size * 0.3);
        ctx.lineTo(-s.size * 0.5, s.size * 0.6);
        ctx.lineTo(-s.size * 0.55, s.size * 0.25);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    clear() {
        this.items = [];
        this.spawnTimer = 0;
    }
}
