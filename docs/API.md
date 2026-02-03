# API Reference - Advanced Snake Game

Complete API documentation with request/response examples and error handling.

## API Overview

### Base URLs
- **Local Development**: `http://localhost:8000`
- **Production (Render/Railway)**: `https://api-url.onrender.com` or `https://api-url.up.railway.app`

### Content-Type
All requests and responses use: `application/json`

### Response Format

#### Success Response (2xx)
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

#### Error Response (4xx, 5xx)
```json
{
  "error": true,
  "status_code": 400,
  "detail": "Detailed error message"
}
```

---

## Endpoints

### Health Check

#### GET `/health`

Check if the API is running.

**Parameters**: None

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-02-03T10:30:45.123456"
}
```

**Example**:
```bash
curl http://localhost:8000/health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-03T15:42:30.654321"
}
```

---

### Game Session

#### POST `/game/start`

Initialize a new game session.

**Request Body**:
```json
{
  "player_name": "string (1-50 chars)"
}
```

**Validation**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `player_name` | string | Yes | 1-50 characters |

**Response** (200 OK):
```json
{
  "session_id": "string",
  "player_name": "string",
  "message": "string"
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Unique session identifier |
| `player_name` | string | Confirmed player name |
| `message` | string | Success message |

**Errors**:
| Code | Detail |
|------|--------|
| 400 | Player name must be between 1 and 50 characters |
| 500 | Internal server error |

**Examples**:

Success:
```bash
curl -X POST http://localhost:8000/game/start \
  -H "Content-Type: application/json" \
  -d '{"player_name": "John Doe"}'
```

Response:
```json
{
  "session_id": "session_1707030645.123456_John Doe",
  "player_name": "John Doe",
  "message": "Game session started successfully"
}
```

Error (empty name):
```bash
curl -X POST http://localhost:8000/game/start \
  -H "Content-Type: application/json" \
  -d '{"player_name": ""}'
```

Response:
```json
{
  "error": true,
  "status_code": 400,
  "detail": "Player name must be between 1 and 50 characters"
}
```

---

### Score Submission

#### POST `/scores/submit`

Submit a game score to the leaderboard.

**Request Body**:
```json
{
  "player_name": "string (1-50 chars)",
  "score": "integer (≥0)",
  "difficulty_level": "integer (1-10, optional, default: 1)"
}
```

**Validation**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `player_name` | string | Yes | 1-50 characters |
| `score` | integer | Yes | Non-negative (≥0) |
| `difficulty_level` | integer | No | 1-10, default: 1 |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "string",
  "leaderboard_position": "integer|null",
  "new_personal_best": "boolean"
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether score was accepted |
| `message` | string | Status message |
| `leaderboard_position` | integer/null | Player's rank (null if not tracked) |
| `new_personal_best` | boolean | True if highest score for player |

**Business Logic**:
- Score is only updated if higher than player's previous best
- Player name lookup is case-insensitive
- If score is not higher than previous best, `success` is still true but position may not update
- Rank is calculated after submission

**Errors**:
| Code | Detail |
|------|--------|
| 400 | Player name must be between 1 and 50 characters |
| 400 | Score cannot be negative |
| 500 | Internal server error |

**Examples**:

Success - New player:
```bash
curl -X POST http://localhost:8000/scores/submit \
  -H "Content-Type: application/json" \
  -d '{
    "player_name": "Alice",
    "score": 250,
    "difficulty_level": 2
  }'
```

Response:
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "leaderboard_position": 1,
  "new_personal_best": true
}
```

Success - Existing player, higher score:
```bash
curl -X POST http://localhost:8000/scores/submit \
  -H "Content-Type: application/json" \
  -d '{
    "player_name": "Alice",
    "score": 350,
    "difficulty_level": 3
  }'
```

Response:
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "leaderboard_position": 1,
  "new_personal_best": true
}
```

Success - Lower score (not updated):
```bash
curl -X POST http://localhost:8000/scores/submit \
  -H "Content-Type: application/json" \
  -d '{
    "player_name": "Alice",
    "score": 100,
    "difficulty_level": 1
  }'
```

Response:
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "leaderboard_position": 1,
  "new_personal_best": false
}
```

---

### Leaderboard

#### GET `/leaderboard/top?limit=10`

Get top N players from the leaderboard.

**Query Parameters**:
| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | 1-100 |

**Response** (200 OK):
```json
{
  "entries": [
    {
      "name": "string",
      "best_score": "integer",
      "date": "string (ISO 8601)",
      "rank": "integer"
    }
  ],
  "total_count": "integer"
}
```

**Response Fields**:
- `entries`: Array of leaderboard entries sorted by score
- `total_count`: Number of entries returned
- Each entry includes `rank` (1-indexed, automatically calculated)

**Errors**:
| Code | Detail |
|------|--------|
| 400 | Limit must be between 1 and 100 |
| 500 | Internal server error |

**Examples**:

Get top 5:
```bash
curl "http://localhost:8000/leaderboard/top?limit=5"
```

Response:
```json
{
  "entries": [
    {
      "name": "Alice Johnson",
      "best_score": 1500,
      "date": "2026-02-03T15:30:45.123456",
      "rank": 1
    },
    {
      "name": "Bob Smith",
      "best_score": 1200,
      "date": "2026-02-03T14:15:20.654321",
      "rank": 2
    },
    {
      "name": "Charlie Davis",
      "best_score": 950,
      "date": "2026-02-02T10:45:00.987654",
      "rank": 3
    }
  ],
  "total_count": 3
}
```

Get top 10 (default):
```bash
curl http://localhost:8000/leaderboard/top
```

Invalid limit:
```bash
curl "http://localhost:8000/leaderboard/top?limit=500"
```

Response:
```json
{
  "error": true,
  "status_code": 400,
  "detail": "Limit must be between 1 and 100"
}
```

---

#### GET `/leaderboard/player/{player_name}`

Get a specific player's best score and rank.

**Path Parameters**:
| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `player_name` | string | Yes | URL-encoded, case-insensitive lookup |

**Response** (200 OK - Found):
```json
{
  "found": true,
  "player_name": "string",
  "best_score": "integer",
  "date": "string (ISO 8601)",
  "rank": "integer"
}
```

**Response** (200 OK - Not Found):
```json
{
  "found": false
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `found` | boolean | Whether player exists |
| `player_name` | string | Confirmed player name (if found) |
| `best_score` | integer | Highest score (if found) |
| `date` | string | When score was achieved (if found) |
| `rank` | integer | Leaderboard position (if found) |

**Errors**:
| Code | Detail |
|------|--------|
| 400 | Player name cannot be empty |
| 500 | Internal server error |

**Examples**:

Player found:
```bash
curl "http://localhost:8000/leaderboard/player/Alice%20Johnson"
```

Response:
```json
{
  "found": true,
  "player_name": "Alice Johnson",
  "best_score": 1500,
  "date": "2026-02-03T15:30:45.123456",
  "rank": 1
}
```

Player not found:
```bash
curl "http://localhost:8000/leaderboard/player/NonExistent"
```

Response:
```json
{
  "found": false
}
```

---

#### GET `/leaderboard/all`

Get all leaderboard entries.

**Parameters**: None

**Response** (200 OK):
```json
{
  "entries": [
    {
      "name": "string",
      "best_score": "integer",
      "date": "string (ISO 8601)",
      "rank": "integer"
    }
  ],
  "total_count": "integer"
}
```

**Response Fields**:
- `entries`: All players sorted by score (highest first)
- `total_count`: Total number of players

**Example**:
```bash
curl http://localhost:8000/leaderboard/all
```

Response:
```json
{
  "entries": [
    {
      "name": "Alice Johnson",
      "best_score": 1500,
      "date": "2026-02-03T15:30:45.123456",
      "rank": 1
    },
    {
      "name": "Bob Smith",
      "best_score": 1200,
      "date": "2026-02-03T14:15:20.654321",
      "rank": 2
    }
  ],
  "total_count": 2
}
```

---

## Integration Examples

### JavaScript (Fetch API)

#### Start Game
```javascript
const startGame = async (playerName) => {
  try {
    const response = await fetch('http://localhost:8000/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_name: playerName })
    });
    
    if (!response.ok) throw new Error('Failed to start game');
    
    const data = await response.json();
    console.log('Session:', data.session_id);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Submit Score
```javascript
const submitScore = async (playerName, score, difficulty) => {
  try {
    const response = await fetch('http://localhost:8000/scores/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_name: playerName,
        score: score,
        difficulty_level: difficulty
      })
    });
    
    if (!response.ok) throw new Error('Failed to submit score');
    
    const data = await response.json();
    console.log('Rank:', data.leaderboard_position);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Fetch Leaderboard
```javascript
const getLeaderboard = async (limit = 10) => {
  try {
    const response = await fetch(`http://localhost:8000/leaderboard/top?limit=${limit}`);
    
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    
    const data = await response.json();
    console.log('Top players:', data.entries);
    return data.entries;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Python (Requests)

#### Start Game
```python
import requests

def start_game(player_name):
    response = requests.post(
        'http://localhost:8000/game/start',
        json={'player_name': player_name}
    )
    response.raise_for_status()
    return response.json()

# Usage
session = start_game('John Doe')
print(f"Session ID: {session['session_id']}")
```

#### Submit Score
```python
def submit_score(player_name, score, difficulty=1):
    response = requests.post(
        'http://localhost:8000/scores/submit',
        json={
            'player_name': player_name,
            'score': score,
            'difficulty_level': difficulty
        }
    )
    response.raise_for_status()
    return response.json()

# Usage
result = submit_score('John Doe', 250, 2)
print(f"Rank: {result['leaderboard_position']}")
```

#### Fetch Leaderboard
```python
def get_leaderboard(limit=10):
    response = requests.get(
        f'http://localhost:8000/leaderboard/top?limit={limit}'
    )
    response.raise_for_status()
    return response.json()['entries']

# Usage
leaders = get_leaderboard(5)
for entry in leaders:
    print(f"{entry['rank']}. {entry['name']}: {entry['best_score']}")
```

### cURL Examples

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Start Game
```bash
curl -X POST http://localhost:8000/game/start \
  -H "Content-Type: application/json" \
  -d '{"player_name":"John Doe"}'
```

#### Submit Score
```bash
curl -X POST http://localhost:8000/scores/submit \
  -H "Content-Type: application/json" \
  -d '{"player_name":"John Doe","score":250,"difficulty_level":2}'
```

#### Get Top Leaderboard
```bash
curl "http://localhost:8000/leaderboard/top?limit=10"
```

#### Get Player Score
```bash
curl "http://localhost:8000/leaderboard/player/John%20Doe"
```

#### Get All Players
```bash
curl http://localhost:8000/leaderboard/all
```

---

## Error Handling Guide

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input (validation failed) |
| 404 | Not Found | Endpoint doesn't exist |
| 500 | Server Error | Unexpected server error |

### Error Response Format

```json
{
  "error": true,
  "status_code": 400,
  "detail": "Detailed error message"
}
```

### Common Errors & Solutions

#### Error: "Player name must be between 1 and 50 characters"
**Cause**: Name is empty, too long, or invalid type
**Solution**: Validate name length before submitting

```javascript
// Validate before sending
if (playerName.trim().length < 1 || playerName.length > 50) {
  alert('Name must be 1-50 characters');
  return;
}
```

#### Error: "Score cannot be negative"
**Cause**: Score value is negative
**Solution**: Ensure score is always ≥ 0

```javascript
if (score < 0) {
  console.error('Score cannot be negative');
  return;
}
```

#### Error: "Limit must be between 1 and 100"
**Cause**: Limit parameter out of range
**Solution**: Clamp limit to valid range

```javascript
const limit = Math.min(100, Math.max(1, userLimit));
fetch(`/leaderboard/top?limit=${limit}`);
```

#### Error: "Internal server error"
**Cause**: Unexpected server-side error
**Solution**: 
1. Check server logs
2. Ensure file permissions (leaderboard.json writable)
3. Verify persistent storage is available
4. Contact support with error details

---

## Performance Considerations

### Rate Limiting

Currently no rate limiting is implemented. For production with high traffic:

```python
# Add this to backend/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/scores/submit")
@limiter.limit("10/minute")
async def submit_score(request: Request, ...):
    pass
```

### Pagination

The `/leaderboard/top` endpoint supports pagination via `limit`:
- Use smaller limits for frequent requests
- Recommended: Fetch 10-20 entries at a time

### Caching

For production, consider caching:

**Frontend Cache**:
```javascript
let cachedLeaderboard = null;
let cacheTime = Date.now();

const getLeaderboard = async () => {
  const now = Date.now();
  if (cachedLeaderboard && now - cacheTime < 30000) {
    return cachedLeaderboard; // 30-second cache
  }
  // Fetch from server...
};
```

**Backend Cache** (with Redis):
```python
# Advanced: Add Redis caching
import redis
cache = redis.Redis(host='localhost', port=6379)

@app.get("/leaderboard/top")
async def get_leaderboard(limit: int = 10):
    cache_key = f"leaderboard:top:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return json.loads(cached)
    # Fetch from file...
```

---

## Testing the API

### Automated Testing Example

```python
import requests
import pytest

BASE_URL = "http://localhost:8000"

def test_health_check():
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_start_game():
    response = requests.post(
        f"{BASE_URL}/game/start",
        json={"player_name": "TestUser"}
    )
    assert response.status_code == 200
    assert response.json()["player_name"] == "TestUser"

def test_submit_score():
    # Start game first
    requests.post(f"{BASE_URL}/game/start", json={"player_name": "TestUser"})
    
    # Submit score
    response = requests.post(
        f"{BASE_URL}/scores/submit",
        json={"player_name": "TestUser", "score": 250}
    )
    assert response.status_code == 200
    assert response.json()["success"] == True

def test_get_leaderboard():
    response = requests.get(f"{BASE_URL}/leaderboard/top?limit=5")
    assert response.status_code == 200
    assert len(response.json()["entries"]) <= 5

# Run tests
pytest test_api.py -v
```

---

**Last Updated**: February 3, 2026

For complete documentation, see [README.md](README.md)
