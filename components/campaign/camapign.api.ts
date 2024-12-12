import axiosInstance from "@/utils/axiosInstance";
import {
  CampaignEntry,
  GoalData,
  GoalFormData,
  OfferingFormData,
  defaultCampaignEntry,
  defaultGoalEntry,
  defaultOfferingEntry,
} from "@/context/campaign-provider";
import { toast } from "@/components/ui/use-toast";

export interface GoalDataWithId extends GoalData {
  id: string;
}

export const getCampaignById = async (
  campaignId: string
): Promise<CampaignEntry> => {
  const response = await axiosInstance
    .get(`v2/campaigns/${campaignId}`)
    .then((response) => {
      const data = response.data as CampaignEntry;
      console.log("Campaign fetched successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching campaign:", error);
      toast({
        title: "Error fetching campaign",
        description: error.message || "Failed to fetch campaign.",
      });
      return defaultCampaignEntry;
    });

  return response;
};

export const getGoalById = async (
  campaignId: string
): Promise<GoalDataWithId> => {
  const response = await axiosInstance
    .get(`v2/goals/${campaignId}`)
    .then((response) => {
      const data = response.data as GoalDataWithId;
      console.log("Goal fetched successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching goal:", error);
      toast({
        title: "Error fetching campaign",
        description: error.message || "Failed to fetch campaign.",
      });
      return {
        id: "",
        success_metric: "",
        scheduling_link: "",
        emails: [],
        follow_up_days: 0,
        follow_up_times: 0,
        mark_as_lost: 0,
      } as GoalDataWithId;
    });

  return response;
};

export const getOfferingById = async (
  campaignId: string
): Promise<OfferingFormData> => {
  const response = await axiosInstance
    .get(`v2/offerings/${campaignId}`)
    .then((response) => {
      const data = response.data as OfferingFormData;
      console.log("Offering fetched successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching offering:", error);
      toast({
        title: "Error fetching offering",
        description: error.message || "Failed to fetch offering.",
      });
      return defaultOfferingEntry;
    });

  return response;
};

export const getAudienceFiltersById = async (
  campaignId: string
): Promise<any> => {
  const response = await axiosInstance
    .get(`v2/audience/${campaignId}`)
    .then((response) => {
      const data = response.data;
      console.log("filters fetched successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching filters:", error);
      toast({
        title: "Error fetching audience filters",
        description: error.message || "Failed to fetch audience filters.",
      });
      return [];
    });

  return response;
};

export const getPersonaByUserId = async (userId: string): Promise<any> => {
  const response = await axiosInstance
    .get(`v2/personas/${userId}`)
    .then((response) => {
      const data = response.data;
      console.log("persona fetched successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching persona:", error);
      toast({
        title: "Error fetching persona",
        description: error.message || "Failed to fetch persona.",
      });
    });

  return response;
};

export const createPersona = async (postData: {
  campaign_id: string;
  pain_point?: string[];
  values?: string[];
  customer_success_stories?: string[];
  detailed_product_description?: string;
  created_at?: string;
}) => {
  return axiosInstance
    .post("/v2/personas", postData)
    .then((response) => {
      const data = response.data;
      console.log("Persona created successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error creating persona:", error);
      toast({
        title: "Error creating persona",
        description: error.message || "Failed to create persona.",
      });
      throw error; // re-throw the error to be handled elsewhere if needed
    });
};

export const getPersonaByCampaignId = async (
  campaignId: string
): Promise<any> => {
  const response = await axiosInstance
    .get(`v2/personas/campaign/${campaignId}`)
    .then((response) => {
      const data = response.data;
      console.log("persona fetched successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching persona:", error);
      toast({
        title: "Error fetching persona",
        description: error.message || "Failed to fetch persona.",
      });
    });

  return response;
};

export const editPersona = async (postData: {
  campaign_id: string;
  pain_point?: string[];
  values?: string[];
  customer_success_stories?: string[];
  detailed_product_description?: string;
  created_at?: string;
}): Promise<any> => {
  return axiosInstance
    .put(`/v2/personas/campaign`, postData)
    .then((response) => {
      const data = response.data;
      console.log("Persona updated successfully:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error updating persona:", error);
      toast({
        title: "Error updating persona",
        description: error.message || "Failed to updat persona.",
      });
      throw error; // re-throw the error to be handled elsewhere if needed
    });
};
