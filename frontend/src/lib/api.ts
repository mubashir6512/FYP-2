const BASE_URL = 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
    token?: string | null;
}

export const api = async (endpoint: string, options: RequestOptions = {}) => {
    const token = options.token || localStorage.getItem('token');

    const headers = new Headers(options.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};
