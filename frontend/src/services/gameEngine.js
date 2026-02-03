class GameEngine {
  constructor(width = 20, height = 20) {
    this.width = width;
    this.height = height;
    this.snake = [{ x: Math.floor(width / 2), y: Math.floor(height / 2) }];
    this.direction = { dx: 1, dy: 0 };
    this.nextDirection = { dx: 1, dy: 0 };
    this.obstacles = [];
    this.score = 0;
    this.gameOver = false;
    this.lastMoveTime = Date.now();
    this.food = this.generateFood();
  }

  generateFood() {
    let food;
    let valid = false;
    while (!valid) {
      food = {
        x: Math.floor(Math.random() * this.width),
        y: Math.floor(Math.random() * this.height),
      };
      valid = !this.isSnakePosition(food) && !this.isObstaclePosition(food);
    }
    return food;
  }

  generateObstacles() {
    const difficulty = 1 + Math.floor(this.score / 50);
    if (difficulty < 3) return;

    const targetCount = 2 + Math.floor(difficulty / 3);
    const maxAttempts = 50;
    let attempts = 0;

    while (this.obstacles.length < targetCount && attempts < maxAttempts) {
      const obstacle = {
        x: Math.floor(Math.random() * this.width),
        y: Math.floor(Math.random() * this.height),
      };

      const headX = this.snake[0].x;
      const headY = this.snake[0].y;
      const distance = Math.sqrt(
        Math.pow(obstacle.x - headX, 2) + Math.pow(obstacle.y - headY, 2)
      );

      if (
        distance > 3 &&
        !this.isSnakePosition(obstacle) &&
        !this.isObstaclePosition(obstacle)
      ) {
        this.obstacles.push(obstacle);
      }

      attempts++;
    }
  }

  isSnakePosition(pos) {
    return this.snake.some((segment) => segment.x === pos.x && segment.y === pos.y);
  }

  isObstaclePosition(pos) {
    return this.obstacles.some(
      (obstacle) => obstacle.x === pos.x && obstacle.y === pos.y
    );
  }

  handleInput(direction) {
    if (
      (direction.dx !== 0 && this.direction.dx === 0) ||
      (direction.dy !== 0 && this.direction.dy === 0)
    ) {
      this.nextDirection = direction;
    }
  }

  update() {
    this.direction = this.nextDirection;

    const head = this.snake[0];
    const newHead = {
      x: (head.x + this.direction.dx + this.width) % this.width,
      y: (head.y + this.direction.dy + this.height) % this.height,
    };

    if (this.isSnakePosition(newHead) || this.isObstaclePosition(newHead)) {
      this.gameOver = true;
      return;
    }

    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.food = this.generateFood();
      this.generateObstacles();
    } else {
      this.snake.pop();
    }
  }

  getState() {
    return {
      snake: this.snake,
      food: this.food,
      obstacles: this.obstacles,
      score: this.score,
      game_over: this.gameOver,
      width: this.width,
      height: this.height,
    };
  }
}

export default GameEngine;
