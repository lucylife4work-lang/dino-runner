// ============================================================
// particles.js — Lightweight particle system
// ============================================================

class Particle {
    constructor(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;          // tiny gravity
        this.life--;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }

    get dead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // Running dust — small earth-tone puffs behind the player
    emitDust(x, y) {
        for (let i = 0; i < 2; i++) {
            this.particles.push(
                new Particle(
                    x + Math.random() * 4,
                    y + Math.random() * 2,
                    -Math.random() * 1.5 - 0.5,
                    -Math.random() * 0.8,
                    randInt(10, 20),
                    `hsl(30, ${randInt(10, 30)}%, ${randInt(50, 70)}%)`,
                    randInt(2, 4),
                ),
            );
        }
    }

    // Jump trail — upward wisps
    emitJumpTrail(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(
                new Particle(
                    x + Math.random() * 10,
                    y + Math.random() * 6,
                    (Math.random() - 0.5) * 2,
                    -Math.random() * 2 - 1,
                    randInt(12, 22),
                    `hsl(200, 80%, ${randInt(60, 85)}%)`,
                    randInt(2, 5),
                ),
            );
        }
    }

    // Collision explosion — burst of red/orange
    emitExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.particles.push(
                new Particle(
                    x,
                    y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    randInt(20, 40),
                    `hsl(${randInt(0, 40)}, 90%, ${randInt(45, 65)}%)`,
                    randInt(3, 6),
                ),
            );
        }
    }

    // Score pop — small gold sparkles
    emitScorePop(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(
                new Particle(
                    x + Math.random() * 20,
                    y - 10,
                    (Math.random() - 0.5) * 2,
                    -Math.random() * 2 - 0.5,
                    randInt(15, 25),
                    `hsl(45, 100%, ${randInt(50, 75)}%)`,
                    randInt(2, 4),
                ),
            );
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    clear() {
        this.particles = [];
    }
}
