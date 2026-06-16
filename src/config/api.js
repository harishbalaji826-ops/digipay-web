const rawUrl = import.meta.env.VITE_BACKEND_URL || '';

let API_BASE_URL = rawUrl.trim();

if (!API_BASE_URL) {
  API_BASE_URL = 'http://127.0.0.1:8000';
} else if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  if (API_BASE_URL.startsWith('localhost') || API_BASE_URL.startsWith('127.0.0.1')) {
    API_BASE_URL = `http://${API_BASE_URL}`;
  } else {
    API_BASE_URL = `https://${API_BASE_URL}`;
  }
}

export default API_BASE_URL;

