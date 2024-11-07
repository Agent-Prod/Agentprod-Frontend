"use client";

import React, { useState, useEffect, useMemo } from "react";
import { setCookie, getCookie } from "cookies-next";
import axios from "axios";

export interface UserInterface {
  user_id: string;
  first_name: string;
  last_name: string;
  job_title: string;
  phone_number: string;
  email: string;
  company: string;
  company_id: string;
  notifications: boolean;
  plan: string;
  leads_used: number;
  thread_id: string;
  hubspot_token: string;
  salesforce_token: string;
}

export const DummyUser: UserInterface = {
  user_id: "9cbe5057-59fe-4e6e-8399-b9cd85cc9c6c",
  first_name: "Agent",
  last_name: "",
  job_title: "",
  phone_number: "",
  email: "agentprod@agentprod.com",
  company: "",
  company_id: "",
  notifications: false,
  plan: "",
  leads_used: 0,
  thread_id: "",
  hubspot_token: "",
  salesforce_token: "",
};

export interface AppState {
  user: UserInterface | null;
  setUser: (user: UserInterface) => void;
  updateUser: (updatedFields: Partial<UserInterface>) => void;
}

const defaultState: AppState = {
  user: DummyUser,
  setUser: () => {},
  updateUser: () => {},
};

const UserContext = React.createContext<AppState>(defaultState);
export const useUserContext = () => React.useContext(UserContext);

// Helper functions for local storage management
const userKey = "user";

function getUserFromCookies(): UserInterface | null {
  const cookie = getCookie(userKey);
  return cookie ? JSON.parse(cookie as string) : null;
}

interface Props {
  children: React.ReactNode;
}

export const UserContextProvider: React.FunctionComponent<Props> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInterface | null>(getUserFromCookies());

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getCookie('Authorization');
        if (!token) return;

        const response = await axios.get<UserInterface>(
          `${process.env.NEXT_PUBLIC_SERVER_URL}v2/settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      }
    };

    if (!user) {
      fetchSettings();
    }
  }, [user]);

  const updateUser = (updatedFields: Partial<UserInterface>) => {
    setUser((prev) => prev ? { ...prev, ...updatedFields } : null);
  };

  

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
    }),
    [user]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
