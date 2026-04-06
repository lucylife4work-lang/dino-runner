// ============================================================
// game.js — Main game controller
// ============================================================

(function () {
    'use strict';

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');


    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    // ── DOM refs ────────────────────────────────────────────
    const startScreen      = document.getElementById('start-screen');
    const gameoverScreen   = document.getElementById('gameover-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const hud              = document.getElementById('hud');
    const finalScoreEl     = document.getElementById('final-score');
    const bestScoreEl      = document.getElementById('best-score');
    const hiScoreEl        = document.getElementById('hi-score');
    const currentScoreEl   = document.getElementById('current-score');
    const speedIndicator   = document.getElementById('speed-indicator');
    const newHighscoreDiv  = document.getElementById('new-highscore');
    const playerNameInput  = document.getElementById('player-name');
    const saveScoreBtn     = document.getElementById('save-score-btn');
    const leaderboardList  = document.getElementById('leaderboard-list');
    const leaderboardBtn   = document.getElementById('leaderboard-btn');
    const goLeaderboardBtn = document.getElementById('gameover-leaderboard-btn');
    const backBtn          = document.getElementById('back-btn');
    const backToMenuBtn    = document.getElementById('back-to-menu-btn');
    const charOptions      = document.querySelectorAll('.char-option');
    const charPreviews     = document.querySelectorAll('.char-preview');

    // Victory screen refs
    const victoryScreen       = document.getElementById('victory-screen');
    const victoryFinalScore   = document.getElementById('victory-final-score');
    const victoryHighscoreDiv = document.getElementById('victory-highscore');
    const victoryPlayerName   = document.getElementById('victory-player-name');
    const victorySaveBtn      = document.getElementById('victory-save-btn');
    const victoryMenuBtn      = document.getElementById('victory-menu-btn');
    const victoryLeaderboardBtn = document.getElementById('victory-leaderboard-btn');

    // ── Game state ──────────────────────────────────────────
    let state = 'start';     // start | playing | gameover | victory | leaderboard
    let score = 0;
    let highScore = Number(localStorage.getItem('dino_highscore')) || 0;
    let speed = GAME_CONFIG.INITIAL_SPEED;
    let framesSinceObstacle = 0;
    let lastMilestone = 0;

    const bg         = new Background(canvas.width, canvas.height, GAME_CONFIG.GROUND_Y);
    const player     = new Player(GAME_CONFIG.GROUND_Y);
    const particles  = new ParticleSystem();
    const easterEggs = new EasterEggManager(canvas.width, canvas.height, GAME_CONFIG.GROUND_Y);
    let obstacles    = [];

    let selectedChar = 'dino';

    // ── Character select ────────────────────────────────────
    charPreviews.forEach(c => drawCharacterPreview(c, c.dataset.char));
    charOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            charOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedChar = opt.dataset.char;
        });
    });

    // ── Leaderboard UI ──────────────────────────────────────
    function showLeaderboard(returnTo) {
        const board = getLeaderboard();
        leaderboardList.innerHTML = board.length === 0
            ? '<p class="empty-board">No scores yet!</p>'
            : board.map((e, i) =>
                `<div class="lb-row">
                    <span class="lb-rank">${i + 1}.</span>
                    <span class="lb-name">${e.name}</span>
                    <span class="lb-score">${formatScore(e.score)}</span>
                </div>`
            ).join('');

        startScreen.classList.add('hidden');
        gameoverScreen.classList.add('hidden');
        victoryScreen.classList.add('hidden');
        leaderboardScreen.classList.remove('hidden');

        backBtn.onclick = () => {
            leaderboardScreen.classList.add('hidden');
            if (returnTo === 'gameover') gameoverScreen.classList.remove('hidden');
            else if (returnTo === 'victory') victoryScreen.classList.remove('hidden');
            else startScreen.classList.remove('hidden');
        };
    }

    leaderboardBtn.addEventListener('click', () => showLeaderboard('start'));
    goLeaderboardBtn.addEventListener('click', () => showLeaderboard('gameover'));

    // ── Back to menu ────────────────────────────────────────
    backToMenuBtn.addEventListener('click', () => {
        gameoverScreen.classList.add('hidden');
        hud.classList.add('hidden');
        startScreen.classList.remove('hidden');
        state = 'start';
        // Reset visual state
        player.reset();
        obstacles = [];
        particles.clear();
        easterEggs.clear();
        bg.toggle(false);
    });

    // ── Save score ──────────────────────────────────────────
    saveScoreBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim() || 'Player';
        addToLeaderboard(name, Math.floor(score));
        newHighscoreDiv.classList.add('hidden');
        saveScoreBtn.disabled = true;
    });

    // ── Start / restart ─────────────────────────────────────
    function startGame() {
        soundManager.init();
        player.setCharacter(selectedChar);
        player.reset();
        easterEggs.setCharacter(selectedChar);
        obstacles = [];
        particles.clear();
        score = 0;
        speed = GAME_CONFIG.INITIAL_SPEED;
        framesSinceObstacle = 0;
        lastMilestone = 0;
        bg.toggle(false);

        startScreen.classList.add('hidden');
        gameoverScreen.classList.add('hidden');
        hud.classList.remove('hidden');
        state = 'playing';
    }

    function gameOver() {
        state = 'gameover';
        soundManager.hit();
        particles.emitExplosion(player.x + player.w / 2, player.y + player.h / 2);

        if (score > highScore) {
            highScore = Math.floor(score);
            localStorage.setItem('dino_highscore', highScore);
        }

        finalScoreEl.textContent = formatScore(score);
        bestScoreEl.textContent = formatScore(highScore);

        if (isHighScore(Math.floor(score))) {
            newHighscoreDiv.classList.remove('hidden');
            saveScoreBtn.disabled = false;
            playerNameInput.value = '';
        } else {
            newHighscoreDiv.classList.add('hidden');
        }

        // Short delay before showing overlay
        setTimeout(() => {
            hud.classList.add('hidden');
            gameoverScreen.classList.remove('hidden');
        }, 600);
    }

    function victory() {
        state = 'victory';
        soundManager.milestone();
        particles.emitScorePop(canvas.width / 2, canvas.height / 2);
        particles.emitScorePop(canvas.width / 2 - 50, canvas.height / 2 - 20);
        particles.emitScorePop(canvas.width / 2 + 50, canvas.height / 2 - 20);

        if (score > highScore) {
            highScore = 9999;
            localStorage.setItem('dino_highscore', highScore);
        }

        victoryFinalScore.textContent = '09999';

        if (isHighScore(9999)) {
            victoryHighscoreDiv.classList.remove('hidden');
            victorySaveBtn.disabled = false;
            victoryPlayerName.value = '';
        } else {
            victoryHighscoreDiv.classList.add('hidden');
        }

        setTimeout(() => {
            hud.classList.add('hidden');
            victoryScreen.classList.remove('hidden');
        }, 800);
    }

    // Victory button handlers
    victorySaveBtn.addEventListener('click', () => {
        const name = victoryPlayerName.value.trim() || 'Champion';
        addToLeaderboard(name, 9999);
        victoryHighscoreDiv.classList.add('hidden');
        victorySaveBtn.disabled = true;
    });

    victoryMenuBtn.addEventListener('click', () => {
        victoryScreen.classList.add('hidden');
        hud.classList.add('hidden');
        startScreen.classList.remove('hidden');
        state = 'start';
        player.reset();
        obstacles = [];
        particles.clear();
        easterEggs.clear();
        bg.toggle(false);
    });

    victoryLeaderboardBtn.addEventListener('click', () => showLeaderboard('victory'));

    // ── Input ───────────────────────────────────────────────
    const keys = {};

    document.addEventListener('keydown', e => {
        keys[e.code] = true;

        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            if (state === 'start') startGame();
            else if (state === 'gameover' && !gameoverScreen.classList.contains('hidden')) startGame();
            else if (state === 'playing') {
                if (player.jump()) {
                    soundManager.jump();
                    particles.emitJumpTrail(player.x, player.y + player.h);
                }
            }
        }

        if (e.code === 'ArrowDown' && state === 'playing') {
            e.preventDefault();
            player.duck(true);
            if (!player.isJumping) soundManager.duck();
        }
    });

    document.addEventListener('keyup', e => {
        keys[e.code] = false;
        if (e.code === 'ArrowDown' && state === 'playing') {
            player.duck(false);
        }
    });

    // Touch support
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if (state === 'start') startGame();
        else if (state === 'playing') {
            if (player.jump()) {
                soundManager.jump();
                particles.emitJumpTrail(player.x, player.y + player.h);
            }
        }
    });

    // Tap on overlays to restart
    gameoverScreen.addEventListener('touchstart', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
        if (state === 'gameover') startGame();
    });

    startScreen.addEventListener('touchstart', e => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('.char-option')) return;
        if (state === 'start') startGame();
    });

    // ── Game loop ───────────────────────────────────────────
    function update() {
        if (state !== 'playing') return;

        // Score & speed
        score += speed * 0.02;
        if (score >= 9999) {
            score = 9999;
            victory();
            return;
        }
        speed = Math.min(
            GAME_CONFIG.MAX_SPEED,
            GAME_CONFIG.INITIAL_SPEED + score * GAME_CONFIG.SPEED_INCREMENT,
        );

        // Milestones (every 100 pts)
        const milestone = Math.floor(score / 100);
        if (milestone > lastMilestone) {
            lastMilestone = milestone;
            soundManager.milestone();
            particles.emitScorePop(canvas.width / 2, 30);
        }

        // Day/night toggle
        const cycle = Math.floor(score / GAME_CONFIG.DAY_NIGHT_INTERVAL);
        bg.toggle(cycle % 2 === 1);

        // Update entities
        bg.update(speed);
        easterEggs.update(speed);
        player.update();
        particles.update();

        // Obstacle spawning (max 3 on screen at once)
        // Gap shrinks slightly with speed so density grows, but stays playable
        const minGap = Math.max(40, GAME_CONFIG.MIN_OBSTACLE_GAP - Math.floor(score / 200) * 3);
        // Spawn rate increases gently with score
        const spawnRate = Math.min(0.04, GAME_CONFIG.OBSTACLE_SPAWN_RATE + score * 0.000005);
        framesSinceObstacle++;
        if (obstacles.length < 3 &&
            framesSinceObstacle > minGap &&
            Math.random() < spawnRate) {
            obstacles.push(spawnObstacle(GAME_CONFIG.GROUND_Y, score));
            framesSinceObstacle = 0;
        }

        // Update obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update(speed);
            if (obstacles[i].offScreen) {
                obstacles.splice(i, 1);
                continue;
            }
            // Collision
            if (collides(player.hitbox, obstacles[i].hitbox)) {
                gameOver();
                return;
            }
        }

        // Running dust
        if (!player.isJumping && Math.random() < 0.4) {
            particles.emitDust(player.x, player.y + player.h);
        }

        // HUD
        hiScoreEl.textContent = `HI ${formatScore(highScore)}`;
        currentScoreEl.textContent = formatScore(score);
        const speedMultiplier = (speed / GAME_CONFIG.INITIAL_SPEED).toFixed(1);
        speedIndicator.textContent = `Speed: ${speedMultiplier}x`;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bg.draw(ctx);
        easterEggs.draw(ctx);
        obstacles.forEach(o => o.draw(ctx));
        player.draw(ctx, bg.isNight);
        particles.draw(ctx);
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    // ── Init ────────────────────────────────────────────────
    hiScoreEl.textContent = `HI ${formatScore(highScore)}`;
    bg.draw(ctx);          // draw initial background on canvas
    player.draw(ctx, bg.isNight);      // draw idle dino
    loop();
})();
