"""
Leaderboard Management System

Handles JSON-based leaderboard storage with thread-safe file operations
and atomic writes to prevent data corruption.
"""

import json
import threading
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import shutil


class LeaderboardManager:
    """
    Manages a JSON-based leaderboard with safe file operations.
    
    Uses file locking and atomic writes to ensure data consistency
    across concurrent operations.
    """

    def __init__(self, filepath: str = "leaderboard.json"):
        """
        Initialize the leaderboard manager.
        
        Args:
            filepath: Path to the leaderboard JSON file.
        """
        self.filepath = Path(filepath)
        self.lock = threading.RLock()
        
        # Create leaderboard file if it doesn't exist
        if not self.filepath.exists():
            self._initialize_leaderboard()
    
    def _initialize_leaderboard(self):
        """Create an empty leaderboard file."""
        with self.lock:
            self.filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(self.filepath, 'w') as f:
                json.dump({"players": []}, f, indent=2)
    
    def _read_leaderboard(self) -> Dict:
        """
        Safely read leaderboard from file.
        
        Returns:
            Leaderboard dictionary.
        """
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {"players": []}
    
    def _write_leaderboard(self, data: Dict):
        """
        Safely write leaderboard to file using atomic writes.
        
        Creates a temporary file, writes to it, then atomically
        replaces the original to prevent corruption.
        
        Args:
            data: Leaderboard dictionary to write.
        """
        temp_filepath = self.filepath.with_suffix('.tmp')
        
        try:
            # Write to temporary file
            with open(temp_filepath, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Atomic replace
            shutil.move(str(temp_filepath), str(self.filepath))
        except Exception as e:
            # Clean up temp file if it exists
            if temp_filepath.exists():
                temp_filepath.unlink()
            raise e
    
    def submit_score(self, player_name: str, score: int, time_taken: int = 0) -> bool:
        """
        Submit a score for a player.
        
        Only updates if the new score is higher than the existing best score.
        
        Args:
            player_name: Name of the player.
            score: Score to submit.
            time_taken: Time taken to achieve the score (in seconds).
        
        Returns:
            True if leaderboard was updated, False otherwise.
        """
        with self.lock:
            leaderboard = self._read_leaderboard()
            
            # Find existing player
            player = None
            for p in leaderboard["players"]:
                if p["name"].lower() == player_name.lower():
                    player = p
                    break
            
            # Check if new score is better
            if player:
                if score <= player["best_score"]:
                    return False
                
                # Update existing player
                player["best_score"] = score
                player["date"] = datetime.utcnow().isoformat()
                player["time_taken"] = time_taken
            else:
                # Add new player
                leaderboard["players"].append({
                    "name": player_name,
                    "best_score": score,
                    "date": datetime.utcnow().isoformat(),
                    "time_taken": time_taken
                })
            
            # Sort by score descending
            leaderboard["players"].sort(
                key=lambda p: (-p["best_score"], p["name"])
            )
            
            # Write back
            self._write_leaderboard(leaderboard)
            return True
    
    def get_leaderboard(self, top_n: int = 10) -> List[Dict]:
        """
        Get top N entries from the leaderboard.
        
        Args:
            top_n: Number of top entries to return.
        
        Returns:
            List of player dictionaries sorted by score.
        """
        with self.lock:
            leaderboard = self._read_leaderboard()
            
            # Sort by score descending, then by name ascending
            players = sorted(
                leaderboard["players"],
                key=lambda p: (-p["best_score"], p["name"])
            )
            
            return players[:top_n]
    
    def get_player_best_score(self, player_name: str) -> Optional[Dict]:
        """
        Get the best score for a specific player.
        
        Args:
            player_name: Name of the player.
        
        Returns:
            Player dictionary or None if not found.
        """
        with self.lock:
            leaderboard = self._read_leaderboard()
            
            for player in leaderboard["players"]:
                if player["name"].lower() == player_name.lower():
                    return player
            
            return None
    
    def get_player_rank(self, player_name: str) -> Optional[int]:
        """
        Get the rank of a specific player (1-indexed).
        
        Args:
            player_name: Name of the player.
        
        Returns:
            Rank (1-indexed) or None if not found.
        """
        with self.lock:
            leaderboard = self._read_leaderboard()
            
            players = sorted(
                leaderboard["players"],
                key=lambda p: (-p["best_score"], p["name"])
            )
            
            for rank, player in enumerate(players, 1):
                if player["name"].lower() == player_name.lower():
                    return rank
            
            return None
    
    def get_all_players(self) -> List[Dict]:
        """
        Get all players sorted by score.
        
        Returns:
            List of all player dictionaries.
        """
        with self.lock:
            leaderboard = self._read_leaderboard()
            
            players = sorted(
                leaderboard["players"],
                key=lambda p: (-p["best_score"], p["name"])
            )
            
            return players
