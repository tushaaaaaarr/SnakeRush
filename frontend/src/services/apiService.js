class APIService {
  static instance = null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  static getInstance() {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  async healthCheck() {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  }

  async startGame(playerName) {
    const response = await fetch(`${this.baseURL}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_name: playerName }),
    });
    if (!response.ok) throw new Error('Failed to start game');
    return response.json();
  }

  async submitScore(playerName, score, difficulty, timeTaken = 0) {
    const response = await fetch(`${this.baseURL}/scores/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_name: playerName,
        score,
        difficulty_level: difficulty,
        time_taken: timeTaken,
      }),
    });
    if (!response.ok) throw new Error('Failed to submit score');
    const data = await response.json();
    return {
      rank: data.leaderboard_position || data.rank,
      ...data
    };
  }

  async getLeaderboard(limit = 10) {
    const response = await fetch(
      `${this.baseURL}/leaderboard/top?limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    const data = await response.json();
    // Transform backend response format to frontend format
    return {
      leaderboard: data.entries || []
    };
  }

  async getPlayerBestScore(playerName) {
    const response = await fetch(
      `${this.baseURL}/leaderboard/player/${playerName}`
    );
    if (!response.ok) {
      // Player not found, return 0
      return { best_score: 0, found: false };
    }
    return response.json();
  }

  async getAllLeaderboard() {
    const response = await fetch(`${this.baseURL}/leaderboard/all`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  }
}

export default APIService;
