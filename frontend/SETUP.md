# React Frontend - Setup Instructions

## Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

## Installation

```bash
cd frontend
npm install
```

## Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update `REACT_APP_API_URL` in `.env.local` to match your backend URL:
```
REACT_APP_API_URL=http://localhost:8000
```

## Running Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

Output will be in the `build/` directory, ready for deployment.

## Project Structure

```
src/
├── App.jsx                 # Main application component
├── App.css                 # App styling
├── index.jsx              # React entry point
├── index.css              # Global styles
├── components/            # React components
│   ├── GameBoard.jsx
│   ├── GameBoard.css
│   ├── GameUI.jsx
│   └── GameUI.css
└── services/              # Business logic
    ├── gameEngine.js      # Game state management
    ├── canvasRenderer.js  # Canvas rendering
    ├── inputController.js # Input handling
    └── apiService.js      # Backend API calls
```

## Key Features

- ⚛️ Modern React with Hooks
- 🎮 HTML5 Canvas rendering
- 📱 Mobile touch controls
- 🔗 RESTful API integration
- 🎨 Dark theme UI
- 📊 Leaderboard system

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### GitHub Pages
```bash
npm run build
# Push `build/` folder to gh-pages branch
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

**API Connection Error**: Ensure backend is running and `REACT_APP_API_URL` is correct
**Port 3000 already in use**: 
```bash
npm start -- --port 3001
```

**Node modules issues**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support
For issues or questions, check the main project documentation in the root README.md
