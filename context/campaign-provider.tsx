/* eslint-disable no-console */
// hooks/useCreateCampaign.tsx
import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Ole } from "next/font/google";
import { useAuth } from "./auth-provider";

export interface CampaignFormData {
  [key: string]: any;
  campaignName: string;
  campaignType: "Outbound" | "Inbound" | "Nurturing";
  scheduleType: "recurring" | "immediate";
  schedule: {
    weekdayStartTime?: string;
    weekdayEndTime?: string;
  };
}
export interface OfferingFormData {
  name: string;
  details: string;
}

export interface GoalFormData {
  success_metric: string;
  scheduling_link?: string;
  emails: { value: string }[];
  follow_up_days: number;
  follow_up_times: number;
  mark_as_lost: number;
  linkedin_accounts?: string[];
  like_post?: number;
  withdraw_invite?: number;
  sequence?: any
  linkedin_send_message_with_request?: boolean;
}

export interface GoalData {
  success_metric: string;
  scheduling_link: string;
  emails: string[];
  follow_up_days: number;
  follow_up_times: number;
  mark_as_lost: number;
  linkedin_accounts?: string[];
  like_post?: number;
  withdraw_invite?: number;
}

export interface CampaignEntry {
  detail: string;
  id: string;
  user_id: string;
  campaign_name: string;
  is_active: boolean;
  campaign_type: string;
  daily_outreach_number?: number;
  start_date?: string;
  end_date?: string;
  schedule_type: string;
  description?: string;
  additional_details?: string;
  monday_start?: string;
  monday_end?: string;
  tuesday_start?: string;
  tuesday_end?: string;
  wednesday_start?: string;
  wednesday_end?: string;
  thursday_start?: string;
  thursday_end?: string;
  friday_start?: string;
  friday_end?: string;
  contacts?: any;
  offering_details: any[];
  replies: any;
  meetings_booked: any;
  channel: any
}

export const defaultCampaignEntry: CampaignEntry = {
  id: "",
  user_id: "",
  campaign_name: "",
  is_active: false,
  campaign_type: "",
  daily_outreach_number: 0,
  start_date: "",
  end_date: "",
  schedule_type: "",
  description: "",
  additional_details: "",
  monday_start: "",
  monday_end: "",
  tuesday_start: "",
  tuesday_end: "",
  wednesday_start: "",
  wednesday_end: "",
  thursday_start: "",
  thursday_end: "",
  friday_start: "",
  friday_end: "",
  contacts: "",
  offering_details: [],
  replies: "",
  meetings_booked: "",
  detail: "",
  channel: "",
};

export const defaultGoalEntry: GoalFormData = {
  success_metric: "",
  scheduling_link: "",
  emails: [],
  follow_up_days: 0,
  follow_up_times: 0,
  mark_as_lost: 0,
  linkedin_accounts: [],
  like_post: 0,
  withdraw_invite: 0,
};

export const defaultOfferingEntry: OfferingFormData = {
  name: "",
  details: "",
};

interface CampaignContextType {
  campaigns: CampaignEntry[];
  createCampaign: (data: CampaignFormData) => void;
  editCampaign: (data: CampaignFormData, campaignId: string) => void;
  deleteCampaign: (campaignId: string) => void;
  createOffering: (data: OfferingFormData, campaignId: string) => void;
  editOffering: (data: OfferingFormData, offering: string, campaignId: string) => void;
  createGoal: (data: GoalFormData, campaignId: string) => void;
  editGoal: (data: GoalFormData, goalId: string, campaignId: string) => void;
  toggleCampaignIsActive: (campaignId: string) => void;
  isLoading: boolean;
  setCampaigns: React.Dispatch<React.SetStateAction<CampaignEntry[]>>;
  fetchCampaignsIfNeeded: () => Promise<void>;
}

const defaultCampaignState: CampaignContextType = {
  campaigns: [],
  createCampaign: () => { },
  editCampaign: () => { },
  deleteCampaign: () => { },
  createOffering: () => { },
  editOffering: () => { },
  createGoal: () => { },
  editGoal: () => { },
  toggleCampaignIsActive: () => { },
  isLoading: false,
  setCampaigns: () => { },
  fetchCampaignsIfNeeded: async () => { },
};

// Use the default state when creating the context
const CampaignContext =
  createContext<CampaignContextType>(defaultCampaignState);

interface Props {
  children: ReactNode;
}

export const CampaignProvider: React.FunctionComponent<Props> = ({
  children,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [userId, setUserId] = React.useState<string>();
  const [hasLoadedData, setHasLoadedData] = useState(false);

  React.useEffect(() => {
    if (user && user.id) {
      setUserId(user.id);
    }
  }, [user]);

  const fetchCampaignsIfNeeded = async () => {
    if (!userId || hasLoadedData) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get<CampaignEntry[]>(`v2/campaigns/all/`);
      const sortedCampaigns = response.data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      setCampaigns(sortedCampaigns);
      setHasLoadedData(true);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      setError("Failed to load campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = (data: CampaignFormData) => {
    console.log("user from camapgin", user);
    const postData = {
      user_id: userId,
      campaign_name: data.campaignName,
      campaign_type: data.campaignType,
      monday_start: data.schedule.weekdayStartTime,
      monday_end: data.schedule.weekdayEndTime,
      tuesday_start: data.schedule.weekdayStartTime,
      tuesday_end: data.schedule.weekdayEndTime,
      wednesday_start: data.schedule.weekdayStartTime,
      wednesday_end: data.schedule.weekdayEndTime,
      thursday_start: data.schedule.weekdayStartTime,
      thursday_end: data.schedule.weekdayEndTime,
      friday_start: data.schedule.weekdayStartTime,
      friday_end: data.schedule.weekdayEndTime,
      schedule_type: data.schedule_type,
      autopilot: false,
      is_active: false,
      channel_type: data.channelType,
    };

    console.log("postData", postData);

    // if (postData)
    //   axiosInstance
    //     .post("v2/campaigns/", postData)
    //     .then((response) => {
    //       console.log("Campaign created successfully:", response);
    //       setCampaigns((prevCampaigns) => [...prevCampaigns, response.data]);
    //       let formsTracker = JSON.parse(
    //         localStorage.getItem("formsTracker") || "{}"
    //       );
    //       formsTracker.schedulingBudget = true;
    //       formsTracker.campaignId = response.data.id;
    //       localStorage.setItem("formsTracker", JSON.stringify(formsTracker));

    //       // router.push(`/dashboard/campaign/${response.data.id}`);
    //     })
    //     .catch((error) => {
    //       console.error("Error creating Campaign:", error);
    //       toast({
    //         title: "Error creating campaign",
    //         description: error.message || "Failed to create campaign.",
    //       });
    //     });
  };

  const editCampaign = (data: CampaignFormData, campaignId: string) => {
    axiosInstance
      .put(`v2/campaigns/${campaignId}`, data)
      .then((response) => {
        console.log("Campaign edited successfully:", response.data);
        router.push(`/campaign/${campaignId}`);
      })
      .catch((error) => {
        console.error("Error editing campaign:", error);
        toast({
          title: "Error editing campaign",
          description: error.message || "Failed to edit campaign.",
        });
      });
  };

  const deleteCampaign = (campaignId: string) => {
    axiosInstance
      .delete(`v2/campaigns/${campaignId}`)
      .then((response) => {
        console.log("Campaign deleted successfully:", response.data);
        setCampaigns((currentCampaigns) =>
          currentCampaigns.filter((campaign) => campaign.id !== campaignId)
        );
        router.push("/campaign");
      })
      .catch((error) => {
        console.error("Error deleting campaign:", error);
        toast({
          title: "Error deleting campaign",
          description: error.message || "Failed to delete campaign.",
        });
      });
  };

  const createOffering = (data: OfferingFormData, campaignId: string) => {
    const postData = {
      campaign_id: campaignId,
      name: data.name,
      details: data.details,
    };

    axiosInstance
      .post("v2/offerings/", postData)
      .then((response) => {
        let formsTracker = JSON.parse(
          localStorage.getItem("formsTracker") || "{}"
        );
        formsTracker.offering = true;
        localStorage.setItem("formsTracker", JSON.stringify(formsTracker));

        console.log("Offering created successfully:", response.data);
        router.push(`/campaign/${campaignId}`);
      })
      .catch((error) => {
        console.error("Error creating offering:", error);
        toast({
          title: "Error creating offering",
          description: error.message || "Failed to create offering.",
        });
      });
  };

  const editOffering = (data: OfferingFormData, offering: string, campaignId: string) => {
    axiosInstance
      .put(`v2/offerings/${offering}`, data)
      .then((response) => {
        console.log("Offering edited successfully:", response.data);
        router.push(`/campaign/${campaignId}`);
      })
      .catch((error) => {
        console.error("Error editing offering:", error);
        toast({
          title: "Error editing offering",
          description: error.message || "Failed to edit offering.",
        });
      });
  };

  const createGoal = (data: GoalFormData, campaignId: string) => {
    const postData = {
      campaign_id: campaignId,
      emails: data.emails.map((email) => email.value),
      current_email: data.emails[0]?.value,
      success_metric: data.success_metric,
      scheduling_link: data?.scheduling_link || null,
      follow_up_days: data.follow_up_days,
      follow_up_times: data.follow_up_times,
      mark_as_lost: data.mark_as_lost,
      linkedin_accounts: data.linkedin_accounts,
      like_post: data.like_post,
      withdraw_invite: data.withdraw_invite,
      sequence: data.sequence,
      linkedin_send_message_with_request: data.linkedin_send_message_with_request
    };

    console.log("Creating goal with postData:", JSON.stringify(postData, null, 2));

    axiosInstance
      .post("v2/goals/", postData)
      .then((response) => {
        console.log("Goal created with response:", response.data);
        let formsTracker = JSON.parse(
          localStorage.getItem("formsTracker") || "{}"
        );
        formsTracker.goal = true;
        localStorage.setItem("formsTracker", JSON.stringify(formsTracker));

        console.log("Goal created successfully:", response.data);
        router.push(`/campaign/${campaignId}`);
      })
      .catch((error) => {
        console.error("Error creating goal:", error);
        toast({
          title: "Error creating goal",
          description: error.message || "Failed to create goal.",
        });
      });
  };

  const editGoal = (data: GoalFormData, goalId: string, campaignId: string) => {
    const putData = {
      campaign_id: campaignId,
      emails: data.emails.map((email) => email.value),
      current_email: data.emails[0]?.value,
      success_metric: data.success_metric,
      scheduling_link: data?.scheduling_link || null,
      follow_up_days: data.follow_up_days,
      follow_up_times: data.follow_up_times,
      mark_as_lost: data.mark_as_lost,
      linkedin_accounts: data.linkedin_accounts,
      like_post: data.like_post,
      withdraw_invite: data.withdraw_invite,
      sequence: data.sequence,
      linkedin_send_message_with_request: data.linkedin_send_message_with_request
    };

    console.log("Editing goal with putData:", JSON.stringify(putData, null, 2));

    axiosInstance
      .put(`v2/goals/${goalId}`, putData)
      .then((response) => {
        console.log("Goal edited with response:", response.data);
        let formsTracker = JSON.parse(
          localStorage.getItem("formsTracker") || "{}"
        );
        formsTracker.goal = true;
        localStorage.setItem("formsTracker", JSON.stringify(formsTracker));

        console.log("Goal edited successfully:", response.data);
        router.push(`/campaign/${campaignId}`);
      })
      .catch((error) => {
        console.error("Error editing goal:", error);
        toast({
          title: "Error editing goal",
          description: error.message || "Failed to edit goal.",
        });
      });
  };

  // const getCampaignById = (campaignId: string): Promise<any> => {
  //   return axiosInstance
  //     .get(`v2/campaigns/${campaignId}`)
  //     .then((response) => {
  //       console.log("Campaign fetched successfully:", response.data);
  //       return response.data;
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching campaign:", error);
  //       toast({
  //         title: "Error fetching campaign",
  //         description: error.message || "Failed to fetch campaign.",
  //       });
  //     });
  // };

  const toggleCampaignIsActive = (id: string) => {
    setCampaigns((currentCampaigns) =>
      currentCampaigns.map((campaign) =>
        campaign.campaignId === id
          ? { ...campaign, is_active: !campaign.is_active }
          : campaign
      )
    );
  };

  const contextValue = useMemo(
    () => ({
      createCampaign,
      editCampaign,
      deleteCampaign,
      createOffering,
      editOffering,
      createGoal,
      editGoal,
      toggleCampaignIsActive,
      campaigns,
      isLoading,
      setCampaigns,
      fetchCampaignsIfNeeded,
    }),
    [userId, campaigns, isLoading, hasLoadedData]
  );

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => useContext(CampaignContext);
