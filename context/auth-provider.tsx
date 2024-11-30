"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

// Define the shape of the context state
export interface AuthStateInterface {
  user: { [key: string]: any } | null; // Assuming user data is an object; adjust as necessary
  login: (userData: { [key: string]: any }) => void;
  logout: () => void;
}

// Define the default state
const defaultAuthState: AuthStateInterface = {
  user: null, // User is not authenticated by default
  login: () => {},
  logout: () => {},
};

// Create the context
const AuthContext = createContext<AuthStateInterface>(defaultAuthState);

// Define the provider props type
interface AuthProviderProps {
  userData: AuthStateInterface["user"];
  children: ReactNode;
}

// Add cookie keys
const userKey = "auth-user";

// Add helper functions for cookie management
function getUserFromCookies(): { [key: string]: any } | null {
  const cookie = getCookie(userKey);
  return cookie ? JSON.parse(cookie as string) : null;
}

function setUserInCookies(user: { [key: string]: any } | null) {
  if (user) {
    setCookie(userKey, JSON.stringify(user), { maxAge: 3600 }); // 7 days
  } else {
    deleteCookie(userKey);
  }
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({
  userData,
  children,
}: AuthProviderProps) => {
  const [userAuthData, setUserAuthData] =
    useState<AuthStateInterface["user"]>(() => userData || getUserFromCookies());

  const login = (userData: { [key: string]: any }) => {
    setUserAuthData(userData);
    setUserInCookies(userData);
    // Remove redirect from here - handle it in the component that calls login
  };

  const logout = () => {
    setUserAuthData(null);
    setUserInCookies(null);
    // Remove redirect from here - handle it in the component that calls logout
  };

  const contextValue = useMemo(
    () => ({
      user: userAuthData,
      login,
      logout,
    }),
    [userAuthData]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);
