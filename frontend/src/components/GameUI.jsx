import React, { useState, useEffect } from 'react';
import './GameUI.css';

function GameUI({
  gameState,
  playerName,
  gamePaused,
  onPauseToggle,
  onRestart,
  onShowLeaderboard,
}) {
  const [difficulty, setDifficulty] = useState(1);
  const [snakeLength, setSnakeLength] = useState(1);

  useEffect(() => {
    if (gameState) {
      const newDifficulty = 1 + Math.floor(gameState.score / 50);
      setDifficulty(newDifficulty);
      setSnakeLength(gameState.snake ? gameState.snake.length : 1);
    }
  }, [gameState]);

  return (
    <div className="game-ui">
      <div className="ui-section">
        <h3>👤 Player</h3>
        <p>{playerName.substring(0, 20)}</p>
      </div>

      <div className="ui-section">
        <h3>📊 Score</h3>
        <p className="score">{gameState?.score || 0}</p>
      </div>

      <div className="ui-section">
        <h3>⚡ Difficulty</h3>
        <p className="difficulty">Level {difficulty}</p>
      </div>

      <div className="ui-section">
        <h3>🐍 Length</h3>
        <p>{snakeLength}</p>
      </div>

      <div className="ui-section">
        <h3>🎮 Status</h3>
        <p className={gamePaused ? 'paused' : 'playing'}>
          {gamePaused ? '⏸ PAUSED' : '▶ PLAYING'}
        </p>
      </div>

      <div className="ui-controls">
        <button onClick={onPauseToggle} className="control-button">
          {gamePaused ? '▶ Resume' : '⏸ Pause'}
        </button>

        <button onClick={onShowLeaderboard} className="control-button">
          🏆 Leaderboard
        </button>

        <button onClick={onRestart} className="control-button restart">
          🔄 New Game
        </button>
      </div>

      <div className="mobile-controls">
        <button className="mobile-btn up">▲</button>
        <div className="mobile-row">
          <button className="mobile-btn left">◀</button>
          <button className="mobile-btn down">▼</button>
          <button className="mobile-btn right">▶</button>
        </div>
      </div>
    </div>
  );
}

export default GameUI;
