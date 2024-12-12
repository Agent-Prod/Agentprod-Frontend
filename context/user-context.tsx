"use client";

import React, { useState, useEffect, useMemo } from "react";
import { setCookie, getCookie } from "cookies-next";

export interface UserInterface {
  id: string;
  username?: string;
  firstName?: string;
  email?: string;
  lastName?: string;
  // company?: string;
  // companyID: string;
  // notification: string;
  // plan: string;
  // leadUsed: string;
}

export const DummyUser: UserInterface = {
  id: "9cbe5057-59fe-4e6e-8399-b9cd85cc9c6c",
  username: "Agentprod",
  firstName: "Agent",
  email: "agentprod@agentprod.com",
  lastName: "",
  // company: "",
  // companyID: "",
  // notification: "",
  // plan: "",
  // leadUsed: "",
};

export interface AppState {
  user: UserInterface;
  setUser: (user: UserInterface) => void;
  updateUser: (updatedFields: UserInterface) => void;
}

const defaultState: AppState = {
  user: DummyUser,
  setUser: () => { },
  updateUser: () => { },
};

const UserContext = React.createContext<AppState>(defaultState);
export const useUserContext = () => React.useContext(UserContext);

// Helper functions for local storage management
const userKey = "user";

function getUserFromCookies(): UserInterface {
  const cookie = getCookie(userKey);
  return cookie ? JSON.parse(cookie as string) : null;
}

function setUserInCookies(user: UserInterface) {
  setCookie(userKey, JSON.stringify(user), { maxAge: 3600 * 24 * 7 }); // Expires in one week
}

interface Props {
  children: React.ReactNode;
}

export const UserContextProvider: React.FunctionComponent<Props> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInterface>(getUserFromCookies());

  // Update user state
  const updateUser = (updatedFields: UserInterface) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  useEffect(() => {
    setUserInCookies(user);
  }, [user]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      updateUser, // Add the updateUser function to the context
    }),
    [user]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
