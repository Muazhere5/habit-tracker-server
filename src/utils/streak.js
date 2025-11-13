
export function calculateStreak(history = []) {
  if (!history.length) return 0;
  const key = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const set = new Set(history.map(x => key(new Date(x.date))));
  let streak = 0;
  let cur = key(new Date());
  while (set.has(cur)) {
    streak++;
    const d = new Date(cur);
    d.setDate(d.getDate() - 1);
    cur = key(d);
  }
  return streak;
}

export function percentLast30(history = []) {
  const key = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const done = new Set(history.map(x => key(new Date(x.date))));
  const today = new Date();
  let hit = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (done.has(key(d))) hit++;
  }
  return Math.round((hit / 30) * 100);
}
