import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  token: string | null;
  role: string | null;
  user: User | null;
  login: (token: string, role: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  login: (token, role, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, role, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    set({ token: null, role: null, user: null });
  }
}));
