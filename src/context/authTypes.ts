import { createContext } from 'react';
import type { User } from '@/types/api';

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSuperadmin: boolean;
}

export const AuthContext = createContext<AuthState | null>(null);
