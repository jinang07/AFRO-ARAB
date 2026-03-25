
import { User, Role } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Debugging for mobile
if (typeof window !== 'undefined' && (window as any).Capacitor) {
  console.log('API URL:', API_BASE_URL);
}

// Helper to convert snake_case to camelCase
const toCamel = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/(_\w)/g, m => m[1].toUpperCase())]: toCamel(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

// Helper to convert camelCase to snake_case
const toSnake = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(v => toSnake(v));
  } else if (typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/([a-z])([A-Z0-9])/g, '$1_$2').toLowerCase()]: toSnake(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

class ApiService {
  private token: string | null = localStorage.getItem('access_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  async request(endpoint: string, options: RequestInit = {}, isBlob: boolean = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});

    // Always get the freshest token from localStorage if none in memory
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData) && !isBlob) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    }).catch(err => {
      const errorMsg = `Network Error: ${err.message || 'Could not connect to server'}`;
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        console.error('API FETCH ERROR:', errorMsg, 'URL:', url);
      }
      throw new Error(errorMsg);
    });

    if (response.status === 401) {
      this.setToken(null);
      window.dispatchEvent(new CustomEvent('unauthorized'));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail || errorData.error || `Error ${response.status}: ${response.statusText}`;
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        console.error('API RESPONSE ERROR:', detail, 'Status:', response.status);
      }
      throw new Error(detail);
    }

    if (response.status === 204) return null;
    if (isBlob) return response.blob();

    const data = await response.json();
    return toCamel(data);
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async exportBackup() {
    return this.request('/export-backup/', { method: 'GET' }, true);
  }

  async post(endpoint: string, data: any) {
    const body = data instanceof FormData ? data : JSON.stringify(toSnake(data));
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint: string, data: any) {
    const body = data instanceof FormData ? data : JSON.stringify(toSnake(data));
    return this.request(endpoint, { method: 'PUT', body });
  }

  async patch(endpoint: string, data: any) {
    const body = data instanceof FormData ? data : JSON.stringify(toSnake(data));
    return this.request(endpoint, { method: 'PATCH', body });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  getMediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}

export const api = new ApiService();
