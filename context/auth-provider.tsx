// "use client";

// import { redirect } from "next/navigation";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useMemo,
//   ReactNode,
// } from "react";
// import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// // Define the shape of the context state
// export interface AuthStateInterface {
//   user: { [key: string]: any } | null; // Assuming user data is an object; adjust as necessary
//   isAuthenticated: boolean;
//   login: (userData: { [key: string]: any }) => void;
//   logout: () => void;
// }

// // Define the default state
// const defaultAuthState: AuthStateInterface = {
//   user: null, // User is not authenticated by default
//   isAuthenticated: false,
//   login: () => {},
//   logout: () => {},
// };

// // Create the context
// const AuthContext = createContext<AuthStateInterface>(defaultAuthState);

// // Define the provider props type
// interface AuthProviderProps {
//   userData: AuthStateInterface["user"];
//   children: ReactNode;
// }

// // AuthProvider component
// export const AuthProvider: React.FC<AuthProviderProps> = ({
//   userData,
//   children,
// }: AuthProviderProps) => {
//   const [userAuthData, setUserAuthData] =
//     useState<AuthStateInterface["user"]>(userData);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getCookie('Authorization'));

//   const login = (userData: { [key: string]: any }) => {
//     setUserAuthData(userData);
//     setIsAuthenticated(true);
//     // Store user data in cookie if needed
//     setCookie('user', JSON.stringify(userData), { maxAge: 3600 * 24 * 7 });
//     redirect("/dashboard");
//   };

//   const logout = () => {
//     setUserAuthData(null);
//     setIsAuthenticated(false);
//     // Clear all auth-related cookies
//     deleteCookie('Authorization');
//     deleteCookie('user');
//     redirect("/");
//   };

//   const contextValue = useMemo(
//     () => ({
//       user: userAuthData,
//       isAuthenticated,
//       login,
//       logout,
//     }),
//     [userAuthData, isAuthenticated]
//   );

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );
// };

// // Hook to use auth context
// export const useAuth = () => useContext(AuthContext);
