const API_BASE = '/api';
const PROJECTS_CACHE_KEY = 'portfolio_projects_cache';

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
      total_repos: 49,
      total_commits: 370,
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

export async function sendContact(payload) {
  try {
    const res = await fetch(`${API_BASE}/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      return {
        status: 'rateLimit',
        message: 'Too many requests. Please wait a few minutes before trying again.',
      };
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: 'error',
        message:
          errorData.detail?.[0]?.msg ||
          errorData.detail ||
          'Failed to send. Please try again or email me directly at contact@joseberos.dev.',
      };
    }

    return await res.json();
  } catch (err) {
    console.warn('Contact delivery failed', err);
    return {
      status: 'error',
      message: 'Failed to send. Please try again or email me directly at contact@joseberos.dev.',
    };
  }
}

function getLocalProjectsCache() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage?.getItem(PROJECTS_CACHE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (e) {
    console.warn('Failed to read projects from localStorage', e);
    return null;
  }
}

function setLocalProjectsCache(projects) {
  try {
    if (typeof window !== 'undefined' && window.localStorage && Array.isArray(projects) && projects.length > 0) {
      window.localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects));
    }
  } catch (e) {
    console.warn('Failed to write projects to localStorage', e);
  }
}

export async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.status}`);
    }
    const data = await res.json();
    const projects = Array.isArray(data?.projects) ? data.projects : [];

    if (projects.length > 0) {
      setLocalProjectsCache(projects);
      return {
        projects,
        is_mock: Boolean(data?.is_mock),
        source: data?.source || 'live',
        cached_at: data?.cached_at || new Date().toISOString(),
      };
    }

    // Backend returned empty list (e.g. cold start fixture) -> check browser cache
    const cached = getLocalProjectsCache();
    if (cached) {
      return {
        projects: cached,
        is_mock: true,
        source: 'local_cache',
        cached_at: new Date().toISOString(),
      };
    }

    return {
      projects: [],
      is_mock: Boolean(data?.is_mock ?? true),
      source: data?.source || 'fixture',
      cached_at: data?.cached_at || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Backend proxy unavailable, checking localStorage fallback for projects', err);
    const cached = getLocalProjectsCache();
    if (cached) {
      return {
        projects: cached,
        is_mock: true,
        source: 'local_cache',
        cached_at: new Date().toISOString(),
      };
    }

    return {
      projects: [],
      is_mock: true,
      source: 'offline',
      cached_at: new Date().toISOString(),
    };
  }
}
