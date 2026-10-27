import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';

type Team = { name: string; mascot?: string; members: unknown[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const loadTeams = useCallback(() => getJson<TeamResponse>('/api/teams'), []);
  const resource = useApiResource(loadTeams);

  return (
    <section aria-labelledby="teams-heading" className="card">
      <div className="card-body">
        <h2 className="h4" id="teams-heading">Teams</h2>
        <p>Manage teams and members.</p>
        {resource.status === 'loading' && <p role="status">Loading teams...</p>}
        {resource.status === 'error' && <p role="alert">Unable to load teams: {resource.message}</p>}
        {resource.status === 'success' && resource.data.teams.length === 0 && <p>No teams found.</p>}
        {resource.status === 'success' && resource.data.teams.length > 0 && (
          <ul className="list-group">
            {resource.data.teams.map((team) => (
              <li className="list-group-item" key={team.name}>
                <strong>{team.name}</strong>
                {team.mascot && ` — ${team.mascot}`}
                {' · '}{team.members.length} members
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
