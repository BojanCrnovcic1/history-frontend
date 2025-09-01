import { createContext, useContext } from 'react';
import type { User } from '../types/User';

export interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    getUserProfile: (token: string) => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
