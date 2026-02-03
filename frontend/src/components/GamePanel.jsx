import React from 'react';
import './GamePanel.css';

function GamePanel({
  playerName,
  score,
  difficulty,
  playerBest,
  gamePaused,
  gameOver,
  finalScore,
  playerRank,
  onPauseToggle,
  onRestart,
}) {
  return (
    <div className="game-panel left-panel">
      <div className="player-name">
        <span className="user-icon">👤</span>
        <span>{playerName}</span>
      </div>

      <div className="stat-box">
        <div className="stat-label">Score</div>
        <div className="stat-value">{score}</div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Personal Best</div>
        <div className="stat-value">{playerBest}</div>
      </div>

      <div className="controls-section">
        <button onClick={onPauseToggle} className="control-btn">
          {gamePaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button onClick={onRestart} className="control-btn danger">
          🔄 New Game
        </button>
      </div>

      <div className="instructions">
        <div className="instructions-title">Instructions:</div>
        <ol className="instructions-list">
          <li>Move with arrow keys/WASD/IJKl</li>
          <li>Eat the orange squares</li>
          <li>Don't touch your tail</li>
          <li>Pause/Unpause with Space</li>
        </ol>
      </div>

      {gameOver && (
        <div className="game-over-summary">
          <div className="summary-label">Game Over!</div>
          <div className="summary-score">Score: {finalScore}</div>
          {playerRank && <div className="summary-rank">Rank: #{playerRank}</div>}
        </div>
      )}
    </div>
  );
}

export default GamePanel;
