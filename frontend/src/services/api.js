const API_BASE = '/api';

export async function fetchGitHubOverview(username = 'myrson2') {
  try {
    const res = await fetch(`${API_BASE}/github/overview?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch overview: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend proxy unavailable, using client fallback for overview', err);
    return {
      username,
      total_repos: 40,
      total_commits: 5240,
      status: 'Online',
      is_mock: true,
      cached_at: new Date().toISOString()
    };
  }
}

function generateFallbackWeeks() {
  const weeks = [];
  const levels = [0, 1, 1, 2, 2, 3, 4, 0, 1, 2, 3, 1];
  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const level = levels[(w * 7 + d) % levels.length];
      days.push({
        date: `2026-W${w}-${d}`,
        count: level > 0 ? level * 2 : 0,
        level: level,
      });
    }
    weeks.push({ days });
  }
  return weeks;
}

export async function fetchGitHubCalendar(username = 'myrson2') {
  try {
    const res = await fetch(`${API_BASE}/github/calendar?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch calendar: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend proxy unavailable, using client fallback for calendar', err);
    return {
      username,
      total_contributions: 1510,
      weeks: generateFallbackWeeks(),
      is_mock: true,
      cached_at: new Date().toISOString()
    };
  }
}

export async function postContactPlaceholder(payload) {
  const res = await fetch(`${API_BASE}/contact/placeholder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail?.[0]?.msg || 'Failed to submit contact request');
  }

  return await res.json();
}

