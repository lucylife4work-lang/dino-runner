// ============================================================
// obstacle.js — Cactus & Pterodactyl obstacles
// ============================================================

const OBSTACLE_SPRITES = {
    cactusSmall: {
        palette: { 1: '#2d5a27', 2: '#3b7a33' },
        grid: [
            [0,0,1,0,0],
            [0,1,1,0,0],
            [0,1,1,1,0],
            [0,1,1,0,0],
            [0,1,1,0,0],
            [0,1,1,0,0],
            [0,2,2,0,0],
            [0,2,2,0,0],
        ],
    },
    cactusLarge: {
        palette: { 1: '#2d5a27', 2: '#3b7a33', 3: '#1e3d1a' },
        grid: [
            [0,0,0,1,0,0,0],
            [0,1,0,1,0,0,0],
            [0,1,0,1,0,1,0],
            [0,1,1,1,0,1,0],
            [0,0,1,1,1,1,0],
            [0,0,1,1,0,0,0],
            [0,0,1,1,0,0,0],
            [0,0,1,1,0,0,0],
            [0,0,2,2,0,0,0],
            [0,0,3,3,0,0,0],
        ],
    },
    cactusCluster: {
        palette: { 1: '#2d5a27', 2: '#3b7a33', 3: '#1e3d1a' },
        grid: [
            [0,0,1,0,0,0,1,0,0],
            [0,1,1,0,0,0,1,0,0],
            [0,1,1,1,0,1,1,1,0],
            [0,1,1,0,0,0,1,1,0],
            [0,1,1,0,0,0,1,1,0],
            [0,2,2,0,0,0,2,2,0],
            [0,2,2,0,0,0,3,3,0],
        ],
    },
    cactusTriple: {
        palette: { 1: '#2d5a27', 2: '#3b7a33', 3: '#1e3d1a' },
        grid: [
            [0,0,1,0,0,0,0,1,0,0,0,1,0,0],
            [0,1,1,0,0,0,1,1,0,0,0,1,0,0],
            [0,1,1,1,0,0,1,1,1,0,1,1,1,0],
            [0,1,1,0,0,0,1,1,0,0,0,1,1,0],
            [0,1,1,0,0,0,1,1,0,0,0,1,1,0],
            [0,1,1,0,0,0,1,1,0,0,0,1,1,0],
            [0,2,2,0,0,0,2,2,0,0,0,2,2,0],
            [0,3,3,0,0,0,3,3,0,0,0,3,3,0],
        ],
    },
    ptero: {
        palette: { 1: '#6b4c3b', 2: '#8b6914', 3: '#4a3728' },
        frames: [
            // Wings up
            [
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,1,1,0,0,0,0,0],
                [0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,2,1,1,0,0],
                [0,0,0,1,1,1,1,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
            ],
            // Wings down
            [
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,2,1,1,0,0],
                [0,0,0,1,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0,0,0],
            ],
        ],
    },
};

class Obstacle {
    constructor(type, x, groundY) {
        this.type = type;
        this.x = x;
        this.cellSize = 4;
        this.frameIndex = 0;
        this.frameTick = 0;

        if (type === 'ptero') {
            // Player standing top ≈ groundY - 44 = 206
            // Player ducking top  ≈ groundY - 28 = 222
            // Ptero height = 24px
            //
            // Heights:
            //   high:  y=groundY-90  → top=160, bottom=184 — walk under safely
            //   mid:   y=groundY-50  → top=200, bottom=224 — must jump over
            //   duck:  y=groundY-64  → top=186, bottom=210 — hits standing, clears ducking → MUST DUCK
            //
            // ~20% high, ~35% mid (jump), ~45% duck-required
            const roll = Math.random();
            const heights = roll < 0.20 ? groundY - 90
                          : roll < 0.55 ? groundY - 50
                          :               groundY - 64;
            this.y = heights;
            const frame = OBSTACLE_SPRITES.ptero.frames[0];
            this.w = frame[0].length * this.cellSize;
            this.h = frame.length * this.cellSize;
        } else {
            const sprite = OBSTACLE_SPRITES[type];
            this.w = sprite.grid[0].length * this.cellSize;
            this.h = sprite.grid.length * this.cellSize;
            this.y = groundY - this.h;
        }
    }

    update(speed) {
        this.x -= speed;

        if (this.type === 'ptero') {
            this.frameTick++;
            if (this.frameTick >= 12) {
                this.frameTick = 0;
                this.frameIndex = 1 - this.frameIndex;
            }
        }
    }

    draw(ctx) {
        if (this.type === 'ptero') {
            const data = OBSTACLE_SPRITES.ptero;
            const frame = data.frames[this.frameIndex];
            drawPixelArt(ctx, frame, this.cellSize, this.x, this.y, data.palette);
        } else {
            const data = OBSTACLE_SPRITES[this.type];
            drawPixelArt(ctx, data.grid, this.cellSize, this.x, this.y, data.palette);
        }
    }

    get hitbox() {
        const shrink = 3;
        return {
            x: this.x + shrink,
            y: this.y + shrink,
            w: this.w - shrink * 2,
            h: this.h - shrink * 2,
        };
    }

    get offScreen() {
        return this.x + this.w < -10;
    }
}

// Factory — obstacle mix scales with score (difficulty)
function spawnObstacle(groundY, score) {
    // Weighted pool: [type, weight]
    // Base obstacles always available
    const pool = [
        ['cactusSmall',   10],
        ['cactusLarge',   8],
        ['cactusCluster', 5],
    ];

    // Triple cactus: rare, appears after 300, caps at moderate weight
    if (score > 300) {
        pool.push(['cactusTriple', Math.min(4, 1 + Math.floor((score - 300) / 300))]);
    }

    // Pterodactyls: appear after 400, weight grows with score
    if (score > 400) {
        pool.push(['ptero', Math.min(10, 2 + Math.floor((score - 400) / 200))]);
    }

    // As speed rises, reduce easy obstacles and boost hard ones
    if (score > 800) {
        pool[0][1] = 6;   // less cactusSmall
        pool[1][1] = 10;  // more cactusLarge
    }
    if (score > 1500) {
        pool[0][1] = 3;   // even less small
        pool[2][1] = 7;   // more clusters
    }

    // Weighted random selection
    const totalWeight = pool.reduce((sum, p) => sum + p[1], 0);
    let roll = Math.random() * totalWeight;
    let chosen = pool[0][0];
    for (const [type, weight] of pool) {
        roll -= weight;
        if (roll <= 0) { chosen = type; break; }
    }

    return new Obstacle(chosen, GAME_CONFIG.CANVAS_WIDTH + 20, groundY);
}
