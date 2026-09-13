export function getToken() {
  return localStorage.getItem('agriverse_token');
}

export function getUserRole() {
  try {
    const raw = localStorage.getItem('agriverse_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.role || null;
  } catch (error) {
    return null;
  }
}

export function saveAuthSession(user, token) {
  if (user) {
    localStorage.setItem('agriverse_user', JSON.stringify(user));
  }
  if (token) {
    localStorage.setItem('agriverse_token', token);
  }
}

export function clearAuthSession() {
  localStorage.removeItem('agriverse_token');
  localStorage.removeItem('agriverse_user');
}

export function isAuthenticated() {
  return Boolean(getToken());
}
