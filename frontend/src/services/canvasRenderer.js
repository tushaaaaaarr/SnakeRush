class CanvasRenderer {
  constructor(canvas, gridWidth = 20, gridHeight = 20) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellSize = 0;

    this.updateCanvasSize();
    window.addEventListener('resize', () => this.updateCanvasSize());
  }

  updateCanvasSize() {
    const container = this.canvas.parentElement;
    if (!container || container.clientWidth === 0) {
      // Container not ready, use default size
      this.canvas.width = 400;
      this.canvas.height = 400;
      this.cellSize = 400 / this.gridWidth;
      return;
    }

    const maxSize = 600;
    const containerWidth = Math.min(container.clientWidth - 40, maxSize);
    const containerHeight = Math.min(container.clientHeight - 40, maxSize);

    const size = Math.min(containerWidth, containerHeight);
    this.canvas.width = size;
    this.canvas.height = size;

    this.cellSize = size / this.gridWidth;
  }

  render(gameState, isPaused, score) {
    if (!gameState) return;

    const ctx = this.ctx;
    const cellSize = this.cellSize;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.gridWidth; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, this.canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= this.gridHeight; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(this.canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw obstacles
    ctx.fillStyle = '#ff6b6b';
    gameState.obstacles.forEach((obstacle) => {
      ctx.fillRect(
        obstacle.x * cellSize + 2,
        obstacle.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4
      );
      // Draw cross pattern
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(obstacle.x * cellSize + 5, obstacle.y * cellSize + 5);
      ctx.lineTo(
        (obstacle.x + 1) * cellSize - 5,
        (obstacle.y + 1) * cellSize - 5
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((obstacle.x + 1) * cellSize - 5, obstacle.y * cellSize + 5);
      ctx.lineTo(obstacle.x * cellSize + 5, (obstacle.y + 1) * cellSize - 5);
      ctx.stroke();
    });

    // Draw food
    if (gameState.food) {
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.arc(
        (gameState.food.x + 0.5) * cellSize,
        (gameState.food.y + 0.5) * cellSize,
        cellSize / 2.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw snake
    if (gameState.snake && gameState.snake.length > 0) {
      gameState.snake.forEach((segment, index) => {
        if (index === 0) {
          ctx.fillStyle = '#76ff03';  // Brighter head
        } else {
          ctx.fillStyle = '#4caf50';
        }
        const x = Math.floor(segment.x * cellSize) + 1;
        const y = Math.floor(segment.y * cellSize) + 1;
        const size = Math.floor(cellSize) - 2;
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#2d5016';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
      });
    }

    // Draw game info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, 40);
    ctx.fillStyle = '#4caf50';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);

    // Draw paused overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw PAUSED text in yellow
      ctx.fillStyle = '#ffc857';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 10;
      ctx.fillText(
        'PAUSED',
        this.canvas.width / 2,
        this.canvas.height / 2 - 40
      );
      
      // Draw press space to continue hint
      ctx.fillStyle = 'rgba(255, 200, 87, 0.7)';
      ctx.font = '16px Arial';
      ctx.fillText(
        'Press SPACE to continue',
        this.canvas.width / 2,
        this.canvas.height / 2 + 80
      );
      
      ctx.textAlign = 'left';
      ctx.shadowColor = 'transparent';
    }
  }
}

export default CanvasRenderer;
