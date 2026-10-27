import { useApiResource } from '../api/useApiResource.js';

type Activity = { type: string; minutes: number; points: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const resource = useApiResource<ActivityResponse>('/api/activities');

  return (
    <section aria-labelledby="activities-heading" className="card">
      <div className="card-body">
        <h2 className="h4" id="activities-heading">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {resource.status === 'loading' && <p role="status">Loading activities...</p>}
        {resource.status === 'error' && <p role="alert">Unable to load activities: {resource.message}</p>}
        {resource.status === 'success' && resource.data.activities.length === 0 && <p>No activities found.</p>}
        {resource.status === 'success' && resource.data.activities.length > 0 && (
          <ul className="list-group">
            {resource.data.activities.map((activity, index) => (
              <li className="list-group-item" key={`${activity.type}-${index}`}>
                {activity.type} — {activity.minutes} minutes, {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
