import React from 'react';
import './GameBoard.css';

function GameBoard({ canvasRef }) {
  return (
    <div className="game-board">
      <canvas ref={canvasRef} className="canvas" />
    </div>
  );
}

export default GameBoard;
