/* eslint-disable no-console */
"use client";

import React from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import axiosInstance from '@/utils/axiosInstance';
import { Button } from '../ui/button';
import { useMailbox } from '@/context/mailbox-provider';
import { Contact, useLeads } from '@/context/lead-user';
import { PeopleProfileSheet } from '../people-profile-sheet';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { LoadingOverlay } from './LoadingOverlay';
import type { Mail } from "@/constants/data";
import { toast } from 'sonner';
import axios, { CancelTokenSource } from 'axios';
import MailList from "./mail-list";
import ThreadDisplayMain from "./thread-display-main";
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { useSubscription } from '@/context/subscription-provider';

const ITEMS_PER_PAGE = 10;

interface MailProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  mails: Mail[];
}

interface CampaignDropdownProps {
  campaigns: CampaignData[];
  handleCampaignChange: (campaign: { campaignName: string; campaignId: string } | null) => void;
  currentCampaign: { campaignName: string; campaignId: string } | null;
}

interface CampaignData {
  id: string;
  campaign_name: string;
  channel?: string;
  additional_details?: string;
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
  linkedin_sender: string;
  name: string;
  photo_url: string | null;
  organization?: {
    logo_url: string | null;
  } | null;
  company_name: string;
  category: string;
  channel?: string;
  campaign_name: string | null;
  contact_id: string | null;
  sequence_count: number;
  linkedin_exists: boolean;
  connection_status: string;
}

const CampaignDropdown = React.memo(
  ({
    campaigns,
    handleCampaignChange,
    currentCampaign,
  }: {
    campaigns: any[];
    handleCampaignChange: (
      campaign: { campaignName: string; campaignId: string } | null
    ) => void;
    currentCampaign: { campaignName: string; campaignId: string } | null;
  }) => {
    const dropdownContent = React.useMemo(
      () => (
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
                        campaignName: campaignItem.campaign_name || 'Untitled Campaign',
                        campaignId: campaignItem.id,
                      })
                    }
                  >
                    <p className="cursor-pointer">
                      {campaignItem.campaign_name || 'Untitled Campaign'}
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
      ),
      [campaigns, handleCampaignChange]
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-[150px] flex items-center justify-between space-x-2"
          >
            <span className="truncate">
              {currentCampaign
                ? `${currentCampaign.campaignName}`
                : 'All Campaigns'}
            </span>
            <ChevronDown size={16} className="flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        {dropdownContent}
      </DropdownMenu>
    );
  }
);

CampaignDropdown.displayName = 'CampaignDropdown';

const MemoizedMailList = React.memo(MailList, (prevProps, nextProps) => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.selectedMailId === nextProps.selectedMailId &&
    prevProps.hasMore === nextProps.hasMore &&
    prevProps.loading === nextProps.loading
  );
});

const MemoizedThreadDisplayMain = React.memo(ThreadDisplayMain, (prevProps, nextProps) => {

  if (prevProps.selectedMailId !== nextProps.selectedMailId) {
    return false;
  }

  return (
    prevProps.ownerEmail === nextProps.ownerEmail &&
    prevProps.mailStatus === nextProps.mailStatus &&
    prevProps.name === nextProps.name &&
    prevProps.campaign_name === nextProps.campaign_name &&
    prevProps.campaign_id === nextProps.campaign_id &&
    prevProps.contact_id === nextProps.contact_id &&
    prevProps.linkedinSender === nextProps.linkedinSender
  );
});

interface ActiveFiltersProps {
  filter: string;
  campaign: { campaignName: string } | null;
  onClearCampaign: () => void;
  onClearFilter: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filter, campaign, onClearCampaign, onClearFilter }) => {
  if ((!filter && !campaign) || (filter === 'all' && !campaign)) return null;

  return (
    <div className="flex flex-wrap px-4 pb-2 h-[40px]">
      {filter && filter !== 'all' && (
        <div className="flex items-center gap-1 bg-muted/60 px-2 py-1 rounded-md text-sm">
          <span>Filter: {filter}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 hover:bg-muted"
            onClick={() => onClearFilter()}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      {campaign && (
        <div className="flex items-center gap-1 bg-muted/60 mx-2 px-2 py-1 rounded-md text-sm">
          <span>Campaign: {campaign.campaignName}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 hover:bg-muted"
            onClick={() => onClearCampaign()}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export function Mail({
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get query parameters
  const campaignIdFromUrl = searchParams.get('campaign_id');
  const filterFromUrl = searchParams.get('_filter')?.toLowerCase() || 'all';
  const searchFilterFromUrl = searchParams.get('search_filter') || '';

  const [filterState, setFilterState] = React.useState({
    filter: filterFromUrl,
    activeTab: filterFromUrl,
    searchTerm: searchFilterFromUrl
  });

  const [mails, setMails] = React.useState<Conversations[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = React.useState(false);
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [campaign, setCampaign] = React.useState<{
    campaignName: string;
    campaignId: string;
  } | null>(campaignIdFromUrl ? {
    campaignName: '',
    campaignId: campaignIdFromUrl
  } : null);
  const [selectedMailId, setSelectedMailId] = React.useState<string | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [initialMailIdSet, setInitialMailIdSet] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const { isSubscribed } = useSubscription();
  const { user } = useAuth();
  const {
    setSenderEmail,
    isContextBarOpen,
    setConversationId,
    setRecipientEmail,
  } = useMailbox();
  const { leads, setLeads } = useLeads();

  const [localIsContextBarOpen, setLocalIsContextBarOpen] =
    React.useState(false);
  const mailListRef = React.useRef<HTMLDivElement>(null);

  const cancelTokenRef = React.useRef<CancelTokenSource | null>(null);

  const [isCampaignsLoading, setIsCampaignsLoading] = React.useState(false);

  const [totalCount, setTotalCount] = React.useState(0);

  const fetchCampaigns = React.useCallback(async () => {
    setIsCampaignsLoading(true);
    try {
      const response = await axiosInstance.get(`v2/campaigns/names/`);
      const campaignData = response.data.campaigns || response.data;
      if (Array.isArray(campaignData)) {
        const formattedCampaigns = campaignData.map(campaign => ({
          id: campaign.id,
          campaign_name: campaign.campaign_name,
          channel: campaign.channel,
          additional_details: campaign.additional_details
        }));
        setCampaigns(formattedCampaigns);

        // If there's a campaign ID in URL, set the campaign name
        if (campaignIdFromUrl) {
          const matchingCampaign = formattedCampaigns.find(c => c.id === campaignIdFromUrl);
          if (matchingCampaign) {
            setCampaign({
              campaignName: matchingCampaign.campaign_name,
              campaignId: campaignIdFromUrl
            });
          }
        }
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
  }, [user?.id, campaignIdFromUrl]);

  React.useEffect(() => {
    if (user?.id) {
      fetchCampaigns();
    }
  }, [fetchCampaigns]);

  React.useEffect(() => {
    setLocalIsContextBarOpen(isContextBarOpen);
  }, [isContextBarOpen]);

  // 2. Modify the fetch conversations effect
  const fetchConversations = React.useCallback(
    async (
      campaignId?: string,
      pageNum: number = 1,
      search?: string,
      status?: string,
      signal?: AbortSignal
    ) => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Operation canceled due to new request.');
      }

      setLoading(true);
      if (pageNum === 1) {
        setIsInitialLoading(true);
        setIsTransitioning(true);
      }

      try {
        let url = `v2/mailbox/`;

        if (campaignId) {
          url = `v2/mailbox/campaign/${campaignId}/`;
        }

        // Set ITEMS_PER_PAGE to 100 if the status is "replied"
        const itemsPerPage = status === 'replied' ? 100 : ITEMS_PER_PAGE;

        // Calculate the offset based on page number
        const offset = (pageNum - 1) * itemsPerPage;

        url += `?limit=${itemsPerPage}&offset=${offset}`;

        if (search) {
          const searchWords = search
            .split(' ')
            .filter((word) => word.trim() !== '');
          const searchParams = searchWords
            .map((word) => `search_filter=${encodeURIComponent(word)}`)
            .join('&');
          url += `&${searchParams}`;
        }

        if (status && status !== 'all') {
          url += `&_filter=${status.toUpperCase()}`;
        }

        console.log('Fetching conversations with URL:', url);

        const response = await axiosInstance.get(
          url,
          {
            signal
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
        setTotalCount(totalCount);

        const campaignChannelMap = campaigns.reduce(
          (map: { [key: string]: string }, campaign: any) => {
            map[campaign.id] = campaign.channel;
            return map;
          },
          {}
        );

        const mailsWithChannel = response.data.mails.map((mail: any) => {
          const campaignInfo = campaigns.find(c => c.id === mail.campaign_id);
          return {
            ...mail,
            channel: campaignChannelMap[mail.campaign_id] || null,
            // campaign_name: campaignInfo?.campaign_name,
            name: mail.name || mail.recipient_name,
            company_name: mail.company_name,
            contact_id: mail.contact_id
          };
        });

        setMails((prevMails) => {
          if (pageNum === 1) {
            return mailsWithChannel;
          } else {
            return [...prevMails, ...mailsWithChannel];
          }
        });

        // Only set hasMore to true if we received data and there's more to load
        const hasMoreItems =
          mailsWithChannel.length > 0 &&
          offset + itemsPerPage < totalCount;
        setHasMore(hasMoreItems);

        setPage(pageNum);
        setLoading(false);
        if (pageNum === 1) {
          setIsInitialLoading(false);
          setIsTransitioning(false);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        if (axios.isCancel(err)) {
          console.log('Request cancelled, keeping loader');
        } else {
          console.error('Error fetching mails:', err);
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
    [user?.id, campaigns]
  );

  const loadMore = React.useCallback(() => {
    if (!loading && hasMore) {
      fetchConversations(campaign?.campaignId, page + 1, filterState.searchTerm, filterState.filter);
      if (page === 1 && mailListRef.current) {
        mailListRef.current.style.overflowY = 'auto';
      }
    }
  }, [
    loading,
    hasMore,
    campaign,
    page,
    filterState.searchTerm,
    filterState.filter,
    fetchConversations,
  ]);

  // Update the fetch conversations effect to handle initial selection after filter changes
  React.useEffect(() => {
    if (user?.id) {
      const controller = new AbortController();
      setInitialMailIdSet(false);

      fetchConversations(
        campaignIdFromUrl || undefined,
        1,
        filterState.searchTerm,
        filterState.filter,
        controller.signal
      );

      return () => controller.abort();
    }
  }, [user?.id, campaignIdFromUrl, filterState.filter, filterState.searchTerm]);


  React.useEffect(() => {
    if (mails.length > 0) {
      const initialMail = mails[0];
      const batchUpdate = () => {
        setConversationId(initialMail.id);
        setSelectedMailId(initialMail.id);
        setSenderEmail(initialMail.sender);
        setRecipientEmail(initialMail.recipient);
        setInitialMailIdSet(true);
      };
      if (!selectedMailId || !initialMailIdSet) {
        batchUpdate();
      }
    }
  }, [
    mails,
    initialMailIdSet,
    selectedMailId,
    setSenderEmail,
    setConversationId,
    setRecipientEmail,
    setSelectedMailId
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
    () => mails.find((mail) => mail.id === selectedMailId),
    [mails, selectedMailId]
  );

  const handleCampaignChange = React.useCallback(
    (newCampaign: { campaignName: string; campaignId: string } | null) => {
      setCampaign(newCampaign);
      setPage(1);
      setMails([]);

      // Update URL with new campaign ID
      const params = new URLSearchParams(searchParams.toString());
      if (newCampaign) {
        params.set('campaign_id', newCampaign.campaignId);
      } else {
        params.delete('campaign_id');
      }
      router.push(`/mail?${params.toString()}`);

      fetchConversations(newCampaign?.campaignId, 1, filterState.searchTerm, filterState.filter);
    },
    [filterState.searchTerm, filterState.filter, fetchConversations, router, searchParams]
  );

  const handleFilterChange = React.useCallback(
    (newFilter: string) => {
      setFilterState(prev => ({
        ...prev,
        filter: newFilter,
        activeTab: newFilter
      }));
      setPage(1);
      setMails([]);
      setSelectedMailId(null);
      setInitialMailIdSet(false);
      fetchConversations(campaign?.campaignId, 1, filterState.searchTerm, newFilter);
    },
    [campaign?.campaignId, filterState.searchTerm, fetchConversations]
  );

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterState(prev => ({
        ...prev,
        searchTerm: e.target.value
      }));
    },
    []
  );

  const handleSearchClick = React.useCallback(() => {
    const trimmedSearchTerm = filterState.searchTerm.trim();
    setPage(1);
    setMails([]);

    // Update URL with search filter
    const params = new URLSearchParams(searchParams.toString());
    if (trimmedSearchTerm) {
      params.set('search_filter', trimmedSearchTerm);
    } else {
      params.delete('search_filter');
    }
    router.push(`/mail?${params.toString()}`);

    fetchConversations(campaign?.campaignId, 1, trimmedSearchTerm, filterState.filter);
  }, [filterState.searchTerm, campaign, filterState.filter, fetchConversations, router, searchParams]);

  const handleTabChange = (value: string) => {
    setFilterState(prev => ({
      ...prev,
      filter: value,
      activeTab: value
    }));
    setPage(1);
    setMails([]);

    // Update URL with new filter
    const params = new URLSearchParams(searchParams.toString());
    params.set('_filter', value.toUpperCase());
    router.push(`/mail?${params.toString()}`);
  };

  const handleDeleteMail = React.useCallback(
    async (id: string) => {
      try {
        await axiosInstance.delete(`/v2/email/conversations/${id}`);
        toast.success('Mail Deleted');

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
            setSenderEmail('');
            setConversationId('');
            setRecipientEmail('');
          }
        }
      } catch (error) {
        console.error('Failed to delete mail:', error);
        toast.error('Failed to delete mail');
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
    <>
      {!isSubscribed && (
        <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm font-medium text-center">
            You're on a free trial! Enjoy 100 LinkedIn outreach leads for the next 10 days. Need more? Contact us at{' '}
            <a
              href="mailto:founders@agentprod.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              founders@agentprod.com
            </a>
            {' '}to scale your outreach!
          </p>
        </div>
      )}
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
          style={{ height: 'calc(100vh - 80px)' }}
        >
          <ResizablePanel defaultSize={localIsContextBarOpen ? 40 : 20}>
            <Tabs
              defaultValue="all"
              value={filterState.activeTab}
              onValueChange={handleTabChange}
            >
              <div className="flex items-center px-4 pt-2 pb-0">
                <h1 className="text-xl font-bold">Inbox ({totalCount})</h1>
                <TabsList className="ml-auto flex relative bg-muted/50 p-1 rounded-lg">
                  <TabsTrigger
                    value="all"
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="to-approve"
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    To Approve
                  </TabsTrigger>
                  <TabsTrigger
                    value="replied"
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Replied
                  </TabsTrigger>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-sm font-medium hover:bg-muted/80"
                      >
                        <span>More</span>
                        <ChevronDown size={16} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuItem
                        onSelect={() => handleTabChange("OPENED")}
                      >
                        Opened
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleTabChange("SENT")}
                      >
                        Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("CLICKED")}>
                        Clicked
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("BOUNCED")}>
                        Bounced
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("SPAM")}>
                        Spam
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("DELIVERED")}>
                        Delivered
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("LINKEDIN_CONNECTED")}>
                        Linkedin Connected
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("LINKEDIN_SENT")}>
                        Linkedin Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("LINKEDIN_WITHDRAWN")}>
                        Linkedin Withdrawn
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("LINKEDIN_FAILED")}>
                        Linkedin Failed
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabChange("LINKEDIN_PENDING")}>
                        LINKEDIN PENDING
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>

                  <CampaignDropdown
                    campaigns={campaigns}
                    handleCampaignChange={handleCampaignChange}
                    currentCampaign={campaign}
                  />
                </TabsList>
              </div>

              <div className="bg-background/95 px-4 pt-4 pb-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form className="relative" onSubmit={(e) => { e.preventDefault(); handleSearchClick(); }}>
                  <Input
                    placeholder="Search conversations..."
                    className="w-full pl-4 pr-10 h-9 bg-muted/50 border-none"
                    value={filterState.searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </form>
              </div>

              <ActiveFilters
                filter={filterState.filter}
                campaign={campaign}
                onClearCampaign={() => handleCampaignChange(null)}
                onClearFilter={() => handleTabChange('all')}
              />

              <TabsContent
                value={filterState.activeTab}
                className="flex-grow overflow-hidden m-0 h-[calc(100%-130px)]"
              >
                <div
                  ref={mailListRef}
                  className="h-full overflow-auto"
                >
                  {(isInitialLoading && page === 1 && !isCampaignsLoading) ||
                    isTransitioning ? (
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
                  key={currentMail.id}
                  ownerEmail={currentMail.recipient}
                  updateMailStatus={updateMailStatus}
                  selectedMailId={selectedMailId}
                  setSelectedMailId={setSelectedMailId}
                  mailStatus={currentMail.status}
                  name={currentMail.name}
                  campaign_name={currentMail?.campaign_name || ''}
                  campaign_id={currentMail?.campaign_id || ''}
                  contact_id={currentMail?.contact_id || ''}
                  linkedinSender={currentMail?.linkedin_sender || ''}
                  linkedin_exists={currentMail?.linkedin_exists || false}
                  connection_status={currentMail?.connection_status || ''}
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
    </>
  );
}

export default Mail;
