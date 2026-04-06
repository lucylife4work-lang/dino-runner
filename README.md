# Dino Runner

A Chrome offline dinosaur-style endless runner game built with pure **HTML5 Canvas** and **Vanilla JavaScript**. No frameworks, no dependencies.

## Play

Open `index.html` in any modern browser — no build step required.

Or try the live demo: [GitHub Pages link here]

## Features

- **3 Playable Characters** — Dino, Ninja, Astronaut (pixel-art sprites)
- **Progressive Difficulty** — Speed increases over time up to a maximum cap
- **Day/Night Cycle** — Dynamic sky transitions with stars, moon, and clouds
- **Multiple Obstacles** — Small/large cacti, cactus clusters, and pterodactyls
- **Particle Effects** — Running dust, jump trails, collision explosions, score sparkles
- **Sound Effects** — Synthesised via Web Audio API (no external audio files)
- **Leaderboard** — Top 10 scores saved to localStorage
- **Mobile Support** — Touch controls for jumping
- **Responsive** — Scales to fit mobile screens

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Jump | `Space` / `Arrow Up` | Tap |
| Duck | `Arrow Down` (hold) | — |
| Fast Fall | `Arrow Down` (while airborne) | — |

## Tech Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript (ES6+)
- CSS3 with Google Fonts (Press Start 2P)
- Web Audio API for procedural sound effects
- localStorage for persistent high scores

## Project Structure

```
dino-runner/
├── index.html          # Entry point
├── css/
│   └── style.css       # All styles
├── js/
│   ├── utils.js        # Constants & helpers
│   ├── sound.js        # Web Audio sound effects
│   ├── particles.js    # Particle system
│   ├── background.js   # Sky, clouds, day/night
│   ├── player.js       # Character sprites & physics
│   ├── obstacle.js     # Cactus & pterodactyl
│   └── game.js         # Main game loop & UI
└── README.md
```

## License

MIT
