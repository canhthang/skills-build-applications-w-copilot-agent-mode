import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import Activities from './components/Activities.js';
import Teams from './components/Teams.js';
import Leaderboard from './components/Leaderboard.js';
import Workouts from './components/Workouts.js';

export default function App() {
  return <div className="container py-4"><header className="mb-4"><h1>OctoFit Tracker</h1><nav aria-label="OctoFit sections" className="d-flex gap-3 flex-wrap"><NavLink to="/activities" className={({ isActive }) => isActive ? 'fw-semibold' : undefined}>Activities</NavLink><NavLink to="/teams" className={({ isActive }) => isActive ? 'fw-semibold' : undefined}>Teams</NavLink><NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'fw-semibold' : undefined}>Leaderboard</NavLink><NavLink to="/workouts" className={({ isActive }) => isActive ? 'fw-semibold' : undefined}>Workout suggestions</NavLink></nav></header><Routes><Route path="/" element={<Navigate to="/activities" replace />} /><Route path="/activities" element={<Activities />} /><Route path="/teams" element={<Teams />} /><Route path="/leaderboard" element={<Leaderboard />} /><Route path="/workouts" element={<Workouts />} /></Routes></div>;
}
