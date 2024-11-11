/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React from "react";
import { BsStars } from "react-icons/bs";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "../../utils/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLeadSheetSidebar } from "@/context/lead-sheet-sidebar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  BadgeX,
  Bell,
  CalendarCheck,
  Check,
  ChevronsUpDown,
  Edit3,
  Forward,
  Linkedin,
  ListTodo,
  MailPlus,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  TimerReset,
  Trash2,
  TrendingUp,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useMailbox, Mailbox, EmailMessage } from "@/context/mailbox-provider";
import { Lead, useLeads, Contact } from "@/context/lead-user";
import { toast } from "sonner";
import { PeopleProfileSheet } from "../people-profile-sheet";
import Notification from "./Notification";
import { CampaignEntry, useCampaignContext } from "@/context/campaign-provider";
import { User } from "lucide-react";
import { LoadingCircle } from "@/app/icons";
import { useUserContext } from "@/context/user-context";
import { Badge } from "../ui/badge";
import { last, previous } from "slate";
import { parseActionDraft } from "./parse-draft";
import Image from "next/image";
import { sanitizeSubject } from "./sanitizeSubject";
import SuggestionDisplay from "./suggestionsDisplay";

interface ThreadDisplayMainProps {
  ownerEmail: string;
  updateMailStatus: (mailId: string, status: string) => void;
  selectedMailId: string | null;
  setSelectedMailId: (id: string | null) => void;
  mailStatus: string;
  name: string;
}

const frameworks = [
  {
    value: "manualmode",
    label: "Manual mode",
  },
  {
    value: "autopilotmode",
    label: "Autopilot mode",
  },
];

const ThreadDisplayMain: React.FC<ThreadDisplayMainProps> = ({
  ownerEmail,
  updateMailStatus,
  selectedMailId,
  setSelectedMailId,
  mailStatus,
  name,
}) => {
  const {
    conversationId,
    thread,
    setThread,
    recipientEmail,
    senderEmail,
    setIsContextBarOpen,
    setConversationId,
  } = useMailbox();

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const { toggleSidebar, setItemId } = useLeadSheetSidebar();
  const { leads, setLeads } = useLeads();
  const { user } = useUserContext();

  // const { campaigns } = useCampaignContext();

  const [drafts, setDrafts] = React.useState<any[]>([]);

  const initials = (name: string) => {
    const names = name.split(" ");
    if (names) {
      return names
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    } else {
      return "NA";
    }
  };

  console.log("HEH", conversationId);

  const leadId = leads[0]?.campaign_id;

  // React.useEffect(() => {
  //   const fetchCampaigns = () => {
  //     if (user && user.id) {
  //       setIsLoading(true);
  //       axiosInstance
  //         .get<CampaignEntry[]>(`v2/campaigns/all/${user.id}`)
  //         .then((response) => {
  //           console.log("Campaign From Inbox", response);
  //           // Sort campaigns based on created_at field
  //           const sortedCampaigns = response.data.sort((a: any, b: any) => {
  //             const dateA = new Date(a.created_at).getTime();
  //             const dateB = new Date(b.created_at).getTime();
  //             return dateB - dateA; // Sort in descending order (newest first)
  //           });

  //           setCampaigns(sortedCampaigns);
  //           setIsLoading(false);
  //         })
  //         .catch((error) => {
  //           console.error("Error fetching campaigns:", error);
  //           setError(error.message || "Failed to load campaigns.");
  //           setIsLoading(false);
  //         });
  //     }
  //   };

  //   fetchCampaigns();
  // }, [user?.id]);

  React.useEffect(() => {
    // For handleing, the thread if some error occurs
    setError(""); // Reset error state when conversationId changes
    setIsLoading(true); // Set loading state when conversationId changes
    // For handleing, the thread if some error occurs
    axiosInstance
      .get<EmailMessage[]>(`v2/mailbox/conversation/${conversationId}`)
      .then((response) => {
        setThread(response.data);
        console.log("Thread Data", response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching conversation:", error);
        setError(error.message || "Failed to load conversation.");
        setIsLoading(false);
      });
  }, [conversationId, thread?.length]);

  const isLinkedInUrl = (recipient: string): boolean => {
    return recipient.toLowerCase().includes('linkedin.com');
  };

  const handleAvatarClick = async () => {
    try {
      const isLinkedIn = isLinkedInUrl(recipientEmail);

      if (isLinkedIn) {
        console.log('Using LinkedIn URL endpoint:', recipientEmail);
        const response = await axiosInstance.get<Lead>(
          `v2/lead/linkedin/info?linkedin_url=${encodeURIComponent(recipientEmail)}`
        );
        setItemId(response.data.id);
        setLeads([response.data]);
      } else {
        console.log('Using email endpoint for:', recipientEmail);
        const response = await axiosInstance.get<Lead>(`v2/lead/info/${recipientEmail}`);
        setItemId(response.data.id);
        setLeads([response.data]);
      }
      toggleSidebar(true);
    } catch (error) {
      console.error("Error fetching lead info:", error);
      toast.error("Failed to load lead information");
    }
  };

  const EmailComponent = ({ email }: { email: EmailMessage }) => {
    // const isEmailFromOwner = email.sender === ownerEmail;
    // console.log("jajaja", email);
    console.log("Platform", email);

    const [title, setTitle] = React.useState("");
    const [body, setBody] = React.useState("");
    const [editable, setEditable] = React.useState(false);
    const [isLoadingButton, SetIsLoadingButton] = React.useState(false);
    const [loadingSmartSchedule, setLoadingSmartSchedule] =
      React.useState(false);

    const { user } = useUserContext();

    const formatDate = (dateString: string) => {
      if (!dateString) return "";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const now = new Date();

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const time = new Intl.DateTimeFormat("en-US", timeOptions).format(date);

      const dateOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
      };

      if (date.getFullYear() !== now.getFullYear()) {
        dateOptions.year = "numeric";
      }

      const formattedDate = new Intl.DateTimeFormat(
        "en-GB",
        dateOptions
      ).format(date);

      const isToday = date.toDateString() === now.toDateString();
      const isTomorrow =
        date.toDateString() ===
        new Date(now.setDate(now.getDate() + 1)).toDateString();
      const isYesterday =
        date.toDateString() ===
        new Date(now.setDate(now.getDate() - 2)).toDateString();

      if (isToday) {
        return `${time}, Today`;
      } else if (isTomorrow) {
        return `${time}, Tomorrow`;
      } else if (isYesterday) {
        return `${time}, Yesterday`;
      } else {
        return `${time}, ${formattedDate}`;
      }
    };

    const handleSendNow = () => {
      SetIsLoadingButton(true);

      let payload;
      let endpoint;

      if (email.channel === "Linkedin") {
        payload = {
          email: recipientEmail,
          user_id: user.id, // Assuming you have access to the user object
          message: email.body
        };
        endpoint = "/v2/linkedin/send-message";
      } else {
        payload = {
          conversation_id: conversationId,
          sender: senderEmail,
          recipient: recipientEmail,
          subject: title,
          body: body,
        };
        endpoint = "/v2/mailbox/send/immediately";
      }

      axiosInstance
        .post(endpoint, payload)
        .then((response) => {
          toast.success("Your message has been sent successfully!");
          setThread(response.data);
          updateMailStatus(conversationId, "sent");
          SetIsLoadingButton(false);
          setEditable(false);
          setSelectedMailId(conversationId);
        })
        .catch((error) => {
          console.error("Failed to send message:", error);
          toast.error("Failed to send the message. Please try again.");
          SetIsLoadingButton(false);
        });
    };

    const handleApproveEmail = () => {
      setLoadingSmartSchedule(true);
      const payload = {
        conversation_id: conversationId,
        sender: senderEmail,
        recipient: recipientEmail,
        subject: email.subject,
        body: email.body,
      };

      axiosInstance
        .post("/v2/mailbox/draft/send", payload)
        .then((response) => {
          toast.success("Draft Approved!");
          setThread(response.data);
          // console.log("Approve Data", response.data);
          // updateMailStatus(conversationId, "scheduled"); // Update mail status
          setLoadingSmartSchedule(false);
          setEditable(false);
        })
        .catch((error) => {
          console.error("Failed to send email:", error);
          toast.error("Failed to send the email. Please try again.");
        });
    };

    const handleDeleteDraft = () => {
      axiosInstance
        .delete(`/v2/mailbox/draft/${conversationId}`)
        .then((response) => {
          toast.success("Your draft has been deleted successfully!");
          console.log(response.data);
          setEditable(false);
        })
        .catch((error) => {
          console.error("Failed to delete draft:", error);
          toast.error("Failed to delete the draft. Please try again.");
        });
    };

    if (email?.status === "TO-APPROVE") {
      const [isEditing, setIsEditing] = React.useState(false);
      const [editableSubject, setEditableSubject] = React.useState(parseActionDraft(email.body).subject);
      const [editableBody, setEditableBody] = React.useState(parseActionDraft(email.body).body);

      const handleSaveClick = () => {
        setIsEditing(false);

        const payload = {
          conversation_id: conversationId,
          received_datetime: email.received_datetime,
          sender: senderEmail,
          recipient: recipientEmail,
          subject: editableSubject,
          body: editableBody,
          is_reply: email.is_reply,
          send_datetime: email.send_datetime,
          open_datetime: email.open_datetime,
          click_datetime: email.click_datetime,
          response_datetime: email.response_datetime,
          status: email.status,
          sentiment: email.sentiment,
          category: email.category,
          action_draft: email.action_draft,
          approved: email.approved,
        };

        axiosInstance
          .patch(`/v2/mailbox/action_draft/update?_id=${email.id}`, payload)
          .then((response) => {
            toast.success("Draft updated successfully!");
            // Update the thread with the new data
            const updatedThread = thread.map(msg =>
              msg.id === email.id ? { ...msg, subject: editableSubject, body: editableBody } : msg
            );
            setThread(updatedThread);
          })
          .catch((error) => {
            console.error("Failed to update draft:", error);
            toast.error("Failed to update the draft. Please try again.");
          });
      };

      const handleRegenerateDraft = () => {
        const payload = {
          user_id: user.id,
          conversation_id: conversationId,
          campaign_id: leads[0].campaign_id,
        };

        axiosInstance
          .post(`/v2/mailbox/draft/regenerate`, payload)
          .then((response) => {
            toast.success("Draft regenerated successfully!");
            setEditableSubject(response.data.subject);
            setEditableBody(response.data.body);
          })
          .catch((error) => {
            console.error("Failed to regenerate draft:", error);
            toast.error("Failed to regenerate the draft. Please try again.");
          });
      };

      return (
        <div className="flex gap-4 flex-col m-4 h-full">
          <div className="flex w-full ">
            <Avatar
              className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
              onClick={handleAvatarClick}
            >
              <AvatarImage
                src={leads[0]?.photo_url ? leads[0].photo_url : ""}
                alt="avatar"
              />

              <AvatarFallback className="bg-yellow-400 text-black text-xs">
                {name ? initials(name) : ""}
              </AvatarFallback>
            </Avatar>
            <Card className="w-full mr-5 ">
              <div className="flex gap-5 p-4 items-center">
                <span className="text-sm font-semibold">
                  {leads[0]?.email
                    ? email.sender !== leads[0].email
                      ? "You to " + name
                      : name + " to you"
                    : ""}
                </span>
                <div className="flex gap-3">
                  <span className="text-gray-500 text-sm  ">
                    {email?.received_datetime &&
                      formatDate(email?.received_datetime.toString())}
                  </span>
                </div>

                <span>
                  {email.is_reply &&
                    email.category === "Information Required" && (
                      <Badge className="gap-1 items-center rounded-full bg-green-600">
                        <MailPlus className="h-[14px] w-[14px] scale-x-100" />
                        Information requested
                      </Badge>
                    )}
                  {email.is_reply && email.category === "Positive" && (
                    <Badge className="gap-1 items-center rounded-full bg-green-600">
                      <MailPlus className="h-[14px] w-[14px] scale-x-100" />
                      Postive
                    </Badge>
                  )}
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-sm flex -mt-8 -ml-3">
                  <Input
                    value={editableSubject}
                    className="text-xs"
                    placeholder="Subject"
                    readOnly={!isEditing}
                    onChange={(e) => setEditableSubject(e.target.value)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs -ml-3 -mt-4">
                <Textarea
                  value={editableBody}
                  className="text-xs h-64"
                  placeholder="Enter email body"
                  readOnly={!isEditing}
                  onChange={(e) => setEditableBody(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between text-xs items-center">
                <div>
                  {email.channel !== "Linkedin" && (
                    <Button disabled={isEditing} onClick={handleApproveEmail}>
                      {loadingSmartSchedule ? <LoadingCircle /> : "Smart Schedule"}
                    </Button>
                  )}
                  <Button
                    variant={"secondary"}
                    className="ml-2"
                    disabled={isEditing}
                    onClick={handleSendNow}
                  >
                    {isLoadingButton ? <LoadingCircle /> : "Send Now"}
                  </Button>
                </div>
                <div>
                  {!isEditing ? (
                    <Button variant={"ghost"} onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant={"ghost"} onClick={handleSaveClick}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}

                  <Button variant={"ghost"} onClick={handleRegenerateDraft}>
                    <RefreshCw className="h-4 w-4" />

                  </Button>
                  <Button variant={"ghost"} onClick={handleDeleteDraft}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-4 flex-col m-4 h-full ">
        <div className="flex w-full ">
          <Avatar
            className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
            onClick={handleAvatarClick}
          >
            <AvatarImage
              src={leads[0]?.photo_url ? leads[0].photo_url : ""}
              alt="avatar"
            />

            <AvatarFallback className="bg-yellow-400 text-black text-xs">
              {name ? initials(name) : ""}
            </AvatarFallback>
          </Avatar>
          <Card className="w-full mr-5 ">
            <div className="flex gap-5 p-4 items-center">
              <span className="text-sm font-semibold">
                {leads[0]?.email
                  ? email.sender !== leads[0].email
                    ? "You to " + name
                    : name + " to you"
                  : ""}
              </span>
              <div className="flex gap-3">
                <span className="text-gray-500 text-sm  ">
                  {email?.created_at &&
                    formatDate(email?.created_at.toString())}
                </span>
                <span>
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Positive" && (
                      <Badge className="gap-1 items-center rounded-full bg-green-600">
                        <ThumbsUp className="h-[14px] w-[14px] scale-x-100" />
                        Positive
                      </Badge>
                    )}
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "OOO" && (
                      <Badge className="gap-1 items-center rounded-full bg-yellow-600">
                        <UserX className="h-[14px] w-[14px] scale-x-100" />
                        Out of office
                      </Badge>
                    )}
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Negative" && (
                      <Badge
                        variant="destructive"
                        className="gap-1 items-center rounded-full"
                      >
                        <ThumbsDown className="-scale-x-100 h-[14px] w-[14px]" />
                        Negative
                      </Badge>
                    )}
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Forwarded" && (
                      <Badge className="gap-1 items-center rounded-full bg-blue-600">
                        <Forward className="h-[14px] w-[14px]" />
                        Referral
                      </Badge>
                    )}
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Later" && (
                      <Badge className="gap-1 items-center rounded-full bg-orange-600">
                        <TimerReset className="h-[14px] w-[14px]" />
                        Maybe Later
                      </Badge>
                    )}
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Demo" && (
                      <Badge className="gap-1 items-center rounded-full bg-purple-600">
                        <CalendarCheck className="h-[14px] w-[14px]" />
                        Demo
                      </Badge>
                    )}
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Neutral" && (
                      <Badge className="gap-1 items-center rounded-full bg-yellow-300">
                        <Bell className="h-[14px] w-[14px]" />
                        Neutral
                      </Badge>
                    )}

                  {/* Adding new Categories */}

                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Not Interested" && (
                      <Badge
                        variant="destructive"
                        className="gap-1 items-center rounded-full"
                      >
                        <ThumbsDown className="-scale-x-100 h-[14px] w-[14px]" />
                        Not Interested
                      </Badge>
                    )}
                  {email.is_reply &&
                    email.category &&
                    email.category.trim() === "Block" && (
                      <Badge
                        variant="destructive"
                        className="gap-1 items-center rounded-full"
                      >
                        <ThumbsDown className="-scale-x-100 h-[14px] w-[14px]" />
                        Block
                      </Badge>
                    )}

                  {/* Adding new Categories */}
                </span>
              </div>

              <span>
                {email.is_reply &&
                  email.category === "Information Required" && (
                    <Badge className="gap-1 items-center rounded-full bg-green-600">
                      <MailPlus className="h-[14px] w-[14px] scale-x-100" />
                      Information requested
                    </Badge>
                  )}
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-sm flex -mt-8 -ml-3">
                <Input
                  value={email.subject}
                  className="text-xs"
                  placeholder="Subject"
                  readOnly
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs -ml-3 -mt-4">
              <Textarea
                value={email.body}
                readOnly
                className="text-xs h-64"
                placeholder="Enter email body"
              />
            </CardContent>
          </Card>
        </div>
        <Notification email={email} />
      </div>
    );
  };

  const DraftEmailComponent = () => {
    const [suggestions, setSuggestions] = React.useState("");
    const [isSuggestionOpen, setIsSuggestionOpen] = React.useState(false);
    const [editable, setEditable] = React.useState(false);
    const [title, setTitle] = React.useState("");
    const [body, setBody] = React.useState("");
    const [isLoadingButton, SetIsLoadingButton] = React.useState(false);
    const [loadingSmartSchedule, setLoadingSmartSchedule] =
      React.useState(false);
    // const [currentEmailIndex, setCurrentEmailIndex] = React.useState(0);
    const [emails, setEmails] = React.useState<
      {
        body: string;
        conversation_id: string;
        created_at: string;
        id: number;
        subject: string;
        updated_at: string;
        // suggestions: any;
      }[]
    >();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const { user } = useUserContext();
    const internalScrollRef = React.useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = React.useState(false);

    const lastEmail = thread && thread[thread.length - 1];

    // Add this state to store the platform
    const [platform, setPlatform] = React.useState("");

    React.useEffect(() => {
      setError("");
      setIsLoading(true);
      axiosInstance
        .get(`/v2/mailbox/draft/${conversationId}`)
        .then((response) => {
          console.log("Initial Draft", response.data);
          if (response.data.length > 0) {
            setTitle(response.data[0].subject);
            setBody(response.data[0].body);
            setEmails(response.data);
            if (response.data[0].suggestions) {
              setSuggestions(response.data[0].suggestions);
            }
            // Store the platform information
            setPlatform(response.data[0].platform);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setError("Failed to load draft emails");
          setIsLoading(false);
          console.error(err);
        });
    }, [conversationId]);

    React.useEffect(() => {
      if (internalScrollRef.current) {
        internalScrollRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, [emails]);

    const handleApproveEmail = () => {
      setLoadingSmartSchedule(true);
      const payload = {
        conversation_id: conversationId,
        sender: senderEmail,
        recipient: recipientEmail,
        subject: title,
        body: body,
      };

      axiosInstance
        .post("/v2/mailbox/draft/send", payload)
        .then((response) => {
          toast.success("Draft Approved!");
          setThread(response.data);
          // console.log("Approve Data", response.data);
          updateMailStatus(conversationId, "scheduled"); // Update mail status
          setLoadingSmartSchedule(false);
          setEditable(false);
          setSelectedMailId(conversationId);
        })
        .catch((error) => {
          console.error("Failed to approve email:", error);
          toast.error("Failed to approve the email. Please try again.");
        });
    };

    const handleSendNow = () => {
      SetIsLoadingButton(true);


      let payload;
      let endpoint;

      if (platform === "Linkedin") {
        payload = {
          email: recipientEmail,
          user_id: user.id, // Assuming you have access to the user object
          message: body
        };
        endpoint = "/v2/linkedin/send-message";
      } else {
        payload = {
          conversation_id: conversationId,
          sender: senderEmail,
          recipient: recipientEmail,
          subject: title,
          body: body,
        };
        endpoint = "/v2/mailbox/send/immediately";
      }


      axiosInstance
        .post(endpoint, payload)
        .then((response) => {
          toast.success("Your message has been sent successfully!");
          setThread(response.data);
          updateMailStatus(conversationId, "sent");
          SetIsLoadingButton(false);
          setEditable(false);
          setSelectedMailId(conversationId);
        })
        .catch((error) => {
          console.error("Failed to send message:", error);
          toast.error("Failed to send the message. Please try again.");
          SetIsLoadingButton(false);
        });
    };

    const handleRegenrateDraft = () => {
      const payload = {
        user_id: user.id,
        conversation_id: conversationId,
        campaign_id: leads[0].campaign_id,
      };
      axiosInstance
        .post(`/v2/mailbox/draft/regenerate`, payload)
        .then((response) => {
          toast.success("Your draft has been regenerated successfully!");
          setTitle(response.data.subject);
          setBody(response.data.body);
          console.log(response.data);
          setEditable(false);
        })
        .catch((error) => {
          console.error("Failed to regenerate draft:", error);
          toast.error("Failed to regenerate the draft. Please try again.");
        });
    };

    const handleDeleteDraft = (draft_id: any) => {
      axiosInstance
        .delete(`/v2/mailbox/draft/${draft_id}`)
        .then((response) => {
          toast.success("Your draft has been deleted successfully!");
          console.log(response.data);
          // Clear the title and body
          setTitle("");
          setBody("");
          setEditable(false);
        })
        .catch((error) => {
          console.error("Failed to delete draft:", error);
          toast.error("Failed to delete the draft. Please try again.");
        });
    };

    const handleEditClick = () => {
      setIsEditing(true);
      setEditable(true);
    };

    const handleSaveClick = () => {
      setIsEditing(false);
      setEditable(false);

      // Make the PATCH API call
      const payload = {
        subject: title,
        body: body
      };

      axiosInstance
        .patch(`/v2/mailbox/draft/update?_id=${emails && emails[0]?.id}`, payload)
        .then((response) => {
          toast.success("Draft updated successfully!");
          console.log("Updated draft:", response.data);
        })
        .catch((error) => {
          console.error("Failed to update draft:", error);
          toast.error("Failed to update the draft. Please try again.");
        });
    };

    if (isLoading) {
      return (
        <div className="m-4 flex flex-row ">
          {/* <LoadingCircle /> */}
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex flex-col space-y-3 ml-5">
            <Skeleton className="h-[25px] w-[30rem] rounded-lg" />
            <Skeleton className="h-[325px] w-[30rem] rounded-xl" />
          </div>
        </div>
      );
    }

    if (!emails) {
      <div>Draft is empty</div>;
    }

    if (thread.length > 0 && !lastEmail?.is_reply) {
      return (
        <div className="flex gap-4 flex-col m-4 h-full">
          <div className="flex gap-2 flex-col h-full">
            <div className="flex w-full">
              <Avatar
                className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
                onClick={handleAvatarClick}
              >
                <AvatarImage
                  src={leads[0]?.photo_url ? leads[0].photo_url : ""}
                  alt="avatar"
                />

                <AvatarFallback className="bg-yellow-400 text-black text-xs">
                  {name ? initials(name) : ""}
                </AvatarFallback>
              </Avatar>
              <Card className="w-full mr-5 ">
                <div className="flex gap-5 p-4 items-center">
                  <span className="text-sm font-semibold">
                    {"You to " + name}
                  </span>
                  <div className="flex gap-3">
                    <span className="text-green-500 text-sm ">
                      Draft
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-sm flex -mt-8 -ml-3">
                    <Input
                      value={title}
                      disabled={!editable}
                      className="text-xs"
                      placeholder="Subject"
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs -ml-3 -mt-4">
                  <Textarea
                    value={body}
                    disabled={!editable}
                    className="text-xs h-64"
                    placeholder="Enter email body"
                    onChange={(e) => setBody(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between text-xs items-center">
                  <div>
                    <Button disabled={editable} onClick={handleApproveEmail}>
                      {loadingSmartSchedule ? <LoadingCircle /> : "Smart Schedule"}
                    </Button>
                    <Button variant={"secondary"} className="ml-2" onClick={handleSendNow}>
                      {isLoadingButton ? <LoadingCircle /> : "Send Now"}
                    </Button>
                  </div>
                  <div>
                    {!isEditing ? (
                      <Button variant={"ghost"} onClick={handleEditClick}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant={"ghost"} onClick={handleSaveClick}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant={"ghost"} onClick={handleRegenrateDraft}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant={"ghost"} onClick={() => handleDeleteDraft(emails && emails[0]?.conversation_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col gap-3 items-center justify-center mt-[17.2rem]">
          <Image
            src="/error.svg"
            alt="empty-inbox"
            width="200"
            height="200"
            className="dark:filter dark:invert"
          />
          <p className="flex justify-center items-center mt-10 ml-6  text-gray-500">
            Oops!! Something Went Wrong
          </p>
        </div>
      );
    }

    return (
      <div className="flex gap-2 flex-col m-4 h-full">
        {platform === "Linkedin" && (
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Linkedin className="h-4 w-4 text-gray-400" />
            </div>
            {leads[0]?.connected_on_linkedin === 'SENT' ? (
              <p className="ml-1 text-xs">{leads[0]?.name} has been sent a connection request</p>
            ) : leads[0]?.connected_on_linkedin === 'FAILED' ? (
              <p className="ml-1 text-xs">{leads[0]?.name} has rejected your connection request</p>
            ) : leads[0]?.connected_on_linkedin === 'CONNECTED' ? (
              <p className="ml-1 text-xs">{leads[0]?.name} has accepted your connection request</p>
            ) : (
              <p className="ml-1 text-xs">Connection request scheduled for {leads[0]?.name}</p>
            )}
          </div>
        )}

        <div className="flex w-full">
          <Avatar
            className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
            onClick={handleAvatarClick}
          >
            <AvatarImage
              src={leads[0]?.photo_url ? leads[0].photo_url : ""}
              alt="avatar"
            />

            <AvatarFallback className="bg-yellow-400 text-black text-xs">
              {name ? initials(name) : ""}
            </AvatarFallback>
          </Avatar>
          <Card className="w-full mr-5 ">
            <div className="flex gap-5 p-4 items-center">
              <span className="text-sm font-semibold">
                {"You to " + name}
              </span>
              <div className="flex gap-3">
                <span className={`${platform === "Linkedin" ? "text-blue-500" : "text-green-500"} text-sm flex items-center space-x-2`}>
                  {platform === "Linkedin" ? "LinkedIn Message" : "Email Draft"}
                  <div className="h-4 w-4 pl-2">
                    {platform === "Linkedin" && <Linkedin className="h-4 w-4" />}
                  </div>
                </span>
              </div>
            </div>
            {platform !== "Linkedin" && (
              <CardHeader>
                <CardTitle className="text-sm flex -mt-8 -ml-3">
                  <Input
                    value={title}
                    disabled={!editable}
                    className="text-xs"
                    placeholder="Subject"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </CardTitle>
              </CardHeader>
            )}
            <CardContent className="text-xs -ml-3 -mt-4">
              <Textarea
                value={body}
                disabled={!editable}
                className="text-xs h-64"
                placeholder="Enter message body"
                onChange={(e) => setBody(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between text-xs items-center">
              <div>
                {platform !== "Linkedin" && (
                  <Button disabled={editable} onClick={handleApproveEmail}>
                    {loadingSmartSchedule ? <LoadingCircle /> : "Smart Schedule"}
                  </Button>
                )}
                <Button
                  variant={platform === "Linkedin" ? "default" : "secondary"}
                  className="ml-2"
                  onClick={handleSendNow}
                >
                  {isLoadingButton ? <LoadingCircle /> : "Send Now"}
                </Button>
              </div>
              <div>
                {!isEditing ? (
                  <Button variant={"ghost"} onClick={handleEditClick}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant={"ghost"} onClick={handleSaveClick}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button variant={"ghost"} onClick={handleRegenrateDraft}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    handleDeleteDraft(emails && emails[0]?.conversation_id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
            <div ref={internalScrollRef} />
          </Card>
        </div>
        {platform !== "Linkedin" && <SuggestionDisplay suggestions={suggestions} />}
      </div>
    );
  };

  const DropdownComponent = () => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("manualmode");

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? frameworks.find((f) => f.value === value)?.label
              : "Manual mode"}

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const matchingCampaign = campaigns.find((campaign) => campaign.id === leadId);
  const lastEmail = thread && thread[thread.length - 1];


  return (
    <div className="relative">
      <div className="bg-accent w-[3px] h-full absolute left-7 -z-10"></div>
      <div className="h-full ">
        {isLoading ? (
          ""
        ) : (
          <>
            {/* LinkedIn Connection Status */}


            {/* Campaign Info */}
            {/* {matchingCampaign && (
              <div className="m-4">
                <div className="flex items-center gap-3">
                  <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-xs ml-1">
                    {name} was added in {matchingCampaign.campaign_type}{" "}
                    {matchingCampaign.campaign_name} campaign
                  </div>
                </div>
              </div>
            )} */}
            {thread?.[0]?.channel === 'Linkedin' && <div className="m-4">
              <div className="flex items-center gap-3">
                <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                </div>
                {leads[0]?.connected_on_linkedin === 'SENT' ? (
                  <p className="ml-1 text-xs">{leads[0]?.name} has been sent a connection request</p>
                ) : leads[0]?.connected_on_linkedin === 'FAILED' ? (
                  <p className="ml-1 text-xs">{leads[0]?.name} has rejected your connection request</p>
                ) : leads[0]?.connected_on_linkedin === 'CONNECTED' ? (
                  <p className="ml-1 text-xs">{leads[0]?.name} has accepted your connection request</p>
                ) : (
                  <p className="ml-1 text-xs">Connection request scheduled for {leads[0]?.name}</p>
                )}
              </div>
            </div>}
          </>
        )}
        {thread?.length > 0 && (
          <div>
            {thread.map((email, index) => (
              <EmailComponent key={index} email={email} />
            ))}
          </div>
        )}

        {/* Only show draft if drafts exist and either there are no messages or last message is not a reply */}
        {true && (
          thread?.length === 0 ? (
            <DraftEmailComponent />
          ) : (
            lastEmail?.is_reply === false && (
              <>
                <DraftEmailComponent />
                {mailStatus === "LOST" && (
                  <div className="flex items-center gap-3 ml-4">
                    <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                      <BadgeX className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-xs ml-1">
                      This lead has been marked as lost.
                    </div>
                  </div>
                )}
              </>
            )
          )
        )}
      </div>
    </div>
  );
};

export default ThreadDisplayMain;
