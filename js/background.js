// ============================================================
// background.js — Scrolling ground, clouds, stars, day/night
// ============================================================

class Background {
    constructor(canvasW, canvasH, groundY) {
        this.w = canvasW;
        this.h = canvasH;
        this.groundY = groundY;

        // Day / night state
        this.isNight = false;
        this.nightAlpha = 0;       // 0 = day, 1 = full night
        this.transitionSpeed = 0.01;

        // Stars (generated once)
        this.stars = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvasW,
            y: Math.random() * (groundY - 40),
            r: Math.random() * 1.5 + 0.5,
            twinkle: Math.random() * Math.PI * 2,
        }));

        // Moon
        this.moonX = canvasW * 0.75;
        this.moonY = 50;

        // Clouds
        this.clouds = [];
        for (let i = 0; i < 4; i++) {
            this.clouds.push(this._makeCloud(Math.random() * canvasW));
        }

        // Ground tiles
        this.groundOffset = 0;
    }

    _makeCloud(x) {
        // Generate a set of overlapping circles that form a fluffy cloud
        const baseW = randInt(50, 90);
        const baseH = randInt(16, 24);
        const puffs = [];
        const count = randInt(4, 6);
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);                       // 0 → 1
            const cx = (t - 0.5) * baseW * 0.8;              // spread horizontally
            const cy = -Math.sin(t * Math.PI) * baseH * 0.4; // arch upward in the middle
            const r = baseH * (0.4 + Math.random() * 0.3);   // varied radii
            puffs.push({ cx, cy, r });
        }
        // Add a flat-bottom row of smaller puffs
        for (let i = 0; i < count - 1; i++) {
            const t = (i + 0.5) / (count - 1);
            const cx = (t - 0.5) * baseW * 0.7;
            const r = baseH * (0.3 + Math.random() * 0.15);
            puffs.push({ cx, cy: baseH * 0.1, r });
        }
        return {
            x,
            y: randInt(30, 100),
            w: baseW,
            h: baseH,
            speed: Math.random() * 0.3 + 0.1,
            puffs,
        };
    }

    toggle(toNight) {
        this.isNight = toNight;
    }

    update(speed) {
        // Smooth day/night transition
        const target = this.isNight ? 1 : 0;
        if (this.nightAlpha < target) this.nightAlpha = Math.min(this.nightAlpha + this.transitionSpeed, 1);
        if (this.nightAlpha > target) this.nightAlpha = Math.max(this.nightAlpha - this.transitionSpeed, 0);

        // Ground scroll
        this.groundOffset = (this.groundOffset + speed) % 20;

        // Cloud drift
        this.clouds.forEach(c => {
            c.x -= c.speed + speed * 0.1;
            if (c.x + c.w < 0) {
                c.x = this.w + randInt(10, 60);
                c.y = randInt(30, 100);
            }
        });

        // Star twinkle
        this.stars.forEach(s => {
            s.twinkle += 0.05;
        });
    }

    draw(ctx) {
        // Sky gradient — day uses a light blue for contrast
        const dayTop = '#87CEEB';
        const dayBot = '#d4e8f0';
        const nightTop = '#1a1a2e';
        const nightBot = '#16213e';

        const topColor = this._lerpColor(dayTop, nightTop, this.nightAlpha);
        const botColor = this._lerpColor(dayBot, nightBot, this.nightAlpha);

        const grad = ctx.createLinearGradient(0, 0, 0, this.groundY);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, botColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.w, this.groundY);

        // Stars (only when night)
        if (this.nightAlpha > 0.05) {
            ctx.globalAlpha = this.nightAlpha;
            this.stars.forEach(s => {
                const brightness = 0.5 + 0.5 * Math.sin(s.twinkle);
                ctx.fillStyle = `rgba(255,255,230,${brightness})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // Moon
            ctx.fillStyle = '#fffde7';
            ctx.beginPath();
            ctx.arc(this.moonX, this.moonY, 18, 0, Math.PI * 2);
            ctx.fill();
            // Moon shadow (crescent)
            ctx.fillStyle = this._lerpColor(dayTop, nightTop, this.nightAlpha);
            ctx.beginPath();
            ctx.arc(this.moonX + 6, this.moonY - 2, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
        }

        // Clouds — fluffy puff clusters
        this.clouds.forEach(c => {
            const baseColor = this.nightAlpha > 0.5 ? [42, 42, 74] : [255, 255, 255];
            const highlightColor = this.nightAlpha > 0.5 ? [52, 52, 90] : [245, 248, 255];

            // Draw each puff (back to front)
            c.puffs.forEach((p, idx) => {
                const isTop = idx < c.puffs.length / 2;
                const col = isTop ? highlightColor : baseColor;
                ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
                ctx.beginPath();
                ctx.arc(c.x + p.cx, c.y + p.cy, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // Ground line
        const groundLineColor = this.nightAlpha > 0.5 ? '#4a4a6a' : '#8B7355';
        ctx.strokeStyle = groundLineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.w, this.groundY);
        ctx.stroke();

        // Ground texture (small bumps)
        ctx.fillStyle = this.nightAlpha > 0.5 ? '#3a3a5a' : '#a08060';
        for (let x = -this.groundOffset; x < this.w; x += 20) {
            const bumpW = randInt(1, 3);
            ctx.fillRect(x, this.groundY + randInt(3, 10), bumpW, 1);
        }

        // Ground fill below — sandy/earthy tone in day
        const groundFill = this.nightAlpha > 0.5 ? '#222244' : '#d2c4a0';
        ctx.fillStyle = groundFill;
        ctx.fillRect(0, this.groundY + 1, this.w, this.h - this.groundY);
    }

    _lerpColor(hex1, hex2, t) {
        const r1 = parseInt(hex1.slice(1, 3), 16);
        const g1 = parseInt(hex1.slice(3, 5), 16);
        const b1 = parseInt(hex1.slice(5, 7), 16);
        const r2 = parseInt(hex2.slice(1, 3), 16);
        const g2 = parseInt(hex2.slice(3, 5), 16);
        const b2 = parseInt(hex2.slice(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `rgb(${r},${g},${b})`;
    }
}
