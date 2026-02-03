"""
Advanced Snake Game Logic

This module contains the core game logic for the Snake game,
including snake movement, collision detection, food generation,
and difficulty scaling.
"""

import random
from enum import Enum
from typing import List, Tuple, Optional


class Direction(Enum):
    """Direction enumeration for snake movement."""
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)


class SnakeGame:
    """
    Core Snake game engine with difficulty scaling and obstacle management.
    
    Attributes:
        width: Grid width
        height: Grid height
        player_name: Name of the player
    """

    def __init__(self, width: int = 20, height: int = 20, player_name: str = "Player"):
        """Initialize the snake game."""
        self.width = width
        self.height = height
        self.player_name = player_name
        
        # Game state
        self.score = 0
        self.game_over = False
        self.paused = False
        
        # Snake: list of (x, y) tuples representing body segments
        self.snake = [(width // 2, height // 2)]
        self.direction = Direction.RIGHT
        self.next_direction = Direction.RIGHT
        
        # Food and obstacles
        self.food = self._generate_food()
        self.obstacles = []
        
        # Difficulty scaling
        self.difficulty_level = 1
        self.base_speed = 4  # Game ticks per second equivalent
        self.speed = self.base_speed
        
        # Game statistics
        self.ticks = 0
        
    def _generate_food(self) -> Tuple[int, int]:
        """Generate food at a random position not occupied by snake or obstacles."""
        while True:
            x = random.randint(0, self.width - 1)
            y = random.randint(0, self.height - 1)
            
            # Ensure food doesn't spawn on snake or obstacles
            if (x, y) not in self.snake and (x, y) not in self.obstacles:
                return (x, y)
    
    def _generate_obstacles(self, count: int) -> List[Tuple[int, int]]:
        """Generate obstacles at random positions not occupied by snake or food."""
        obstacles = []
        attempts = 0
        max_attempts = 100
        
        while len(obstacles) < count and attempts < max_attempts:
            x = random.randint(0, self.width - 1)
            y = random.randint(0, self.height - 1)
            
            # Ensure obstacles don't spawn on snake or food
            if (x, y) not in self.snake and (x, y) != self.food and (x, y) not in obstacles:
                # Don't spawn obstacles too close to snake head
                head_x, head_y = self.snake[0]
                if abs(x - head_x) > 3 or abs(y - head_y) > 3:
                    obstacles.append((x, y))
            
            attempts += 1
        
        return obstacles
    
    def _update_difficulty(self):
        """Update game difficulty based on current score."""
        # Difficulty increases every 50 points
        new_difficulty = 1 + (self.score // 50)
        
        if new_difficulty != self.difficulty_level:
            self.difficulty_level = new_difficulty
            
            # Increase speed
            self.speed = min(self.base_speed + (self.difficulty_level - 1) * 1.5, 12)
            
            # Add obstacles starting at difficulty 3 (150 points)
            if self.difficulty_level >= 3:
                obstacle_count = min(2 + (self.difficulty_level - 3) * 2, 10)
                self.obstacles = self._generate_obstacles(obstacle_count)
    
    def set_direction(self, direction: Direction):
        """
        Set the next direction for the snake.
        Prevents the snake from reversing into itself.
        """
        # Prevent reversing
        current_x, current_y = self.direction.value
        new_x, new_y = direction.value
        
        if (current_x + new_x, current_y + new_y) != (0, 0):
            self.next_direction = direction
    
    def update(self) -> bool:
        """
        Update game state. Called on each game tick.
        
        Returns:
            True if game should continue, False if game over.
        """
        if self.game_over or self.paused:
            return not self.game_over
        
        self.ticks += 1
        self.direction = self.next_direction
        
        # Calculate new head position
        head_x, head_y = self.snake[0]
        dx, dy = self.direction.value
        new_head = (head_x + dx, new_head_y := head_y + dy)
        
        # Check wall collision
        if new_head[0] < 0 or new_head[0] >= self.width or \
           new_head[1] < 0 or new_head[1] >= self.height:
            self.game_over = True
            return False
        
        # Check self collision
        if new_head in self.snake:
            self.game_over = True
            return False
        
        # Check obstacle collision
        if new_head in self.obstacles:
            self.game_over = True
            return False
        
        # Add new head
        self.snake.insert(0, new_head)
        
        # Check food collision
        if new_head == self.food:
            self.score += 10
            self.food = self._generate_food()
            self._update_difficulty()
        else:
            # Remove tail if no food eaten
            self.snake.pop()
        
        return True
    
    def get_game_state(self) -> dict:
        """
        Get the current game state as a dictionary.
        
        Returns:
            Dictionary containing game state information.
        """
        return {
            "player_name": self.player_name,
            "score": self.score,
            "difficulty_level": self.difficulty_level,
            "snake": self.snake,
            "food": self.food,
            "obstacles": self.obstacles,
            "game_over": self.game_over,
            "paused": self.paused,
            "speed": self.speed,
            "width": self.width,
            "height": self.height,
        }
    
    def restart(self, player_name: Optional[str] = None):
        """Reset the game to initial state."""
        if player_name:
            self.player_name = player_name
        
        self.score = 0
        self.game_over = False
        self.paused = False
        self.snake = [(self.width // 2, self.height // 2)]
        self.direction = Direction.RIGHT
        self.next_direction = Direction.RIGHT
        self.food = self._generate_food()
        self.obstacles = []
        self.difficulty_level = 1
        self.speed = self.base_speed
        self.ticks = 0
    
    def toggle_pause(self):
        """Toggle pause state."""
        self.paused = not self.paused
