import React from 'react';
import './LeaderboardPanel.css';

function LeaderboardPanel({ leaderboard, currentPlayer }) {
  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="leaderboard-panel right-panel">
      <div className="leaderboard-header">
        <h3>🏆 Top Players</h3>
      </div>

      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '16%' }}>Rank</th>
              <th style={{ width: '28%' }}>Username</th>
              <th style={{ width: '16.6%' }}>Score</th>
              <th style={{ width: '35%' }}>Scored At</th>
              <th style={{ width: '17%' }}>Time Taken</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard && leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No scores yet. Start playing!
                </td>
              </tr>
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <tr
                  key={index}
                  className={entry.name === currentPlayer ? 'current-player' : ''}
                >
                  <td className="rank-cell">
                    {index === 0 ? <span className="crown">👑</span> : <span className="rank-number">#{index + 1}</span>}
                  </td>
                  <td className="username-cell">{entry.name}</td>
                  <td className="score-cell">{entry.best_score}</td>
                  <td className="date-cell">
                    {entry.date
                      ? new Date(entry.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </td>
                  <td className="time-cell">
                    {formatTime(entry.time_taken)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="developer-credit">
        <p>Developed by Tushar</p>
      </div>
    </div>
  );
}

export default LeaderboardPanel;
