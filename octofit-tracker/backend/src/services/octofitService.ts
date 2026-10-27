import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(_input: unknown) {
  if (!_input || typeof _input !== 'object' || Array.isArray(_input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const input = _input as Record<string, unknown>;
  const { userId, teamId, type, minutes } = input;
  if (
    typeof userId !== 'string' ||
    !/^[\da-f]{24}$/i.test(userId) ||
    typeof teamId !== 'string' ||
    !/^[\da-f]{24}$/i.test(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes < 1
  ) {
    throw Object.assign(new Error('Activity input is invalid'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 400 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  if (!_input || typeof _input !== 'object' || Array.isArray(_input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const input = _input as Record<string, unknown>;
  const { name, mascot, members } = input;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim() ||
    (members !== undefined && !Array.isArray(members)) ||
    (Array.isArray(members) && members.some((member) => typeof member !== 'string' || !/^[\da-f]{24}$/i.test(member)))
  ) {
    throw Object.assign(new Error('Team input is invalid'), { status: 400 });
  }

  const memberIds = (members ?? []) as string[];
  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== new Set(memberIds).size) {
      throw Object.assign(new Error('One or more team members were not found'), { status: 400 });
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() });
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    walk: 'endurance',
    strength: 'strength',
  };
  const focus = (recentActivity && activityFocus[recentActivity.type.toLowerCase()]) || user.fitnessGoal;
  const workouts = await Workout.find({ focus: new RegExp(`^${focus.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
  return workouts.map((workout) => ({
    ...workout,
    reason: recentActivity
      ? `Recommended based on your recent ${recentActivity.type} activity and ${focus} focus.`
      : `Recommended to support your ${focus} fitness goal.`,
  }));
}

export { User };
