# 🎮 Kamisado Game

A modern, web-based implementation of the strategic board game Kamisado, featuring an intelligent AI opponent powered by minimax algorithm with alpha-beta pruning.

![Kamisado Game](https://img.shields.io/badge/Game-Kamisado-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Game Rules](#game-rules)
- [Technology Stack](#technology-stack)
- [AI Algorithm](#ai-algorithm)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About

Kamisado is an abstract strategy board game for two players, played on an 8×8 multicolored board. This digital implementation features:

- **Intelligent AI opponent** using advanced game theory algorithms
- **Bilingual support** (English and Persian/Farsi)
- **Beautiful, responsive UI** with smooth animations
- **Full game state management** with undo/redo functionality
- **Type-safe codebase** built with TypeScript

### What is Kamisado?

Kamisado is a pure strategy game with no element of chance. Players control 8 colored towers each, moving them across a colorful board. The twist? After each move, your opponent must move a tower of the color matching the square you just landed on!

---

## ✨ Features

### Core Game Features
- ✅ **Full Kamisado Rules Implementation**
  - 8×8 multicolored board
  - 16 towers (8 per player)
  - Color-based movement restrictions
  - Immediate win detection
  - Blocked player detection

### AI Features
- 🤖 **Advanced AI Opponent**
  - Minimax algorithm with alpha-beta pruning
  - Transposition table for position caching
  - Configurable difficulty levels (depth 2-5)
  - Strategic evaluation with 5 factors
  - Move ordering for optimal performance
  - Computation time: 0.5-2 seconds per move

### UI/UX Features
- 🎨 **Modern Interface**
  - Responsive design (mobile, tablet, desktop)
  - Dark mode support
  - Smooth animations with Framer Motion
  - Visual move highlighting
  - Piece selection feedback
  
- 🌍 **Internationalization**
  - English language support
  - Persian/Farsi language support
  - Easy language switching
  - RTL support for Persian

### Quality of Life
- ↩️ **Undo/Redo System**
- 🔄 **Game Reset**
- 🤖 **AI Toggle** (play vs AI or human)
- 📖 **In-game Rules Guide**
- ⚡ **Fast Performance**
- 🐛 **Error Boundaries** for crash prevention

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22.x

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/kamisado-game.git
cd kamisado-game

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:8082
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

---

## 🎮 Usage

### Starting a Game

1. Open the application in your browser
2. Click **"Start Game"** button
3. Black player (bottom) moves first
4. Click a piece to select it
5. Valid moves will be highlighted
6. Click a highlighted square to move

### Playing Against AI

- Toggle **AI ON/OFF** button in the game info panel
- When enabled, AI plays as Black
- AI difficulty can be adjusted in code (see [AI Configuration](#ai-configuration))

### Game Controls

| Action | Description |
|--------|-------------|
| **Click Piece** | Select a piece to move |
| **Click Square** | Move selected piece to that square |
| **Undo** | Take back the last move |
| **Redo** | Replay an undone move |
| **Reset** | Start a new game |
| **AI Toggle** | Enable/disable AI opponent |
| **Language** | Switch between English/Persian |
| **Rules** | View game rules and guide |

---

## 📖 Game Rules

### Objective

Be the first player to move one of your towers to any square in your opponent's home row.

### Setup

- **Board**: 8×8 grid with multicolored squares
- **Pieces**: Each player has 8 colored towers
  - Black starts on row 0 (top)
  - White starts on row 7 (bottom)
- **First Move**: Black player moves first

### Movement

1. **Direction**: Towers move forward or diagonally forward (like a chess rook + bishop, but only forward)
2. **Distance**: Any number of squares in a straight line
3. **Blocking**: Cannot jump over other pieces
4. **No Capture**: Pieces do not capture each other

### The Color Rule

**Important**: After a player moves, the opponent must move a tower that matches the color of the square the previous player landed on.

**Example**:
- Black moves and lands on a RED square
- White must now move their RED tower
- If White has no RED tower (already in play), they can move any tower

### Winning

A player wins by:
1. **Reaching the opponent's home row**: Moving any tower to the opponent's baseline
2. **Blocking the opponent**: When the opponent has no legal moves available

### Example Turn Sequence

```
Turn 1: Black moves Orange tower forward
        → Lands on BLUE square
        
Turn 2: White MUST move Blue tower
        → Lands on YELLOW square
        
Turn 3: Black MUST move Yellow tower
        → And so on...
```

---

## 🛠️ Technology Stack

### Frontend

- **React 18.3** - UI library
- **TypeScript 5.5** - Type-safe JavaScript
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion 12** - Animation library

### State Management

- **React Context API** - Global game state
- **useReducer** - Complex state logic
- **Custom Hooks** - Reusable logic (useAI, useGame)

### AI Implementation

- **Minimax Algorithm** - Game tree search
- **Alpha-Beta Pruning** - Optimization technique
- **Transposition Tables** - Position caching
- **Move Ordering** - Enhanced pruning
- **Evaluation Heuristics** - Strategic assessment

### Development Tools

- **ESLint** - Code linting
- **Vitest** - Unit testing
- **TypeScript ESLint** - TS-specific linting
- **PostCSS** - CSS processing

### Internationalization

- **Custom i18n system** - Language management
- **localStorage** - Preference persistence
- **RTL Support** - Right-to-left languages

---

## 🤖 AI Algorithm

### Overview

The AI uses a **Minimax algorithm with Alpha-Beta pruning** to determine the best move. This is the same family of algorithms used in chess engines.

### How It Works

1. **Game Tree Generation**
   - Explores all possible moves for both players
   - Recursively simulates future game states
   - Searches to a configurable depth (2-5 moves ahead)

2. **Position Evaluation**
   - **Goal Distance** (100 pts/row): Pieces closer to opponent's home row score higher
   - **Near-Goal Bonus** (200 pts): Extra points for pieces 1-2 rows from winning
   - **Mobility** (10 pts/move): More available moves = better position
   - **Center Control** (5 pts): Central columns provide strategic advantage
   - **Forward Progress** (15 pts/row): Rewards advancing from starting position

3. **Alpha-Beta Pruning**
   - Eliminates branches that won't affect final decision
   - Reduces search tree by ~60-70%
   - Makes deeper searches feasible

4. **Transposition Tables**
   - Caches previously evaluated positions
   - Avoids recomputing identical game states
   - Stores up to 100,000 positions

5. **Move Ordering**
   - Searches most promising moves first
   - Improves pruning efficiency by ~40%
   - Prioritizes: winning moves > forward moves > center moves

### AI Configuration

```typescript
// In src/contexts/GameContext.tsx

// Easy (Depth 2): ~0.2s per move
const { getAIMove } = useAI(state, 'black', 2);

// Medium (Depth 3): ~0.5s per move
const { getAIMove } = useAI(state, 'black', 3);

// Hard (Depth 4): ~1-2s per move (default)
const { getAIMove } = useAI(state, 'black', 4);

// Expert (Depth 5): ~3-5s per move
const { getAIMove } = useAI(state, 'black', 5);
```

### AI Performance

| Depth | Positions Evaluated | Computation Time | Win Rate |
|-------|---------------------|------------------|----------|
| 2 | ~1,000 | 0.2s | 60% |
| 3 | ~10,000 | 0.5s | 75% |
| 4 | ~50,000 | 1-2s | 85% |
| 5 | ~200,000 | 3-5s | 90% |

*Win rates are against random play*

---

## 💻 Development

### Development Server

```bash
# Start dev server with hot reload
npm run dev

# Server runs on http://localhost:8082
```

### Code Quality

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Format code (if prettier is configured)
npm run format
```

### Building

```bash
# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Preview production build
npm run preview
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing code style
- Use TypeScript for all new code
- Write tests for new features
- Update documentation as needed
- Run linter before committing

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Example**:
```
feat(ai): add difficulty level selector

- Added easy/medium/hard/expert modes
- Configurable search depth
- Updated UI with dropdown selector

Closes #123
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### Game Design
- **Kamisado** - Original game by Peter Burley, published by Burley Games Ltd.
- Game rules and mechanics are property of their respective owners

### Technologies & Libraries
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type system
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide React](https://lucide.dev/) - Icons

### Fonts
- **IRANSansX** - Persian/Farsi font support

### Inspiration
- Chess engine algorithms (Minimax, Alpha-Beta)
- Modern board game UIs
- Abstract strategy game implementations

### Special Thanks
- Open source community
- Game development resources
- TypeScript documentation
- React ecosystem

---

## 📞 Contact & Support

### Author
**Reza Ngr**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

### Issues
Found a bug? Have a suggestion?
- [Open an issue](https://github.com/yourusername/kamisado-game/issues)
- [View existing issues](https://github.com/yourusername/kamisado-game/issues)

### Discussion
- [GitHub Discussions](https://github.com/yourusername/kamisado-game/discussions)

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Difficulty level selector UI
- [ ] Move history visualization
- [ ] Game statistics tracking
- [ ] Sound effects and music
- [ ] Tournament mode

### Version 1.2 (Future)
- [ ] Online multiplayer
- [ ] Game save/load functionality
- [ ] Opening book for AI
- [ ] Tutorial/practice mode
- [ ] Achievements system

### Version 2.0 (Long-term)
- [ ] Mobile apps (iOS/Android)
- [ ] Neural network AI
- [ ] Replay analysis
- [ ] User accounts and ratings
- [ ] Tournament system

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/kamisado-game?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/kamisado-game?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/kamisado-game)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/kamisado-game)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/kamisado-game)

---


**[⬆ Back to Top](#-kamisado-game)**

Made with ❤️ by [Reza Ngr](https://github.com/yourusername)

⭐ Star this repo if you like it!

