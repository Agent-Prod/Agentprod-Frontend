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

type AnalyticsData = {
  campaign_id: string;
  delivered_count: number;
  clicked_count: number;
  spam_count: number;
  bounced_count: number;
  user_id: string;
  open_count: number;
  campaign_name: string;
  responded: number;
  sent_count: number;
  total_leads: number;
}[];

interface DashboardContextType {
  dashboardData: DashboardData;
  analyticsData: AnalyticsData;
  isLoading: boolean;
  setDashboardData: (dashboardData: DashboardData) => void;
  fetchDashboardDataIfNeeded: () => Promise<void>;
}

const defaultDashboardState: DashboardContextType = {
  dashboardData: {
    id: 0,
    user_id: "",
    total_leads: 0,
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
  analyticsData: [],
  isLoading: false,
  setDashboardData: () => { },
  fetchDashboardDataIfNeeded: async () => { },
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const fetchDashboardDataIfNeeded = async () => {
    if (!user?.id || hasLoadedData) return;

    setIsLoading(true);
    try {
      const [dashboardResponse, analyticsResponse] = await Promise.all([
        axiosInstance.get<DashboardData>(`v2/dashboard/${user.id}`),
        axiosInstance.get<AnalyticsData>(`v2/campaign/analytics/${user.id}`)
      ]);

      if (dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
      }
      if (analyticsResponse.data) {
        setAnalyticsData(analyticsResponse.data);
      }
      setHasLoadedData(true);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      dashboardData,
      analyticsData,
      isLoading,
      setDashboardData,
      fetchDashboardDataIfNeeded,
    }),
    [dashboardData, analyticsData, isLoading, hasLoadedData]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext);
