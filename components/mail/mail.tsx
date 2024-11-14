/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as React from "react";
import { ChevronDown, Info, Search } from "lucide-react";
import MailList from "./mail-list";
import type { Mail } from "@/constants/data";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import ThreadDisplayMain from "./thread-display-main";
import { ScrollArea } from "../ui/scroll-area";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "@/context/user-context";
import { Button } from "../ui/button";
import { useCampaignContext } from "@/context/campaign-provider";
import { useMailbox } from "@/context/mailbox-provider";
import { Contact, useLeads } from "@/context/lead-user";
import { PeopleProfileSheet } from "../people-profile-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { LoadingOverlay } from "./LoadingOverlay";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import axios, { CancelTokenSource } from "axios";

const ITEMS_PER_PAGE = 10;

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  mails: Mail[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export interface Conversations {
  id: string;
  user_id: string;
  sender: string;
  recipient: string;
  subject: string;
  body_substr: string;
  campaign_id: string;
  updated_at: string;
  status: string;
  name: string;
  photo_url: string;
  company_name: string;
  category: string;
  channel?: string;
  campaign_name?: string;
}

interface CampaignStatus {
  id: number;
  campaign_id: string;
  in_progress: number;
  complete: number;
  duplicate: number;
  failed: number;
  total: number;
}

const MemoizedMailList = React.memo(MailList, (prevProps, nextProps) => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.selectedMailId === nextProps.selectedMailId &&
    prevProps.hasMore === nextProps.hasMore &&
    prevProps.loading === nextProps.loading
  );
});

const MemoizedThreadDisplayMain = React.memo(ThreadDisplayMain);

const CampaignDropdown = React.memo(({ 
  campaigns, 
  handleCampaignChange, 
  currentCampaign 
}: { 
  campaigns: any[], 
  handleCampaignChange: (campaign: { campaignName: string; campaignId: string } | null) => void,
  currentCampaign: { campaignName: string; campaignId: string } | null
}) => {
  const dropdownContent = React.useMemo(() => (
    <DropdownMenuContent className="w-80">
      <DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px] w-full rounded-md">
          <DropdownMenuItem onClick={() => handleCampaignChange(null)}>
            <p className="cursor-pointer">All Campaigns</p>
          </DropdownMenuItem>
          {Array.isArray(campaigns) && campaigns.length > 0 ? (
            campaigns.map((campaignItem) => (
              <DropdownMenuItem
                key={campaignItem.id}
                onClick={() =>
                  handleCampaignChange({
                    campaignName: campaignItem.campaign_name,
                    campaignId: campaignItem.id,
                  })
                }
              >
                <p className="cursor-pointer">
                  {campaignItem.campaign_name}
                  {campaignItem.additional_details &&
                    ` - ${campaignItem.additional_details}`}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-4">
              <p>No campaigns available.</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  ), [campaigns, handleCampaignChange]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center space-x-2"
        >
          <span>
            {currentCampaign ? currentCampaign.campaignName : "All Campaigns"}
          </span>
          <ChevronDown size={20} />
        </Button>
      </DropdownMenuTrigger>
      {dropdownContent}
    </DropdownMenu>
  );
});

CampaignDropdown.displayName = 'CampaignDropdown';

export function Mail({
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [mails, setMails] = React.useState<Conversations[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showLoadingOverlay, setShowLoadingOverlay] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("all");
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  // const { campaigns } = useCampaignContext();
  const [campaign, setCampaign] = React.useState<{
    campaignName: string;
    campaignId: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedMailId, setSelectedMailId] = React.useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [moreOptionSelected, setMoreOptionSelected] = React.useState("");
  const [initialMailIdSet, setInitialMailIdSet] = React.useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [campaignStatus, setCampaignStatus] =
    React.useState<CampaignStatus | null>(null);
  const [isRedirectedFromCampaign, setIsRedirectedFromCampaign] =
    React.useState(false);
  const [showStatus, setShowStatus] = React.useState(false);
  const [isUserInitiatedSearch, setIsUserInitiatedSearch] =
    React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  const { user } = useUserContext();
  const {
    setSenderEmail,
    isContextBarOpen,
    setConversationId,
    setRecipientEmail,
  } = useMailbox();
  const { leads, setLeads } = useLeads();

  const [localIsContextBarOpen, setLocalIsContextBarOpen] =
    React.useState(false);
  const loadingStartTimeRef = React.useRef<number | null>(null);
  const mailListRef = React.useRef<HTMLDivElement>(null);

  const cancelTokenRef = React.useRef<CancelTokenSource | null>(null);

  // Separate campaigns loading state
  const [isCampaignsLoading, setIsCampaignsLoading] = React.useState(false);

  const fetchCampaigns = React.useCallback(async () => {
    setIsCampaignsLoading(true);
    try {
      const response = await axiosInstance.get(`v2/campaigns/names/${user?.id}`);
      const campaignData = response.data.campaigns || response.data;
      if (Array.isArray(campaignData)) {
        setCampaigns(campaignData);
      } else {
        console.error('Campaigns data is not in expected format:', campaignData);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setIsCampaignsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (user?.id) {
      fetchCampaigns();
    }
  }, [fetchCampaigns]);

  const fetchCampaignStatus = React.useCallback(async (campaignId: string) => {
    setShowStatus(true);
    try {
      const response = await axiosInstance.get<CampaignStatus>(
        `/v2/contacts/status/${campaignId}`
      );
      console.log("Response,", response.data);
      setCampaignStatus(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching campaign status:", error);
      setShowStatus(false);
      return null;
    }
  }, []);

  React.useEffect(() => {
    setShowStatus(true);
    const newCampaignId = localStorage.getItem("newCampaignId");
    const isRedirectFromCampaign = localStorage.getItem("redirectFromCampaign");
    const campaignDraftStatus = localStorage.getItem("campaignDraftStatus");

    if (
      newCampaignId &&
      isRedirectFromCampaign === "true" &&
      campaignDraftStatus === "pending"
    ) {
      setIsRedirectedFromCampaign(true);

      let intervalId: NodeJS.Timeout;

      const checkAndFetchStatus = async () => {
        const status = await fetchCampaignStatus(newCampaignId);
        if (status && status.complete === status.total) {
          console.log("status completed");
          setShowStatus(false);
          toast.success("Draft Generation Completed");
          // clearInterval(intervalId); // uncomment this too
        }
      };

      // Initial fetch
      checkAndFetchStatus();

      // Set up interval
      // intervalId = setInterval(checkAndFetchStatus, 5000); <- uncomment this when you need API Polling.

      // Clear localStorage items
      localStorage.removeItem("newCampaignId");
      localStorage.removeItem("redirectFromCampaign");
      localStorage.removeItem("campaignDraftStatus");

      // Cleanup function
      return () => {
        // clearInterval(intervalId); // uncomment this too
        setIsRedirectedFromCampaign(false);
      };
    }
  }, [fetchCampaignStatus]);

  // ------------------

  React.useEffect(() => {
    setLocalIsContextBarOpen(isContextBarOpen);
  }, [isContextBarOpen]);

  const fetchConversations = React.useCallback(
    async (
      campaignId?: string,
      pageNum: number = 1,
      search?: string,
      status?: string
    ) => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Operation canceled due to new request.');
      }

      cancelTokenRef.current = axios.CancelToken.source();
      setLoading(true);
      if (pageNum === 1) {
        setIsInitialLoading(true);
        setIsTransitioning(true);
      }

      try {
        let url = `v2/mailbox/${user?.id}`;

        if (campaignId) {
          url = `v2/mailbox/campaign/${campaignId}/${user?.id}`;
        }

        // Set ITEMS_PER_PAGE to 100 if the status is "replied"
        const itemsPerPage = status === "replied" ? 100 : ITEMS_PER_PAGE;

        // Calculate the offset based on page number
        const offset = (pageNum - 1) * itemsPerPage;
        
        url += `?limit=${itemsPerPage}&offset=${offset}`;

        if (search) {
          const searchWords = search
            .split(" ")
            .filter((word) => word.trim() !== "");
          const searchParams = searchWords
            .map((word) => `search_filter=${encodeURIComponent(word)}`)
            .join("&");
          url += `&${searchParams}`;
        }

        if (status && status !== "all") {
          url += `&_filter=${status.toUpperCase()}`;
        }

        console.log("Fetching conversations with URL:", url);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`,
          {
            cancelToken: cancelTokenRef.current.token
          }
        );

        // Add null check for response data
        if (!response.data || !response.data.mails) {
          setHasMore(false); // Stop further API calls
          setLoading(false);
          if (pageNum === 1) {
            setIsInitialLoading(false);
            setIsTransitioning(false);
          }
          return;
        }

        const totalCount = response.data.total_count || 0;

        const campaignChannelMap = campaigns.reduce((map: {[key: string]: string}, campaign: any) => {
          map[campaign.id] = campaign.channel;
          return map;
        }, {});

        const mailsWithChannel = response.data.mails.map((mail: any) => ({
          ...mail,
          channel: campaignChannelMap[mail.campaign_id] || null
        }));

        setMails((prevMails) => {
          if (pageNum === 1) {
            return mailsWithChannel;
          } else {
            return [...prevMails, ...mailsWithChannel];
          }
        });

        // Only set hasMore to true if we received data and there's more to load
        const hasMoreItems = mailsWithChannel.length > 0 && offset + itemsPerPage < totalCount;
        setHasMore(hasMoreItems);
        
        setPage(pageNum);
        setLoading(false);
        if (pageNum === 1) {
          setIsInitialLoading(false);
          setIsTransitioning(false);
        }

      } catch (err: any) {
        if (axios.isCancel(err)) {
          console.log('Request cancelled, keeping loader');
        } else {
          console.error("Error fetching mails:", err);
          setHasMore(false); // Stop further API calls on error
          // Don't set error state to avoid showing error on screen
          if (pageNum === 1) {
            setMails([]); // Only clear mails if it's the first page
          }
        }
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
        setIsTransitioning(false);
        setShowLoadingOverlay(false);
      }
    },
    [user?.id]
  );

  const loadMore = React.useCallback(() => {
    if (!loading && hasMore) {
      fetchConversations(campaign?.campaignId, page + 1, searchTerm, filter);
      if (page === 1 && mailListRef.current) {
        mailListRef.current.style.overflowY = "auto";
      }
    }
  }, [
    loading,
    hasMore,
    campaign,
    page,
    searchTerm,
    filter,
    fetchConversations,
  ]);

  React.useEffect(() => {
    const newCampaignId = localStorage.getItem("newCampaignId");
    const isRedirectFromCampaign = localStorage.getItem("redirectFromCampaign");

    if (
      newCampaignId &&
      campaigns.length > 0 &&
      isRedirectFromCampaign === "true"
    ) {
      setShowLoadingOverlay(true);
      loadingStartTimeRef.current = Date.now();
      const newCampaign = campaigns.find((c) => c.id === newCampaignId);
      if (newCampaign) {
        setCampaign({
          campaignName: newCampaign.campaign_name,
          campaignId: newCampaign.id,
        });
      }
    }

    localStorage.removeItem("newCampaignId");
    localStorage.removeItem("redirectFromCampaign");
  }, [campaigns]);

  // Add a ref to track initial mount
  const isInitialMount = React.useRef(true);

  // Update the useEffect that triggers mail fetching
  React.useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only fetch if this is a campaign change or filter change
    if (!isUserInitiatedSearch && !isCampaignsLoading) {
      fetchConversations(campaign?.campaignId, 1, searchTerm, filter);
    }
    setIsUserInitiatedSearch(false);
  }, [campaign?.campaignId, filter]); // Minimize dependencies, only include what should trigger a refetch

  // Update the initial data fetch
  React.useEffect(() => {
    if (user?.id) {
      fetchConversations(campaign?.campaignId, 1, searchTerm, filter);
    }
  }, []); // Empty dependency array for initial fetch only

  React.useEffect(() => {
    if (mails.length > 0 && !initialMailIdSet) {
      const initialMail = mails[0];
      setSelectedMailId(initialMail.id);
      setSenderEmail(initialMail.sender);
      setConversationId(initialMail.id);
      setRecipientEmail(initialMail.recipient);
      setInitialMailIdSet(true);

      axiosInstance
        .get(`v2/lead/info/${initialMail.recipient}`)
        .then((response) => {
          setLeads([response.data]);
        })
        .catch((error) => {
          console.error("Error fetching lead data:", error);
        });
    }
  }, [
    mails,
    initialMailIdSet,
    setSenderEmail,
    setConversationId,
    setRecipientEmail,
    setLeads,
  ]);

  const updateMailStatus = React.useCallback(
    (mailId: string, status: string) => {
      setMails((prevMails) =>
        prevMails.map((mail) =>
          mail.id === mailId ? { ...mail, status } : mail
        )
      );
      if (mailId === selectedMailId) {
        setSelectedMailId(mailId);
      }
    },
    [selectedMailId]
  );

  const currentMail = React.useMemo(
    () => mails.find((mail) => mail.id === selectedMailId) || mails[0] || null,
    [mails, selectedMailId]
  );

  // Update handleCampaignChange to explicitly trigger fetch
  const handleCampaignChange = React.useCallback(
    (newCampaign: { campaignName: string; campaignId: string } | null) => {
      setCampaign(newCampaign);
      setPage(1);
      setMails([]);
      fetchConversations(newCampaign?.campaignId, 1, searchTerm, filter);
    },
    [searchTerm, filter, fetchConversations]
  );

  // Update handleFilterChange to explicitly trigger fetch
  const handleFilterChange = React.useCallback((newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
    fetchConversations(campaign?.campaignId, 1, searchTerm, newFilter);
  }, [campaign?.campaignId, searchTerm, fetchConversations]);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleSearchClick = React.useCallback(() => {
    const trimmedSearchTerm = searchTerm.trim();
    console.log("Search term:", trimmedSearchTerm);

    setIsUserInitiatedSearch(true);
    setPage(1);

    // Pass the search term as a string to fetchConversations
    fetchConversations(campaign?.campaignId, 1, trimmedSearchTerm, filter);
  }, [searchTerm, campaign, filter, fetchConversations]);

  const handleTabChange = (value: string) => {
    console.log("Tab", value);
    setActiveTab(value);
    handleFilterChange(value);
    if (value !== "all" && value !== "to-approve") {
      setMoreOptionSelected(value);
    } else {
      setMoreOptionSelected("");
    }
    // Reset page and mails when changing tabs
    setPage(1);
    setMails([]);
  };

  const handleDeleteMail = React.useCallback(
    async (id: string) => {
      try {
        await axiosInstance.delete(`/v2/email/conversations/${id}`);
        toast.success("Mail Deleted");

        setMails((prevMails) => prevMails.filter((mail) => mail.id !== id));

        if (id === selectedMailId) {
          const newMails = mails.filter((mail) => mail.id !== id);
          if (newMails.length > 0) {
            const newSelectedMail = newMails[0];
            setSelectedMailId(newSelectedMail.id);
            setSenderEmail(newSelectedMail.sender);
            setConversationId(newSelectedMail.id);
            setRecipientEmail(newSelectedMail.recipient);
          } else {
            setSelectedMailId(null);
            setSenderEmail("");
            setConversationId("");
            setRecipientEmail("");
          }
        }
      } catch (error) {
        console.error("Failed to delete mail:", error);
        toast.error("Failed to delete mail");
      }
    },
    [
      mails,
      selectedMailId,
      setSenderEmail,
      setConversationId,
      setRecipientEmail,
    ]
  );

  return (
    <TooltipProvider delayDuration={0}>
      {showLoadingOverlay && <LoadingOverlay />}
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
        }}
        className="h-full items-stretch"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <ResizablePanel defaultSize={localIsContextBarOpen ? 40 : 20}>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <div className="flex items-center px-4 pt-2 pb-0">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto flex relative">
                <TabsTrigger
                  value="all"
                  className="text-zinc-800 dark:text-zinc-200"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="to-approve"
                  className="text-zinc-800 dark:text-zinc-200"
                >
                  To Approve
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="text-zinc-800 dark:text-zinc-200"
                >
                  Sent
                </TabsTrigger>
                <TabsTrigger
                  value="replied"
                  className="text-zinc-800 dark:text-zinc-200"
                >
                  Replied
                </TabsTrigger>
                <CampaignDropdown 
                  campaigns={campaigns} 
                  handleCampaignChange={handleCampaignChange}
                  currentCampaign={campaign}
                />
              </TabsList>
            </div>

            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="relative flex items-center">
                <Input
                  placeholder="Search"
                  className="pr-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-0 top-0 h-full cursor-pointer "
                  onClick={handleSearchClick}
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* {isRedirectedFromCampaign && campaignStatus && showStatus && (
              <div className="flex justify-end mr-8">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-xs flex hover:text-gray-300 transition-colors ">
                      Draft Generated <Info className="h-2 w-2" />
                      {campaignStatus &&
                        "-" +
                          campaignStatus?.complete +
                          "/" +
                          campaignStatus?.total}
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end">
                      <p>
                        In progress:{" "}
                        {campaignStatus && campaignStatus?.in_progress}
                      </p>
                      <p>Failed: {campaignStatus && campaignStatus?.failed} </p>
                      <p>
                        Duplicate: {campaignStatus && campaignStatus?.duplicate}
                      </p>
                      <p>
                        Complete: {campaignStatus && campaignStatus?.complete}
                      </p>
                      <p>Total: {campaignStatus && campaignStatus?.total} </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )} */}

            <TabsContent
              value={activeTab}
              className="flex-grow overflow-hidden m-0"
            >
              <div ref={mailListRef} className="h-full flex flex-col">
                {(isInitialLoading && page === 1 && !isCampaignsLoading) || isTransitioning ? (
                  <div className="flex flex-col space-y-3 p-4 pt-0">
                    {[...Array(6)].map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-[90px] w-full rounded-xl"
                      />
                    ))}
                  </div>
                ) : mails.length > 0 ? (
                  <MemoizedMailList
                    items={mails}
                    selectedMailId={selectedMailId}
                    setSelectedMailId={setSelectedMailId}
                    hasMore={hasMore}
                    loading={loading}
                    loadMore={loadMore}
                    onDeleteMail={handleDeleteMail}
                  />
                ) : !loading && !isTransitioning ? (
                  <div className="flex flex-col gap-3 items-center justify-center mt-36">
                    <Image
                      src="/empty.svg"
                      alt="empty-inbox"
                      width="200"
                      height="200"
                      className="dark:filter dark:invert"
                    />
                    <p className="text-gray-500 mt-4">No Mails Available</p>
                  </div>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={localIsContextBarOpen ? 40 : 20}
          minSize={20}
        >
          <ScrollArea className="h-full">
            {loading && page === 1 ? (
              <div className="m-4 flex flex-row ">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex flex-col space-y-3 ml-5">
                  <Skeleton className="h-[25px] w-[30rem] rounded-lg" />
                  <Skeleton className="h-[325px] w-[30rem] rounded-xl" />
                </div>
              </div>
            ) : currentMail ? (
              <MemoizedThreadDisplayMain
                key={`thread-${selectedMailId}-${currentMail.updated_at}`}
                ownerEmail={currentMail.recipient}
                updateMailStatus={updateMailStatus}
                selectedMailId={selectedMailId}
                setSelectedMailId={setSelectedMailId}
                mailStatus={currentMail.status}
                name={currentMail.name}
                campaign_name={currentMail?.campaign_name || ""}
              />
            ) : (
              <div className="flex flex-col gap-3 items-center justify-center mt-[17.2rem]">
                <Image
                  src="/emptydraft.svg"
                  alt="empty-inbox"
                  width="200"
                  height="200"
                  className="dark:filter dark:invert"
                />
                <p className="flex justify-center items-center mt-10 ml-6  text-gray-500">
                  No Draft Available
                </p>
              </div>
            )}
          </ScrollArea>
        </ResizablePanel>
        {localIsContextBarOpen && leads.length > 0 && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20}>
              <PeopleProfileSheet data={leads[0] as Contact} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

export default Mail;