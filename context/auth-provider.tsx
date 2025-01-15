"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

interface UserMetadata {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

interface UserSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
}

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: UserMetadata;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: UserSession | null;
  loading: boolean;
  token: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  login: (userData: { user_id: { user: User; session: UserSession } }) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
}

const defaultState: AuthState = {
  user: null,
  session: null,
  loading: true,
  token: null,
  refreshToken: null,
  setUser: () => { },
  setToken: () => { },
  setRefreshToken: () => { },
  login: () => { },
  logout: () => { },
  updateUser: () => { },
};

const AuthContext = createContext<AuthState | undefined>(undefined);

// Cookie keys
const USER_KEY = "user";
const TOKEN_KEY = "auth-token";
const SESSION_KEY = "auth-session";
const REFRESH_TOKEN_KEY = "auth-refresh-token";

// Helper functions for cookie management
function getUserFromCookies(): User | null {
  const cookie = getCookie(USER_KEY);
  return cookie ? JSON.parse(cookie as string) : null;
}

function getSessionFromCookies(): UserSession | null {
  const cookie = getCookie(SESSION_KEY);
  return cookie ? JSON.parse(cookie as string) : null;
}

function getTokenFromCookies(): string | null {
  const token = getCookie(TOKEN_KEY);
  return token ? (token as string) : null;
}

function getRefreshTokenFromCookies(): string | null {
  const refreshToken = getCookie(REFRESH_TOKEN_KEY);
  return refreshToken ? (refreshToken as string) : null;
}

function setUserInCookies(user: User | null) {
  if (user) {
    console.log("user" + user)
    setCookie(USER_KEY, JSON.stringify(user), { maxAge: 604800 }); // 1 week
  } else {
    deleteCookie(USER_KEY);
  }
}

function setSessionInCookies(session: UserSession | null) {
  if (session) {
    setCookie(SESSION_KEY, JSON.stringify(session), { maxAge: 604800 }); // 1 week
  } else {
    deleteCookie(SESSION_KEY);
  }
}

function setTokenInCookies(token: string | null) {
  if (token) {
    setCookie(TOKEN_KEY, token, { maxAge: 604800 }); // 1 hour
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    deleteCookie(TOKEN_KEY);
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
}

function setRefreshTokenInCookies(refreshToken: string | null) {
  if (refreshToken) {
    setCookie(REFRESH_TOKEN_KEY, refreshToken, { maxAge: 604800 }); // 1 week
  } else {
    deleteCookie(REFRESH_TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(getUserFromCookies());
  const [session, setSession] = useState<UserSession | null>(getSessionFromCookies());
  const [token, setToken] = useState<string | null>(getTokenFromCookies());
  const [refreshToken, setRefreshToken] = useState<string | null>(getRefreshTokenFromCookies());
  const [loading, setLoading] = useState(true);

  // Update cookies when states change
  useEffect(() => {
    setUserInCookies(user);
  }, [user]);

  useEffect(() => {
    setSessionInCookies(session);
  }, [session]);

  useEffect(() => {
    setTokenInCookies(token);
  }, [token]);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) {
      axiosInstance.interceptors.request.use((config) => {
        config.headers = config.headers || {};
        config.headers['user_id'] = user.id;
        return config;
      });
    } else {
      axiosInstance.interceptors.request.clear();
    }
  }, [user?.id]);

  useEffect(() => {
    setRefreshTokenInCookies(refreshToken);
  }, [refreshToken]);

  const login = (userData: { user_id: { user: User; session: UserSession } }) => {
    const { user: newUser, session: newSession } = userData.user_id;
    const newToken = newSession.access_token;
    const newRefreshToken = newSession.refresh_token;

    setUser(newUser);
    setSession(newSession);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    setToken(null);
    setRefreshToken(null);
    router.push("/");
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      token,
      refreshToken,
      setUser,
      setToken,
      setRefreshToken,
      login,
      logout,
      updateUser,
    }),
    [user, session, loading, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};