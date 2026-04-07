import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/register', { name, email, password }),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

export const contactsApi = {
  getAll: (params?: Record<string, string>) => api.get('/contacts', { params }),
  getOne: (id: number) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: number, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: number) => api.delete(`/contacts/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getOne: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const tagsApi = {
  getAll: () => api.get('/tags'),
  create: (data: any) => api.post('/tags', data),
  update: (id: number, data: any) => api.put(`/tags/${id}`, data),
  delete: (id: number) => api.delete(`/tags/${id}`),
};

export const eventsApi = {
  getAll: (params?: Record<string, string>) => api.get('/events', { params }),
  getOne: (id: number) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
  getInvitableContacts: (id: number) => api.get(`/events/${id}/invitable-contacts`),
};

export const giftsApi = {
  getAll: (params?: Record<string, string>) => api.get('/gifts', { params }),
  create: (data: any) => api.post('/gifts', data),
  delete: (id: number) => api.delete(`/gifts/${id}`),
};

export const invitationTypesApi = {
  getAll: () => api.get('/invitation-types'),
  create: (data: any) => api.post('/invitation-types', data),
  update: (id: number, data: any) => api.put(`/invitation-types/${id}`, data),
  delete: (id: number) => api.delete(`/invitation-types/${id}`),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const responsiblesApi = {
  getAll: () => api.get('/responsibles'),
  create: (data: any) => api.post('/responsibles', data),
  update: (id: number, data: any) => api.put(`/responsibles/${id}`, data),
  delete: (id: number) => api.delete(`/responsibles/${id}`),
};

export const citiesApi = {
  getAll: () => api.get('/cities'),
  create: (data: any) => api.post('/cities', data),
  update: (id: number, data: any) => api.put(`/cities/${id}`, data),
  delete: (id: number) => api.delete(`/cities/${id}`),
};
