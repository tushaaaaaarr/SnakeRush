"""
FastAPI Backend for Snake Game

Provides REST API endpoints for game sessions, score submission,
and leaderboard management.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import logging

from leaderboard import LeaderboardManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Snake Game API",
    description="Advanced Snake Game Backend",
    version="1.0.0"
)

# Initialize leaderboard manager
leaderboard_manager = LeaderboardManager("leaderboard.json")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Pydantic Models ====================

class GameSessionRequest(BaseModel):
    """Request to start a new game session."""
    player_name: str = Field(..., min_length=1, max_length=50)
    
    class Config:
        schema_extra = {
            "example": {
                "player_name": "John Doe"
            }
        }


class ScoreSubmissionRequest(BaseModel):
    """Request to submit a score."""
    player_name: str = Field(..., min_length=1, max_length=50)
    score: int = Field(..., ge=0)
    difficulty_level: int = Field(default=1, ge=1, le=10)
    time_taken: int = Field(default=0, ge=0)  # Time in seconds
    
    class Config:
        schema_extra = {
            "example": {
                "player_name": "John Doe",
                "score": 250,
                "difficulty_level": 3,
                "time_taken": 120
            }
        }


class ScoreSubmissionResponse(BaseModel):
    """Response after submitting a score."""
    success: bool
    message: str
    leaderboard_position: Optional[int] = None
    new_personal_best: bool = False
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Score submitted successfully",
                "leaderboard_position": 5,
                "new_personal_best": True
            }
        }


class PlayerLeaderboardEntry(BaseModel):
    """Leaderboard entry for a player."""
    name: str
    best_score: int
    date: str
    time_taken: int = 0  # Time in seconds
    rank: Optional[int] = None
    
    class Config:
        schema_extra = {
            "example": {
                "name": "John Doe",
                "best_score": 500,
                "date": "2026-02-03T10:30:45.123456",
                "time_taken": 120,
                "rank": 1
            }
        }


class LeaderboardResponse(BaseModel):
    """Response containing leaderboard entries."""
    entries: List[PlayerLeaderboardEntry]
    total_count: int
    
    class Config:
        schema_extra = {
            "example": {
                "entries": [
                    {
                        "name": "Alice",
                        "best_score": 1000,
                        "date": "2026-02-03T10:30:45.123456",
                        "rank": 1
                    },
                    {
                        "name": "Bob",
                        "best_score": 850,
                        "date": "2026-02-02T15:20:30.654321",
                        "rank": 2
                    }
                ],
                "total_count": 2
            }
        }


class PlayerBestScoreResponse(BaseModel):
    """Response with a player's best score."""
    found: bool
    player_name: Optional[str] = None
    best_score: Optional[int] = None
    date: Optional[str] = None
    time_taken: Optional[int] = None
    rank: Optional[int] = None
    
    class Config:
        schema_extra = {
            "example": {
                "found": True,
                "player_name": "John Doe",
                "best_score": 500,
                "date": "2026-02-03T10:30:45.123456",
                "time_taken": 120,
                "rank": 3
            }
        }


class GameSessionResponse(BaseModel):
    """Response for game session start."""
    session_id: str
    player_name: str
    message: str
    
    class Config:
        schema_extra = {
            "example": {
                "session_id": "session_123456",
                "player_name": "John Doe",
                "message": "Game session started"
            }
        }


class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: str
    
    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "timestamp": "2026-02-03T10:30:45.123456"
            }
        }


# ==================== API Endpoints ====================

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status and current timestamp.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/game/start", response_model=GameSessionResponse)
async def start_game(request: GameSessionRequest):
    """
    Start a new game session.
    
    Args:
        request: Game session request with player name.
    
    Returns:
        Session ID and player information.
    
    Raises:
        HTTPException: If player name is invalid.
    """
    try:
        player_name = request.player_name.strip()
        
        if not player_name or len(player_name) > 50:
            raise HTTPException(
                status_code=400,
                detail="Player name must be between 1 and 50 characters"
            )
        
        # Generate session ID (in production, use proper session management)
        session_id = f"session_{datetime.utcnow().timestamp()}_{player_name}"
        
        logger.info(f"Game started for player: {player_name}")
        
        return {
            "session_id": session_id,
            "player_name": player_name,
            "message": "Game session started successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting game: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/scores/submit", response_model=ScoreSubmissionResponse)
async def submit_score(request: ScoreSubmissionRequest):
    """
    Submit a score to the leaderboard.
    
    Args:
        request: Score submission request.
    
    Returns:
        Success status and updated leaderboard position.
    
    Raises:
        HTTPException: If player name is invalid or score is negative.
    """
    try:
        player_name = request.player_name.strip()
        
        if not player_name or len(player_name) > 50:
            raise HTTPException(
                status_code=400,
                detail="Player name must be between 1 and 50 characters"
            )
        
        if request.score < 0:
            raise HTTPException(
                status_code=400,
                detail="Score cannot be negative"
            )
        
        # Check if this is a new personal best
        existing_player = leaderboard_manager.get_player_best_score(player_name)
        new_personal_best = existing_player is None or request.score > existing_player["best_score"]
        
        # Submit score with time taken
        updated = leaderboard_manager.submit_score(player_name, request.score, request.time_taken)
        
        # Get updated rank
        rank = leaderboard_manager.get_player_rank(player_name)
        
        logger.info(
            f"Score submitted - Player: {player_name}, "
            f"Score: {request.score}, Time: {request.time_taken}s, Rank: {rank}"
        )
        
        return {
            "success": True,
            "message": "Score submitted successfully",
            "leaderboard_position": rank,
            "new_personal_best": new_personal_best
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting score: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/leaderboard/top", response_model=LeaderboardResponse)
async def get_leaderboard(limit: int = 10):
    """
    Get top N leaderboard entries.
    
    Args:
        limit: Number of entries to return (max 100, default 10).
    
    Returns:
        Top leaderboard entries with rankings.
    
    Raises:
        HTTPException: If limit is invalid.
    """
    try:
        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=400,
                detail="Limit must be between 1 and 100"
            )
        
        players = leaderboard_manager.get_leaderboard(limit)
        
        # Add rank to each entry
        entries = [
            PlayerLeaderboardEntry(
                name=player["name"],
                best_score=player["best_score"],
                date=player["date"],
                time_taken=player.get("time_taken", 0),
                rank=idx + 1
            )
            for idx, player in enumerate(players)
        ]
        
        logger.info(f"Leaderboard fetched - Top {len(entries)} entries")
        
        return {
            "entries": entries,
            "total_count": len(entries)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/leaderboard/player/{player_name}", response_model=PlayerBestScoreResponse)
async def get_player_best_score(player_name: str):
    """
    Get the best score for a specific player.
    
    Args:
        player_name: Name of the player.
    
    Returns:
        Player's best score and rank, or 404 if not found.
    
    Raises:
        HTTPException: If player not found.
    """
    try:
        player_name = player_name.strip()
        
        if not player_name:
            raise HTTPException(
                status_code=400,
                detail="Player name cannot be empty"
            )
        
        player = leaderboard_manager.get_player_best_score(player_name)
        
        if not player:
            return {
                "found": False
            }
        
        rank = leaderboard_manager.get_player_rank(player_name)
        
        logger.info(f"Player score fetched - Player: {player_name}, Rank: {rank}")
        
        return {
            "found": True,
            "player_name": player["name"],
            "best_score": player["best_score"],
            "date": player["date"],
            "time_taken": player.get("time_taken", 0),
            "rank": rank
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching player score: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/leaderboard/all", response_model=LeaderboardResponse)
async def get_all_leaderboard():
    """
    Get all leaderboard entries (paginated).
    
    Returns:
        All leaderboard entries with rankings.
    """
    try:
        players = leaderboard_manager.get_all_players()
        
        entries = [
            PlayerLeaderboardEntry(
                name=player["name"],
                best_score=player["best_score"],
                date=player["date"],
                rank=idx + 1
            )
            for idx, player in enumerate(players)
        ]
        
        logger.info(f"All leaderboard entries fetched - Total: {len(entries)}")
        
        return {
            "entries": entries,
            "total_count": len(entries)
        }
    
    except Exception as e:
        logger.error(f"Error fetching all leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ==================== Error Handlers ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    return {
        "error": True,
        "status_code": exc.status_code,
        "detail": exc.detail
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Generic exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "error": True,
        "status_code": 500,
        "detail": "Internal server error"
    }


# ==================== Application Startup ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
