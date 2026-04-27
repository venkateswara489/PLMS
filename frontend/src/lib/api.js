export function getToken() {
  return localStorage.getItem('token') || '';
}

export async function apiFetch(path, { method = 'GET', body, headers, auth = false } = {}) {
  const finalHeaders = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(headers || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

