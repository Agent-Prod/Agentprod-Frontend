// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-console */
// // hooks/useCreateCampaign.tsx
// import React, {
//   useState,
//   createContext,
//   useContext,
//   useMemo,
//   ReactNode,
// } from "react";
// import axiosInstance from "@/utils/axiosInstance";
// import { useUserContext } from "./user-context";
// import Cookies from 'js-cookie';
// import axios from "axios";

// type HotLead = {
//   id: string;
//   photo_url: string;
//   fallback: string;
//   name: string;
//   company: string;
// };

// type TopPerformingCampaign = {
//   campaign_name: string;
//   engaged_leads: number;
//   response_rate: number;
//   bounce_rate: number;
//   open_rate: number;
// };

// type ConversionFunnel = {
//   [key: string]: number;
// };

// type EmailStats = {
//   open_rate: number;
//   reply_rate: number;
//   conversion_rate: number;
//   unsubscribed_rate: number;
//   deliverability_rate: number;
//   negative_email_rate: number;
//   positive_email_rate: number;
// };

// interface DashboardEntry {
//   id: number;
//   pending_approvals: number;
//   user_id: string;
//   emails_sent: number | null;
//   engaged: number | null;
//   meetings_booked: number | null;
//   response_rate: number;
//   conversion_funnel: ConversionFunnel;
//   hot_leads: HotLead[];
//   mailbox_health: { [email: string]: number };
//   top_performing_campaigns: TopPerformingCampaign[];
//   email_stats: EmailStats;
// }

// interface DashboardContextType {
//   dashboardData: DashboardEntry;
//   isLoading: boolean;
//   setDashboardData: (dashboardData: DashboardEntry) => void;
// }

// const defaultDashboardState: DashboardContextType = {
//   dashboardData: {
//     id: 0,
//     user_id: "",
//     pending_approvals: 0,
//     emails_sent: null,
//     engaged: null,
//     meetings_booked: null,
//     response_rate: 0,
//     hot_leads: [],
//     mailbox_health: {},
//     conversion_funnel: {},
//     top_performing_campaigns: [],
//     email_stats: {
//       open_rate: 0,
//       reply_rate: 0,
//       conversion_rate: 0,
//       unsubscribed_rate: 0,
//       deliverability_rate: 0,
//       negative_email_rate: 0,
//       positive_email_rate: 0,
//     },
//   },
//   isLoading: true,
//   setDashboardData: () => {},
// };

// const DashboardContext = createContext<DashboardContextType>(
//   defaultDashboardState
// );

// interface Props {
//   children: ReactNode;
// }

// export const DashboardProvider: React.FunctionComponent<Props> = ({
//   children,
// }) => {
//   const [dashboardData, setDashboardData] = useState<DashboardEntry>(
//     defaultDashboardState.dashboardData
//   );
//   const [isLoading, setIsLoading] = React.useState(true);
//   const [error, setError] = React.useState("");
//   const [authToken, setAuthToken] = useState<string | undefined>(Cookies.get('Authorization'));

//   const fetchDashboardData = async (retryCount = 0): Promise<void> => {
//     try {
//       const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}v2/dashboard`,{
//         headers: {
//           'Authorization': 'Bearer ' + Cookies.get('Authorization'),
//         },
//         withCredentials: true
//       });
//       if (response.data === null) {
//         // If response is null, retry up to 3 times with increasing delay
//         if (retryCount < 3) {
//           console.log(`Retry attempt ${retryCount + 1} for null response`);
//           // Exponential backoff delay: 1s, 2s, 4s
//           const delay = Math.pow(2, retryCount) * 1000;
//           await new Promise(resolve => setTimeout(resolve, delay));
//           return fetchDashboardData(retryCount + 1);
//         }
//         // If all retries fail, set default empty data
//         setDashboardData(defaultDashboardState.dashboardData);
//         console.warn("Received null response after retries");
//       } else {
//         setDashboardData(response.data);
//         console.log("Dashboard Data:", response.data);
//       }
//       setIsLoading(false);
//     } catch (error: any) {
//       if (error.response?.status === 404 || error.response?.status === 500 && retryCount < 3) {
//         console.log(`Retry attempt ${retryCount + 1} for 404 error`);
//         // Wait for 1 second before retrying
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         return fetchDashboardData(retryCount + 1);
//       }
//       console.error("Error fetching data:", error);
//       setError(error.message || "Failed to load data.");
//       setIsLoading(false);
//     }
//   };

//   React.useEffect(() => {
//     const token = Cookies.get('Authorization');
//     setAuthToken(token);
    
//     if (token) {
//       setIsLoading(true);
//       fetchDashboardData();
//     } else {
//       console.warn("No Authorization found");
//       setIsLoading(false);
//     }
//   }, []);

//   React.useEffect(() => {
//     const handleCookieChange = () => {
//       const newToken = Cookies.get('Authorization');
//       setAuthToken(newToken);
//     };

//     // Set up an interval to check for cookie changes
//     const intervalId = setInterval(handleCookieChange, 1000);

//     return () => clearInterval(intervalId);
//   }, []);

//   const contextValue = useMemo(
//     () => ({
//       dashboardData,
//       isLoading,
//       setDashboardData,
//     }),
//     [dashboardData, isLoading]
//   );

//   return (
//     <DashboardContext.Provider value={contextValue}>
//       {children}
//     </DashboardContext.Provider>
//   );
// };

// export const useDashboardContext = () => useContext(DashboardContext);
