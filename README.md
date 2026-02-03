# Advanced Snake Game – Complete Implementation Guide

## Table of Contents
1. Project Overview  
2. Architecture  
3. Folder Structure  
4. API Documentation  
5. JSON Leaderboard Schema  
6. Game Mechanics & Difficulty Scaling  
7. Mobile Controls Implementation  
8. Local Development Guide  
9. Deployment Instructions  
10. Code Examples  

---

## Project Overview

The **Advanced Snake Game** is a full-stack, production-ready web application featuring:

- **Python Backend**: FastAPI REST API with JSON-based leaderboard
- **React Frontend**: React 18 + HTML5 Canvas game engine
- **Mobile Support**: Swipe gestures + on-screen D-pad
- **Difficulty Scaling**: Dynamic speed and obstacle progression
- **Persistent Leaderboard**: Thread-safe atomic JSON storage
- **Modern UI**: Responsive layout with dark theme
- **Deployment Ready**: Vercel + Render/Railway compatible

### Key Features

✅ Player name input  
✅ Real-time score & difficulty tracking  
✅ Dynamic speed & obstacle scaling  
✅ Persistent leaderboard with rankings  
✅ RESTful API integration  
✅ Mobile-friendly controls  
✅ Pause / resume gameplay  
✅ Personal best score tracking  

---

## Architecture

### System Design

┌───────────────────────────────────────────────┐
│ React Frontend (Vercel) │
│ ┌─────────────────────────────────────────┐ │
│ │ React 18 App (Hooks + Components) │ │
│ │ ├─ GameBoard (Canvas Renderer) │ │
│ │ ├─ GameUI (Score, Controls, Status) │ │
│ │ ├─ Services (Logic, Input, API) │ │
│ │ └─ Mobile Controls (Swipe + D-pad) │ │
│ └─────────────────────────────────────────┘ │
└───────────────┬──────────────────────────────┘
│ REST API
▼
┌───────────────────────────────────────────────┐
│ FastAPI Backend (Render/Railway) │
│ ┌─────────────────────────────────────────┐ │
│ │ Game Session & Score Validation │ │
│ │ Leaderboard Management │ │
│ │ Thread-Safe JSON Persistence │ │
│ └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘


---

## Folder Structure

Snake Game/
├── backend/
│ ├── main.py
│ ├── game_logic.py
│ ├── leaderboard.py
│ ├── leaderboard.json
│ ├── requirements.txt
│ └── .gitignore
│
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── App.jsx
│ │ ├── components/
│ │ │ ├── GameBoard.jsx
│ │ │ └── GameUI.jsx
│ │ ├── services/
│ │ │ ├── gameEngine.js
│ │ │ ├── canvasRenderer.js
│ │ │ ├── inputController.js
│ │ │ └── apiService.js
│ │ └── styles/
│ ├── .env.example
│ ├── package.json
│ └── README.md
│
└── docs/
├── API.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
└── README.md


---

## Frontend – React Version

This directory contains the **React-based frontend** for the Advanced Snake Game.

### Tech Stack

- React 18 (Hooks-based)
- HTML5 Canvas rendering
- CSS Grid & Flexbox
- Responsive & mobile-first design
- Dark theme UI

---

## Quick Start (Frontend)

```bash
npm install
cp .env.example .env.local
npm start

Open http://localhost:3000
 to play.

Available Scripts
Command	Description
npm start	Run development server
npm run build	Build for production
npm test	Run tests
npm eject	Eject CRA (irreversible)

Configuration
Environment Variables
REACT_APP_API_URL=http://localhost:8000
Change this value when deploying to production.

Frontend Architecture
Component Responsibilities

App.jsx

Game lifecycle & loop

Global state using hooks

Backend API integration

GameBoard

Canvas rendering

Responsive resizing

GameUI

Score, difficulty & controls

Pause / resume / leaderboard UI

Services

Game logic & collisions

Difficulty scaling

Input handling

API communication

Mobile Support

Automatically enabled on mobile devices:

✅ Swipe gestures
✅ On-screen D-pad
✅ Responsive canvas resizing
✅ Input debouncing

Local Development Guide
Backend Setup

cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs at:
http://localhost:8000

Frontend Setup
cd frontend
npm install
npm start

Frontend runs at:
http://localhost:3000

Deployment

Frontend → Vercel

Backend → Render or Railway

See full guide in:
docs/DEPLOYMENT.md

Status

Total Frontend Code: 2,000+ lines (React + CSS)
Total Backend Code: Production-grade FastAPI
Status: Production Ready ✅

License

MIT License