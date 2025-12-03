const API_URL = 'http://localhost:5000';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || data?.msg || 'Error en la petición';
    throw new Error(message);
  }

  return data;
}

const apiClient = {
  login(email, password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(email, password, role = 'user') {
    return request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  getMe() {
    return request('/me', { method: 'GET' });
  },

  getTickets() {
    return request('/tickets', { method: 'GET' });
  },

  createTicket(payload) {
    return request('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout() {
    localStorage.removeItem('access_token');
  },
};

export default apiClient;
