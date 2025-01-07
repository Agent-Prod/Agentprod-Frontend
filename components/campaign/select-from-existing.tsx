/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { useState, useEffect, useCallback } from "react";
import { AudienceTableClient } from "@/components/tables/audience-table/client";
import { Contact, useLeads } from "@/context/lead-user";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { LoadingCircle } from "@/app/icons";
import { v4 as uuid } from "uuid";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";

export const SelectFromExisting = () => {
  const { setLeads, existingLeads } = useLeads();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isCreateBtnLoading, setIsCreateBtnLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const size = 10;

  const { user } = useAuth();
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const [type, setType] = useState<"create" | "edit">("create");

  const [allSelectedLeads, setAllSelectedLeads] = useState<Map<string, Contact>>(new Map());
  const [currentPageData, setCurrentPageData] = useState<Contact[]>([]);

  const fetchLeads = async (pageToFetch: number) => {
    if (!user?.id) return;

    try {
      const response = await axiosInstance.get(`v2/lead/all/`, {
        params: {
          page: pageToFetch,
          size,
          search_filter: searchFilter,
          campaign_id: selectedCampaignId,
        },
      });
      setCurrentPageData(response.data.items);
      setLeads(response.data.items);
      setTotalLeads(response.data.total);
      setTotalPages(Math.ceil(response.data.total / size));
      setIsTableLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch leads");
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(page);
  }, [page, selectedCampaignId, searchFilter]);

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await axiosInstance.get(
            `v2/lead/campaign/${params.campaignId}`
          );
          const data = response.data;
          if (data.detail === "No Contacts found") {
            setType("create");
          } else {
            if (existingLeads) {
              setLeads(data);
            }
            setSelectedCampaignId(id);
            setType("edit");
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);

  const handleCampaignSelect = (campaignId: string | null) => {
    setSelectedCampaignId(campaignId);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchFilter(value);
    setPage(1);
  }, []);

  const handleLeadSelection = (selectedRows: Contact[]) => {
    const newSelectedLeads = new Map(allSelectedLeads);
    const currentPageLeadIds = new Set(currentPageData.map(lead => lead.id));

    currentPageLeadIds.forEach(id => {
      if (!selectedRows.find(row => row.id === id)) {
        newSelectedLeads.delete(id);
      }
    });

    selectedRows.forEach(lead => {
      newSelectedLeads.set(lead.id, lead);
    });

    setAllSelectedLeads(newSelectedLeads);
    setSelectedLeads(Array.from(newSelectedLeads.values()));
  };

  function mapLeadsToBodies(leads: Contact[], campaignId: string): Contact[] {
    if (!user) return [];
    return leads.map((lead) => ({
      id: uuid(),
      user_id: user.id,
      campaign_id: campaignId,
      type: "prospective",
      first_name: lead.first_name,
      last_name: lead.last_name,
      name: lead.name,
      title: lead.title,
      linkedin_url: lead.linkedin_url,
      photo_url: lead.photo_url,
      twitter_url: lead.twitter_url,
      github_url: lead.github_url,
      facebook_url: lead.facebook_url,
      extrapolated_email_confidence: lead.extrapolated_email_confidence,
      headline: lead.headline,
      email: lead.email,
      employment_history: lead.employment_history,
      state: lead.state,
      city: lead.city,
      country: lead.country,
      is_likely_to_engage: lead.is_likely_to_engage,
      departments: lead.departments,
      subdepartments: lead.subdepartments,
      seniority: lead.seniority,
      functions: lead.functions,
      phone_numbers: lead.phone_numbers,
      intent_strength: lead.intent_strength,
      show_intent: lead.show_intent,
      revealed_for_current_team: lead.revealed_for_current_team,
      is_responded: false,
      company_linkedin_url: lead.company_linkedin_url,
      pain_points: lead.pain_points || [],
      value: lead.value || [],
      metrics: lead.metrics || [],
      compliments: lead.compliments || [],
      lead_information: lead.lead_information || String,
      is_b2b: lead.is_b2b,
      score: lead.score,
      qualification_details: lead.qualification_details || String,
      company: lead.company,
      phone: lead.phone,
      technologies: lead.technologies || [],
      organization: lead.organization,
      linkedin_posts: lead.linkedin_posts || [],
      linkedin_bio: lead.linkedin_bio || "",
      social_monitoring_data: lead.social_monitoring_data || "",
      personalized_social_info: lead.personalized_social_info || "",
      sequence_count: lead.sequence_count || 0,
    }));
  }

  const createAudience = async () => {
    if (allSelectedLeads.size === 0) {
      toast.error("Please select leads to create an audience");
      return;
    }

    // console.log(allSelectedLeads)

    setIsCreateBtnLoading(true);
    try {
      const audienceBody = mapLeadsToBodies(Array.from(allSelectedLeads.values()), params.campaignId);
      const response = await axiosInstance.post<Contact[]>(`v2/nurturing/leads`, audienceBody);
      const data = response.data;

      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        setLeads([data]);
      }

      toast.success("Audience created successfully");
      router.push(`/campaign/${params.campaignId}`);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.toString() : String(error));
      toast.error("Failed to create audience");
    } finally {
      setIsCreateBtnLoading(false);
    }
  };

  return (
    <main className="space-y-4">
      {isTableLoading ? (
        <LoadingCircle />
      ) : (
        <AudienceTableClient
          isContacts={true}
          checkboxes={true}
          onCampaignSelect={handleCampaignSelect}
          onSelectionChange={handleLeadSelection}
          selectedLeadIds={new Set(allSelectedLeads.keys())}
          currentPageData={currentPageData}
          totalLeads={totalLeads}
          onSearch={handleSearch}
        />
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isTableLoading}
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isTableLoading}
          >
            Next
          </Button>
        </div>
      </div>

      {isCreateBtnLoading ? (
        <LoadingCircle />
      ) : (
        <div className="flex items-center justify-between mt-4">
          <Button
            onClick={(event) => {
              event.preventDefault();
              createAudience();
            }}
            disabled={allSelectedLeads.size === 0}
          >
            {type === "create" ? "Create Audience" : "Update Audience"}
          </Button>
        </div>
      )}
    </main>
  );
};