import React, { useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/User';
import { ApiConfig } from '../config/ApiConfig';
import { AuthContext } from './AuthContext';


interface Props {
    children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                
                const originalRequest = error.config;
                
                if (error.response?.status === 401 && 
                    !originalRequest._retry && 
                    !originalRequest.url.includes('auth/refresh')) {
                    
                    originalRequest._retry = true;
                    try {
                        const newAccessToken = await refreshAccessToken();
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [refreshToken]);

    useEffect(() => {
        if (accessToken) {
            getUserProfile();
        } else {
        }
    }, [accessToken]);

    const login = async (email: string, password: string) => {

        try {
            const response = await axios.post(ApiConfig.API_URL + 'auth/login', {
                email,
                password
            });

            const { accessToken, refreshToken } = response.data;
            updateTokens(accessToken, refreshToken);
            await getUserProfile();
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                throw new Error("Pogrešan email ili lozinka");
            }
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
    };

    const updateTokens = (newAccessToken: string, newRefreshToken?: string) => {
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        
        if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
            localStorage.setItem('refreshToken', newRefreshToken);
        }
    };

    const getUserProfile = async () => {
        if (!accessToken) {
            return;
        }

        try {
            const response = await axios.get(ApiConfig.API_URL + 'auth/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": 'application/json'
                },
            });

            setUser(response.data);

            const role = response.data.role;
            if (role === 'ADMIN') {
                navigate('/adminPanel');
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error('Failed to fetch user profile', error);
            if (axios.isAxiosError(error) && error.response?.data?.code === -1012) {
                await refreshAccessToken();
            } 
        } 
            
    };
    
    const refreshAccessToken = async (): Promise<string> => {
        if (!refreshToken) {
            
            throw new Error('No refresh token available');
        }

        if (isRefreshing) {
            throw new Error('Refresh already in progress');
        }

        try {
            setIsRefreshing(true);
            const response = await axios.post(ApiConfig.API_URL + 'auth/refresh', {
                refreshToken,
            });

            const { accessToken: newAccessToken } = response.data;
            updateTokens(newAccessToken);
            setIsRefreshing(false);
            return newAccessToken;
        } catch (error) {
            console.error('Refresh token failed', error);
            setIsRefreshing(false);
           ;
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{ 
                user, 
                setUser, 
                accessToken, 
                refreshToken, 
                login, 
                logout, 
                getUserProfile 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};