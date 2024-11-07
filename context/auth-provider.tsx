"use client";

import { redirect } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";

// Define the shape of the context state
interface UserSettings {
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

export interface AuthStateInterface {
  user: UserSettings | null;
  login: (userData: UserSettings) => void;
  logout: () => void;
}

// Define the default state
const defaultAuthState: AuthStateInterface = {
  user: null,
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

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({
  userData,
  children,
}: AuthProviderProps) => {
  const [userAuthData, setUserAuthData] = useState<AuthStateInterface["user"]>(userData);

  useEffect(() => {
    // Fetch initial settings when component mounts
    const fetchSettings = async () => {
      try {
        const token = Cookies.get('Authorization');
        if (!token) return;

        const response = await axios.get<UserSettings>(`${process.env.NEXT_PUBLIC_SERVER_URL}v2/settings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setUserAuthData(response.data);  // Set entire response as user data
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      }
    };

    fetchSettings();
  }, []);
  const login = (userData: UserSettings) => {
    setUserAuthData(userData);
    redirect("/dashboard");
    // Optionally save the user data to localStorage/sessionStorage for persistence
  };

  const logout = () => {
    setUserAuthData(null);
    redirect("/");
    // Optionally clear the user data from localStorage/sessionStorage
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
