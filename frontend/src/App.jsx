import React, { useState, useEffect, useRef } from 'react';
import GameEngine from './services/gameEngine';
import CanvasRenderer from './services/canvasRenderer';
import InputController from './services/inputController';
import APIService from './services/apiService';
import GamePanel from './components/GamePanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [playerRank, setPlayerRank] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerBest, setPlayerBest] = useState(0);
  const [difficulty, setDifficulty] = useState(1);

  const gameEngineRef = useRef(null);
  const gameLoopRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const inputControllerRef = useRef(null);
  const gamePausedRef = useRef(false);
  const gameStateRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  const gamePausedTimeRef = useRef(0);

  const API = APIService.getInstance();

  // Initialize game
  const initializeGame = async () => {
    try {
      await loadLeaderboard();
      try {
        const best = await API.getPlayerBestScore(playerName);
        setPlayerBest(best.best_score || 0);
      } catch {
        setPlayerBest(0);
      }

      const response = await API.startGame(playerName);
      gameEngineRef.current = new GameEngine(response.grid_width, response.grid_height);
      gameStartTimeRef.current = Date.now();
      gamePausedTimeRef.current = 0;
      setGameStarted(true);
      setGameOver(false);
      setGamePaused(false);
      setFinalScore(0);
      startGameLoop();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  // Game loop
  const startGameLoop = () => {
    let lastUpdateTime = Date.now();
    let pauseStartTime = null;
    const FPS = 60;
    const frameTime = 1000 / FPS;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateTime;

      if (deltaTime >= frameTime) {
        // Check current pause state from ref to avoid closure issues
        if (!gamePausedRef.current && gameEngineRef.current) {
          // If just resumed, add pause duration to total paused time
          if (pauseStartTime !== null) {
            gamePausedTimeRef.current += now - pauseStartTime;
            pauseStartTime = null;
          }

          const engine = gameEngineRef.current;
          const newDifficulty = 1 + Math.floor(engine.score / 50);
          setDifficulty(newDifficulty);
          const baseSpeed = 4;
          const gameSpeed = Math.min(baseSpeed + newDifficulty * 1.5, 12);
          const updateInterval = 1000 / gameSpeed;

          if (now - engine.lastMoveTime >= updateInterval) {
            engine.update();
            engine.lastMoveTime = now;
          }

          const newState = engine.getState();
          setGameState(newState);

          if (newState.game_over) {
            endGame(newState.score);
          }

          if (canvasRef.current && rendererRef.current) {
            rendererRef.current.render(newState, gamePausedRef.current, engine.score);
          }
        } else if (canvasRef.current && rendererRef.current) {
          // Track pause start time when paused
          if (gamePausedRef.current && pauseStartTime === null) {
            pauseStartTime = now;
          }

          // Still render when paused to show pause overlay
          if (gameStateRef.current) {
            rendererRef.current.render(gameStateRef.current, gamePausedRef.current, gameStateRef.current.score || 0);
          }
        }
        lastUpdateTime = now;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  // End game
  const endGame = async (score) => {
    setGameOver(true);
    setFinalScore(score);
    cancelAnimationFrame(gameLoopRef.current);

    try {
      // Calculate time taken (excluding pause time)
      const totalTime = Date.now() - gameStartTimeRef.current;
      const timeTaken = Math.floor((totalTime - gamePausedTimeRef.current) / 1000);

      const diffLevel = 1 + Math.floor(score / 50);
      const response = await API.submitScore(playerName, score, diffLevel, timeTaken);
      setPlayerRank(response.rank);
      await loadLeaderboard();
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const response = await API.getLeaderboard(10);
      setLeaderboard(response.leaderboard || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  // Update refs when state changes
  useEffect(() => {
    gamePausedRef.current = gamePaused;
  }, [gamePaused]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Setup input controller
  useEffect(() => {
    if (gameStarted && !inputControllerRef.current) {
      inputControllerRef.current = new InputController();
      inputControllerRef.current.addEventListener('direction', (direction) => {
        if (gameEngineRef.current) {
          gameEngineRef.current.handleInput(direction);
        }
      });
      inputControllerRef.current.addEventListener('pause', () => {
        setGamePaused((prev) => !prev);
      });
      inputControllerRef.current.addEventListener('restart', () => {
        setGameStarted(false);
        setGameOver(false);
        setPlayerName('');
        setGameState(null);
        cancelAnimationFrame(gameLoopRef.current);
      });
    }
  }, [gameStarted]);

  // Setup canvas renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, 20, 20);
      setTimeout(() => {
        rendererRef.current.updateCanvasSize();
      }, 100);
    }
  }, [gameStarted]);

  return (
    <div className="app">
      {!gameStarted && (
        <div className="start-screen">
          <div className="start-modal">
            <h1>🐍 Snake Rush</h1>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 50))}
              onKeyPress={(e) => e.key === 'Enter' && playerName && initializeGame()}
              maxLength="50"
              className="player-input"
            />
            <button
              onClick={initializeGame}
              disabled={!playerName}
              className="start-button"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <div className="game-container">
          <GamePanel
            playerName={playerName}
            score={gameState?.score || 0}
            difficulty={difficulty}
            playerBest={playerBest}
            gamePaused={gamePaused}
            gameOver={gameOver}
            finalScore={finalScore}
            playerRank={playerRank}
            onPauseToggle={() => setGamePaused(!gamePaused)}
            onRestart={() => {
              setGameStarted(false);
              setGameOver(false);
              setPlayerName('');
              setGameState(null);
              cancelAnimationFrame(gameLoopRef.current);
            }}
          />

          <div className="game-center">
            <canvas ref={canvasRef} className="game-canvas" />

            {gameOver && (
              <div className="game-over-overlay">
                <div className="game-over-content">
                  <h2>Game Over!</h2>
                  <p className="final-score">{finalScore}</p>
                  {playerRank && <p className="rank">Rank: #{playerRank}</p>}
                  <button
                    onClick={() => {
                      setGameStarted(false);
                      setGameOver(false);
                      setPlayerName('');
                      setGameState(null);
                      cancelAnimationFrame(gameLoopRef.current);
                    }}
                    className="play-again-btn"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>

          <LeaderboardPanel leaderboard={leaderboard} currentPlayer={playerName} />
        </div>
      )}
    </div>
  );
}

export default App;
