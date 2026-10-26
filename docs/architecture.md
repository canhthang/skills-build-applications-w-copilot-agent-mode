# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the React app as a thin view layer that reads from the API, renders route-based sections (`/activities`, `/teams`, `/leaderboard`, `/workouts`), and shows loading, empty, and accessible alert states while preserving the Vite proxy contract.
- Logic tier decision: Centralize behavior in the Express service layer so route handlers stay simple, validation happens before persistence, and errors become deliberate 4xx responses instead of raw cast failures or 500s.
- Data tier decision: Model the domain in Mongoose with required validation and references for `User`, `Team`, `Activity`, and `Workout`, then seed representative fixtures in a deterministic idempotent way.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; verify both references exist; store the normalized `user`, `team`, `type`, `minutes`, and computed `points` plus `occurredAt` timestamp.
- Team management approach: Require `name` and `mascot`; default `members` to an empty array and preserve submitted member IDs while validating invalid payloads with a 400 response.
- Leaderboard approach: Aggregate each team's total activity points, sort descending, and assign a 1-based rank so the API returns a stable ordering for display.
- Workout suggestions approach: Look up a user by email, analyze their recent activity or primary goal, match the most relevant workout focus, and include a human-readable reason; unknown emails should return a deliberate 4xx error.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Purpose: validates the Mongoose data contracts and idempotent seed behavior.
  - Current failure meaning: required fields are missing from the schemas (`name`, `email`, `fitnessGoal`, `name`/`mascot` on Team, `type`/`user`/`team`/`minutes`/`points`/`occurredAt` on Activity, and `focus`/`minutes`/`difficulty` on Workout), so the data layer is not enforcing the contract yet.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Purpose: verifies the Express API behavior for create/list, validation, leaderboard ordering, and workout suggestion logic.
  - Current failure meaning: handlers still throw a 501 `not implemented` error rather than returning 4xx validation errors, the leaderboard is unimplemented, and workout matching does not respect the user's recent activity pattern.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Purpose: verifies the React UI renders the expected API-backed content and accessible states.
  - Current failure meaning: each page is still rendering placeholder "Implementation pending" content instead of data, and the app is not handling loading/empty/error states in an accessible way.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Purpose: ensures the TypeScript backend compiles cleanly once the model and service logic is implemented.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Purpose: ensures the React app compiles and bundles correctly with the API-backed components after the UI is implemented.
