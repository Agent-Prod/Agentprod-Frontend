/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// hooks/useCreateCampaign.tsx
import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "./user-context";
import { DashboardData } from "@/types/dashboard";

type HotLead = {
  id: string;
  photo_url: string;
  fallback: string;
  name: string;
  company: string;
};

type TopPerformingCampaign = {
  campaign_name: string;
  engaged_leads: number;
  response_rate: number;
  bounce_rate: number;
  open_rate: number;
};

type EmailStats = {
  open_rate: number;
  reply_rate: number;
  conversion_rate: number;
  unsubscribed_rate: number;
  deliverability_rate: number;
  negative_email_rate: number;
  positive_email_rate: number;
};

interface DashboardContextType {
  dashboardData: DashboardData;
  isLoading: boolean;
  setDashboardData: (dashboardData: DashboardData) => void;
}

const defaultDashboardState: DashboardContextType = {
  dashboardData: {
    id: 0,
    user_id: "",
    pending_approvals: 0,
    emails_sent: null,
    engaged: null,
    meetings_booked: null,
    response_rate: 0,
    hot_leads: [],
    mailbox_health: {},
    conversion_funnel: {
      sent: 0,
      opened: 0,
      cta_clicked: 0,
      goal: 0,
      'goal/click': 0,
      'goal/subscription': 0
    },
    top_performing_campaigns: [],
    email_stats: {
      open_rate: 0,
      reply_rate: 0,
      conversion_rate: 0,
      unsubscribed_rate: 0,
      deliverability_rate: 0,
      negative_email_rate: 0,
      positive_email_rate: 0,
    },
    linkedin_data: [
      {
        campaigns: [],
        connections_sent: 0,
        connections_withdrawn: 0,
        connections_accepted: 0,
      },
    ],
  },
  isLoading: true,
  setDashboardData: () => { },
};

const DashboardContext = createContext<DashboardContextType>(
  defaultDashboardState
);

interface Props {
  children: ReactNode;
}

export const DashboardProvider: React.FunctionComponent<Props> = ({
  children,
}) => {
  const { user } = useUserContext();
  const [dashboardData, setDashboardData] = useState<DashboardData>(
    defaultDashboardState.dashboardData
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const fetchDashboardData = async (userId: string, retryCount = 0): Promise<void> => {
    try {
      const response = await axiosInstance.get<DashboardData>(`v2/dashboard/${userId}`);
      if (response.data === null) {
        // If response is null, retry up to 3 times with increasing delay
        if (retryCount < 3) {
          console.log(`Retry attempt ${retryCount + 1} for null response`);
          // Exponential backoff delay: 1s, 2s, 4s
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchDashboardData(userId, retryCount + 1);
        }
        // If all retries fail, set default empty data
        setDashboardData(defaultDashboardState.dashboardData);
        console.warn("Received null response after retries");
      } else {
        setDashboardData(response.data);
        console.log("Dashboard Data:", response.data);
      }
      setIsLoading(false);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 500 && retryCount < 3) {
        console.log(`Retry attempt ${retryCount + 1} for 404 error`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchDashboardData(userId, retryCount + 1);
      }
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load data.");
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      fetchDashboardData(user.id);
    } else {
      console.warn("No user ID found");
      setIsLoading(false);
    }
  }, [user]);

  const contextValue = useMemo(
    () => ({
      dashboardData,
      isLoading,
      setDashboardData,
    }),
    [dashboardData, isLoading]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext);
