import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';

type WorkoutSuggestion = { title: string; reason: string; minutes?: number; difficulty?: string };
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  const loadWorkouts = useCallback(
    () => getJson<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`),
    [],
  );
  const resource = useApiResource(loadWorkouts);

  return (
    <section aria-labelledby="workouts-heading" className="card">
      <div className="card-body">
        <h2 className="h4" id="workouts-heading">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {resource.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
        {resource.status === 'error' && <p role="alert">Unable to load workout suggestions: {resource.message}</p>}
        {resource.status === 'success' && resource.data.suggestions.length === 0 && <p>No workout suggestions found.</p>}
        {resource.status === 'success' && resource.data.suggestions.length > 0 && (
          <ul className="list-group">
            {resource.data.suggestions.map((suggestion) => (
              <li className="list-group-item" key={suggestion.title}>
                <strong>{suggestion.title}</strong>
                {suggestion.minutes !== undefined && ` — ${suggestion.minutes} minutes`}
                {suggestion.difficulty && ` · ${suggestion.difficulty}`}
                <p className="mb-0">{suggestion.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
