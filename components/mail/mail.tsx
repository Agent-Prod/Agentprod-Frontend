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

const ITEMS_PER_PAGE = 7;

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
  const { campaigns } = useCampaignContext();
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
      setLoading(true);
      if (showLoadingOverlay) {
        loadingStartTimeRef.current = Date.now();
      }
      try {
        let url = `v2/mailbox/${user?.id}`;

        if (campaignId) {
          url = `v2/mailbox/campaign/${campaignId}/${user?.id}`;
        }
        url += `?limit=${ITEMS_PER_PAGE}&offset=${
          (pageNum - 1) * ITEMS_PER_PAGE
        }`;

        if (search) {
          url += `&search_filter=${search}`;
        }

        if (status && status !== "all") {
          url += `&_filter=${status.toUpperCase()}`;
        }

        console.log("Fetching conversations with URL:", url);

        const response = await axiosInstance.get<{ mails: Conversations[] }>(
          url
        );

        console.log("Response data:", response.data.mails);

        setMails((prevMails) => {
          if (pageNum === 1) {
            return response.data.mails;
          } else {
            return [...prevMails, ...response.data.mails];
          }
        });

        if (pageNum === 1) {
          setInitialMailIdSet(false);
        }

        setHasMore(response.data.mails.length === ITEMS_PER_PAGE);
        setPage(pageNum);
      } catch (err: any) {
        console.error("Error fetching mails:", err);
        setError(err.message || "Failed to load mails.");
        setMails([]);
      } finally {
        setLoading(false);
        setShowLoadingOverlay(false);
      }
    },
    [user?.id, showLoadingOverlay]
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

  React.useEffect(() => {
    if (!isUserInitiatedSearch) {
      fetchConversations(campaign?.campaignId, 1, searchTerm, filter);
    }
    setIsUserInitiatedSearch(false);
  }, [campaign, filter, fetchConversations, isUserInitiatedSearch]);

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

  const handleFilterChange = React.useCallback((newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  const handleCampaignChange = React.useCallback(
    (newCampaign: { campaignName: string; campaignId: string } | null) => {
      console.log("camp filtered");
      setCampaign(newCampaign);
      setPage(1);
      setMails([]);
    },
    []
  );

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleSearchClick = React.useCallback(() => {
    const searchWords = searchTerm
      .split(" ")
      .filter((word) => word.trim() !== "");

    console.log("Search words:", searchWords);

    setIsUserInitiatedSearch(true);
    setPage(1);

    // Construct the search filter query such that only the first word has `search_filter=`
    const searchFilter = searchWords
      .map((word, index) =>
        index === 0
          ? `${encodeURIComponent(word)}`
          : `&search_filter=${encodeURIComponent(word)}`
      )
      .join("");

    console.log("Search filter:", searchFilter);

    // Assuming fetchConversations accepts the searchFilter string as part of a query or body
    fetchConversations(campaign?.campaignId, 1, searchFilter, filter);
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
                  To do
                </TabsTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                    >
                      <span>
                        {moreOptionSelected.toLocaleUpperCase() || "More"}
                      </span>
                      <ChevronDown size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => handleTabChange("scheduled")}
                    >
                      Scheduled
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleTabChange("responded")}
                    >
                      Responded
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleTabChange("sent")}>
                      Sent
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleTabChange("lost")}>
                      Lost
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                    >
                      <span>
                        {campaign ? campaign.campaignName : "All Campaigns"}
                      </span>
                      <ChevronDown size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <ScrollArea className="h-[400px] w-full rounded-md">
                        <DropdownMenuItem
                          onClick={() => handleCampaignChange(null)}
                        >
                          <p className="cursor-pointer">All Campaigns</p>
                        </DropdownMenuItem>
                        {campaigns && campaigns.length > 0 ? (
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
                                {campaignItem.campaign_name}{" "}
                                {campaignItem.additional_details &&
                                  `- ${campaignItem.additional_details}`}
                              </p>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <p className="text-center mt-10">
                            No campaign available.
                          </p>
                        )}
                      </ScrollArea>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                {loading && page === 1 ? (
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
                ) : (
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
                )}
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
