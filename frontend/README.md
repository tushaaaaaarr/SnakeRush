# Snake Game - React Version

This directory contains the React-based frontend for the Advanced Snake Game.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play!

## Structure

- **src/App.jsx** - Main React application component
- **src/components/** - Reusable React components (GameBoard, GameUI)
- **src/services/** - Game logic, rendering, input, and API services
- **public/index.html** - HTML template
- **package.json** - Dependencies and scripts

## Available Scripts

- `npm start` - Run dev server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)

## Features

✅ React 18 with Hooks
✅ HTML5 Canvas game rendering
✅ Mobile touch controls
✅ Responsive design
✅ Dark theme
✅ RESTful API integration
✅ Player leaderboard
✅ Difficulty scaling

## Configuration

### Environment Variables

```
REACT_APP_API_URL=http://localhost:8000
```

Change `REACT_APP_API_URL` to your backend server address.

## Deployment

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## Architecture

The React app uses a component-based architecture:

- **App.jsx** manages game state and game loop using `useRef` and `useState`
- **GameBoard** displays the canvas
- **GameUI** shows stats and controls
- **Services** handle game logic, rendering, input, and API communication

## Mobile Support

The app automatically detects mobile devices and enables touch controls including:
- Swipe gestures for direction
- On-screen D-pad buttons
- Responsive canvas sizing

---

**Total Frontend Code**: 2,000+ lines of React + CSS
**Status**: Production Ready ✅
