import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'guide';
  photo_url?: string;
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  userRole: 'user' | 'guide' | null;
  profile: UserProfile | null;
  userLocation: { latitude: number; longitude: number } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'user' | 'guide') => Promise<{ success: boolean; verified?: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: 'user' | 'guide', birthDate?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, code: string, role: 'user' | 'guide', passwordForAutoLogin?: string) => Promise<{ success: boolean; error?: string }>;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  saveGoogleSession: (accessToken: string, profile: UserProfile) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'guide' | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Mulai dengan loading true untuk cek token awal

  // 1. Memulihkan Sesi Lama Secara Otomatis pada Startup Aplikasi
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          // Set token global sementara untuk request fetch berikutnya
          (global as any).apiToken = savedToken;

          // Ambil detail profil user saat ini dari backend /me
          const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${savedToken}`,
            },
          });

          const body = await response.json();
          if (response.ok && body.status === 'success') {
            const userProfile = body.data;
            setToken(savedToken);
            setUserRole(userProfile.role);
            setProfile(userProfile);
          } else {
            // Jika token di server sudah tidak valid/expired, bersihkan penyimpanan lokal
            await AsyncStorage.removeItem('userToken');
            (global as any).apiToken = null;
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Gagal memulihkan sesi aktif:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Update helper API token global saat token state berubah
  useEffect(() => {
    if (token) {
      (global as any).apiToken = token;
    } else {
      (global as any).apiToken = null;
    }
  }, [token]);

  const login = async (email: string, password: string, role: 'user' | 'guide') => {
    setIsLoading(true);
    try {
      const endpoint = role === 'guide' ? '/api/v1/auth-guides/login' : '/api/v1/auth-travelers/login';
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json();

      if (!response.ok) {
        if (response.status === 403 || (body.detail && body.detail.toLowerCase().includes('verifikasi'))) {
          setIsLoading(false);
          return { success: true, verified: false };
        }
        throw new Error(body.detail ?? 'Gagal login.');
      }

      const { access_token, profile: userProfile } = body.data;
      
      // Simpan token ke local storage permanen
      await AsyncStorage.setItem('userToken', access_token);

      setToken(access_token);
      setUserRole(role);
      setProfile({ ...userProfile, role });
      setIsLoading(false);
      return { success: true, verified: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'user' | 'guide',
    birthDate?: string
  ) => {
    setIsLoading(true);
    try {
      const endpoint = role === 'guide' ? '/api/v1/auth-guides/register' : '/api/v1/auth-travelers/register';
      
      const payload: any = { name, email, password };
      if (role === 'user') {
        payload.birth_date = birthDate ?? '1995-01-01';
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail ?? 'Registrasi gagal.');
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = async (email: string, code: string, role: 'user' | 'guide', passwordForAutoLogin?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: code,
          type: 'signup',
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail ?? 'OTP tidak valid.');
      }

      if (passwordForAutoLogin) {
        const loginRes = await login(email, passwordForAutoLogin, role);
        if (!loginRes.success) {
          throw new Error(loginRes.error ?? 'Verifikasi sukses, namun login otomatis gagal.');
        }
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const saveGoogleSession = async (accessToken: string, googleProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('userToken', accessToken);
    } catch (err) {
      console.warn('[AuthContext] Gagal menyimpan Google token ke storage:', err);
    }
    setToken(accessToken);
    setUserRole(googleProfile.role || 'user');
    setProfile(googleProfile);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        await fetch(`${BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.warn('Backend logout failed:', e);
    } finally {
      try {
        await AsyncStorage.removeItem('userToken');
      } catch (err) {
        console.warn('[AuthContext] Gagal menghapus token dari storage:', err);
      }
      setToken(null);
      setUserRole(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userRole,
        profile,
        userLocation,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        verifyOtp,
        setUserLocation,
        saveGoogleSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
