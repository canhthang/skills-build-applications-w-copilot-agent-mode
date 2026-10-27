import { useApiResource } from '../api/useApiResource.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: Ranking[] };

export default function Leaderboard() {
  const resource = useApiResource<LeaderboardResponse>('/api/leaderboard');

  return (
    <section aria-labelledby="leaderboard-heading" className="card">
      <div className="card-body">
        <h2 className="h4" id="leaderboard-heading">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {resource.status === 'loading' && <p role="status">Loading leaderboard...</p>}
        {resource.status === 'error' && <p role="alert">Unable to load leaderboard: {resource.message}</p>}
        {resource.status === 'success' && resource.data.leaderboard.length === 0 && <p>No leaderboard rankings found.</p>}
        {resource.status === 'success' && resource.data.leaderboard.length > 0 && (
          <ol className="list-group list-group-numbered">
            {resource.data.leaderboard.map((entry) => (
              <li className="list-group-item" key={entry.teamName}>
                <strong>{entry.teamName}</strong> — {entry.totalPoints} points
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
