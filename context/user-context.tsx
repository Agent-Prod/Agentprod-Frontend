"use client";

import React, { useState, useEffect, useMemo } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

export interface UserInterface {
  id: string;
  username?: string;
  firstName?: string;
  email?: string;
  lastName?: string;
}

export interface AppState {
  user: UserInterface | null;
  setUser: (user: UserInterface | null) => void;
  updateUser: (updatedFields: Partial<UserInterface>) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

const defaultState: AppState = {
  user: null,
  setUser: () => {},
  updateUser: () => {},
  token: null,
  setToken: () => {},
};

const UserContext = React.createContext<AppState>(defaultState);
export const useUserContext = () => React.useContext(UserContext);

// Helper functions for cookie management
const userKey = "user";
const tokenKey = "auth-token";

function getUserFromCookies(): UserInterface | null {
  const cookie = getCookie(userKey);
  return cookie ? JSON.parse(cookie as string) : null;
}

function getTokenFromCookies(): string | null {
  const token = getCookie(tokenKey);
  return token ? (token as string) : null;
}

function setUserInCookies(user: UserInterface | null) {
  if (user) {
    setCookie(userKey, JSON.stringify(user), { maxAge: 3600}); // 1 hour
  } else {
    deleteCookie(userKey);
  }
}

function setTokenInCookies(token: string | null) {
  if (token) {
    setCookie(tokenKey, token, { maxAge: 3600}); // 1 hour
  } else {
    deleteCookie(tokenKey);
  }
}

interface Props {
  children: React.ReactNode;
}

export const UserContextProvider: React.FunctionComponent<Props> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInterface | null>(getUserFromCookies());
  const [token, setToken] = useState<string | null>(getTokenFromCookies());

  // Update user state
  const updateUser = (updatedFields: Partial<UserInterface>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  // Update cookies when user or token changes
  useEffect(() => {
    setUserInCookies(user);
  }, [user]);

  useEffect(() => {
    setTokenInCookies(token);
  }, [token]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      token,
      setToken,
    }),
    [user, token]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
