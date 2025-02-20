/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Notification from "./Notification";



import { useLeadSheetSidebar } from "@/context/lead-sheet-sidebar";
import {
  BadgeX,
  Check,
  Edit3,
  Linkedin,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useMailbox, EmailMessage } from "@/context/mailbox-provider";
import { Lead, useLeads } from "@/context/lead-user";
import { toast } from "sonner";
import { LoadingCircle } from "@/app/icons";
import { Badge } from "../ui/badge";
import { parseActionDraft } from "./parse-draft";
import Image from "next/image";
import SuggestionDisplay from "./suggestionsDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import ContentDisplay from "./ContentDisplay";
import { useAuth } from "@/context/auth-provider";
import UpperNotification from "./UpperNotification";
import { draftEmail } from "@/constants/data";


interface ThreadDisplayMainProps {
  ownerEmail: string;
  updateMailStatus: (mailId: string, status: string) => void;
  selectedMailId: string | null;
  setSelectedMailId: (id: string | null) => void;
  mailStatus: string;
  name: string;
  campaign_name: string;
  campaign_id: string;
  contact_id: string;
  linkedinSender: string;
  linkedin_exists: boolean;
  connection_status: string;
}

const initials = (name: string) => {
  const names = name.split(" ");
  return names
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

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
  const formattedDate = new Intl.DateTimeFormat("en-GB", dateOptions).format(
    date
  );

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

const ThreadDisplayMain: React.FC<ThreadDisplayMainProps> = ({
  ownerEmail,
  updateMailStatus,
  selectedMailId,
  setSelectedMailId,
  mailStatus,
  name,
  campaign_name,
  contact_id,
  linkedinSender,
  linkedin_exists,
  connection_status
}) => {
  const {
    conversationId,
    thread,
    setThread,
    recipientEmail,
    senderEmail,
  } = useMailbox();

  const [isLoading, setIsLoading] = useState(true);
  const { toggleSidebar, setItemId } = useLeadSheetSidebar();
  const { leads, setLeads } = useLeads();

  const [linkedInInteractions, setLinkedInInteractions] = useState<{
    like_comment_date?: any;
    comment?: string;
  } | null>(null);

  const [linkedinSenderName, setLinkedinSenderName] = useState<string>('');


  useEffect(() => {
    async function fetchLinkedinSenderName() {
      if (!linkedinSender) return;

      try {
        const res = await axiosInstance.post(
          'v2/linkedin/user-linkedin-name',
          {
            url: linkedinSender
          }
        );
        setLinkedinSenderName(res.data.name);
      } catch (error) {
        console.error("Error fetching LinkedIn sender name:", error);
        toast.error("Failed to load LinkedIn sender information.");
      }
    }

    fetchLinkedinSenderName();
  }, [linkedinSender]);

  useEffect(() => {
    if (thread?.length > 0) {
      // Find the first message with interaction
      const messageWithInteraction = thread[0];  // Take the first message since all have the same interaction

      if (messageWithInteraction?.like_comment_date && messageWithInteraction?.comment) {
        setLinkedInInteractions({
          like_comment_date: messageWithInteraction.like_comment_date,
          comment: messageWithInteraction.comment
        });
      } else {
        setLinkedInInteractions(null);
      }
    }
  }, [thread]);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get<EmailMessage[]>(
        `v2/mailbox/conversation/${conversationId}`
      );
      setThread(response.data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, setThread]);

  const fetchLeadInfo = useCallback(async () => {
    if (!contact_id) return;

    try {
      const response = await axiosInstance.get<Lead>(`v2/lead/info/${contact_id}`);
      setItemId(response.data.id);
      setLeads([response.data]);
    } catch (error) {
      console.error("Error fetching lead info:", error);
      toast.error("Failed to load lead information");
    }
  }, [contact_id, setItemId, setLeads]);


  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    if (conversationId) {
      setThread([]);
      fetchConversation();
    }

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [conversationId, fetchConversation]);

  React.useEffect(() => {
    if (contact_id) {
      fetchLeadInfo();
    }
  }, [contact_id, fetchLeadInfo]);

  const EmailComponent = (
    ({ email }: { email: EmailMessage }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [editableSubject, setEditableSubject] = useState(
        email.subject || parseActionDraft(email.body).subject || ""
      );
      const [editableBody, setEditableBody] = useState(
        email.body || parseActionDraft(email.body).body || ""
      );
      const [isLoadingButton, setIsLoadingButton] = useState(false);
      const [loadingSmartSchedule, setLoadingSmartSchedule] = useState(false);

      const { user } = useAuth();

      const handleSendNow = useCallback(() => {
        setIsLoadingButton(true);

        let payload;
        let endpoint;

        if (email.channel?.toLowerCase() === "linkedin") {
          const messageId = thread[thread.length - 1].id;
          payload = {
            receiver: recipientEmail,
            sender: senderEmail,
            user_id: user?.id,
            message_id: messageId,
            message: email.body,
            conversation_id: conversationId,
          };
          endpoint = "/v2/linkedin/send-message";

          axiosInstance
            .post(endpoint, payload)
            .then((response) => {
              toast.success("Your LinkedIn message has been sent successfully!");
              return axiosInstance.get<EmailMessage[]>(`v2/mailbox/conversation/${conversationId}`);
            })
            .then((threadResponse) => {
              setThread(threadResponse.data);
              updateMailStatus(conversationId, "sent");
              setIsLoadingButton(false);
              setSelectedMailId(conversationId);
            })
            .catch((error) => {
              console.error("Failed to send LinkedIn message:", error);
              toast.error("Failed to send the message. Please try again.");
              setIsLoadingButton(false);
            });
        } else {
          payload = {
            conversation_id: conversationId,
            sender: senderEmail,
            recipient: recipientEmail,
            subject: email.subject,
            body: email.body,
          };
          endpoint = "/v2/mailbox/send/immediately";

          axiosInstance
            .post(endpoint, payload)
            .then((response) => {
              toast.success("Your message has been sent successfully!");
              setThread(response.data);
              updateMailStatus(conversationId, "sent");
              setIsLoadingButton(false);
              setSelectedMailId(conversationId);
            })
            .catch((error) => {
              console.error("Failed to send message:", error);
              toast.error("Failed to send the message. Please try again.");
              setIsLoadingButton(false);
            });
        }
      }, [
        conversationId,
        email.body,
        email.channel,
        email.subject,
        recipientEmail,
        senderEmail,
        setSelectedMailId,
        setThread,
        updateMailStatus,
        user?.id,
      ]);

      const handleApproveEmail = useCallback(() => {
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
            setLoadingSmartSchedule(false);
          })
          .catch((error) => {
            console.error("Failed to send email:", error);
            toast.error("Failed to send the email. Please try again.");
            setLoadingSmartSchedule(false);
          });
      }, [
        conversationId,
        email.body,
        email.subject,
        recipientEmail,
        senderEmail,
        setThread,
      ]);

      const handleDeleteDraft = useCallback(() => {
        axiosInstance
          .delete(`/v2/mailbox/draft/${conversationId}`)
          .then(() => {
            toast.success("Your draft has been deleted successfully!");
          })
          .catch((error) => {
            console.error("Failed to delete draft:", error);
            toast.error("Failed to delete the draft. Please try again.");
          });
      }, [conversationId]);

      const handleSaveClick = useCallback(() => {
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
          .then(() => {
            toast.success("Draft updated successfully!");
            setThread(thread.map((msg) =>
              msg.id === email.id
                ? {
                  ...msg,
                  subject: editableSubject,
                  body: editableBody,
                } as EmailMessage
                : msg
            ));
          })
          .catch((error) => {
            console.error("Failed to update draft:", error);
            toast.error("Failed to update the draft. Please try again.");
          });
      }, [
        conversationId,
        editableBody,
        editableSubject,
        email,
        recipientEmail,
        senderEmail,
        setThread,
      ]);

      const handleRegenerateDraft = useCallback(() => {
        const payload = {
          user_id: user?.id,
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
      }, [conversationId, leads, user?.id]);

      if (email?.status === "TO-APPROVE") {
        return (
          <div className="flex gap-4 flex-col m-4 h-full">
            <div className="flex w-full ">
              <Avatar
                className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
                onClick={() => toggleSidebar(true)}
              >
                <AvatarImage
                  src={leads[0]?.photo_url ?? leads[0]?.organization?.logo_url}
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
                      ? !email.is_reply
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
                </div>
                {email.subject === "" || email.subject === "No subject" ? (<></>) : (<CardHeader>
                  <CardTitle className="text-sm flex -mt-8 -ml-3">
                    <Input
                      value={editableSubject}
                      className="text-xs"
                      placeholder="Subject"
                      readOnly={!isEditing}
                      onChange={(e) => setEditableSubject(e.target.value)}
                    />
                  </CardTitle>
                </CardHeader>)}
                <CardContent className="text-xs -ml-3 -mt-2">
                  <ContentDisplay
                    content={editableBody}
                    className="text-xs h-72"
                    readOnly={!isEditing}
                    onChange={(value) => setEditableBody(value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between text-xs items-center">
                  <div>
                    {email.channel !== "Linkedin" && (
                      <Button disabled={isEditing} onClick={handleApproveEmail}>
                        {loadingSmartSchedule ? (
                          <LoadingCircle />
                        ) : (
                          "Smart Schedule"
                        )}
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
          <UpperNotification connection_sent_time={(() => {
            if (!email.created_at || !email.connection_sent_time) return null;

            // Get the first message in the thread
            const firstMessage = thread[0];

            // Show connection sent only with the first message if it happened before the conversation
            if (new Date(email.connection_sent_time) < new Date(firstMessage.created_at)) {
              return email.id === firstMessage.id ? email.connection_sent_time : null;
            }

            // Otherwise, show it after the last message before the connection request
            const messagesBeforeConnection = thread
              .filter(e => e.created_at &&
                new Date(e.created_at) <= new Date(email.connection_sent_time))
              .sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return messagesBeforeConnection[0]?.id === email.id
              ? email.connection_sent_time
              : null;
          })()}
            connection_accepted_time={(() => {
              if (!email.created_at || !email.connection_accepted_time) return null;

              // Get the first message in the thread
              const firstMessage = thread[0];

              // Show connection accepted only with the first message if it happened before the conversation
              if (new Date(email.connection_accepted_time) < new Date(firstMessage.created_at)) {
                return email.id === firstMessage.id ? email.connection_accepted_time : null;
              }

              // Otherwise, show it after the last message before the connection acceptance
              const messagesBeforeAcceptance = thread
                .filter(e => e.created_at &&
                  new Date(e.created_at) <= new Date(email.connection_accepted_time))
                .sort((a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

              return messagesBeforeAcceptance[0]?.id === email.id
                ? email.connection_accepted_time
                : null;
            })()}
            linkedin_url={linkedinSender}
            linkedin_sender_name={linkedinSenderName}
            name={name}
            message_sent_with_invite={email.message_sent_with_invite}
            invite_message={email.invite_message}
          />
          <div className="flex w-full ">
            <Avatar
              className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
              onClick={() => toggleSidebar(true)}
            >
              <AvatarImage
                src={leads[0]?.photo_url ?? leads[0]?.organization?.logo_url}
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
                    ? !email.is_reply
                      ? "You to " + name
                      : name + " to you"
                    : ""}
                </span>
                <div className="flex gap-3">
                  <span className="text-gray-500 text-sm  ">
                    {email?.created_at &&
                      formatDate(email?.created_at.toString())}
                  </span>
                </div>
              </div>
              {email.subject && (
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
              )}
              <CardContent className={`text-xs -ml-3 ${!email.subject ? "" : "-mt-3"}`}>
                <ContentDisplay
                  content={email.body}
                  className="text-xs h-max"
                  readOnly
                />
              </CardContent>
            </Card>
          </div>{
            email?.follow_up_number && (

              < SuggestionDisplay suggestions={email?.suggestions || ""} />
            )
          }
          <Notification
            email={email}
            isLatestEmail={false}
            linkedInInteractions={(() => {
              if (!email.created_at || !linkedInInteractions?.like_comment_date) return null;

              // Get the first message in the thread
              const firstMessage = thread[0];

              // Show interaction only with the first message if interaction happened before the conversation
              if (new Date(linkedInInteractions.like_comment_date) < new Date(firstMessage.created_at)) {
                return email.id === firstMessage.id ? linkedInInteractions : null;
              }

              // Otherwise, show it after the last message before the interaction
              const messagesBeforeInteraction = thread
                .filter(e => e.created_at &&
                  new Date(e.created_at) <= new Date(linkedInInteractions.like_comment_date))
                .sort((a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

              return messagesBeforeInteraction[0]?.id === email.id
                ? linkedInInteractions
                : null;
            })()}

          />
        </div >
      );
    }
  );

  const renderLinkedInStatus = () => {
    if (!linkedin_exists) return null;
    if (thread.length > 0) return null;
    return (
      <div className="m-4">
        <div className="flex items-center gap-3">
          <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
            <Linkedin className="h-4 w-4 text-gray-400" />
          </div>
          {connection_status === "SENT" ? (
            <p className="ml-1 text-xs">
              {name} has been sent a connection request from {linkedinSenderName || linkedinSender}
            </p>
          ) : connection_status === "FAILED" ? (
            <p className="ml-1 text-xs">
              {name} has rejected your connection request from {linkedinSenderName || linkedinSender}
            </p>
          ) : connection_status === "CONNECTED" ? (
            <p className="ml-1 text-xs">
              {name} has accepted your connection request from {linkedinSenderName || linkedinSender}
            </p>
          ) : (
            <p className="ml-1 text-xs">
              Connection request scheduled for {name} from {linkedinSenderName || linkedinSender}
            </p>
          )}
        </div>
      </div>
    );
  };

  const DraftEmailComponent = (() => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const [loadingSmartSchedule, setLoadingSmartSchedule] = useState(false);
    const [emails, setEmails] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const internalScrollRef = useRef<HTMLDivElement>(null);
    const [platform, setPlatform] = useState("");

    useEffect(() => {
      axiosInstance
        .get(`/v2/mailbox/draft/${conversationId}`)
        .then((response) => {
          if (response.data && response.data.length > 0) {
            setTitle(response.data[0].subject);
            setBody(response.data[0].body);
            setEmails(response.data);
            if (response.data[0].suggestions) {
              // setSuggestions(response.data[0].suggestions);
            }
            setPlatform(response.data[0].platform.toLowerCase());
          } else {
            setEmails([]);
            setTitle("");
            setBody("");
            setPlatform("");
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.error(err);
        });
    }, [conversationId]);

    useEffect(() => {
      if (internalScrollRef.current) {
        internalScrollRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, [emails]);

    const handleApproveEmail = useCallback(() => {
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
          updateMailStatus(conversationId, "scheduled");
          setLoadingSmartSchedule(false);
          setIsEditing(false);
          setSelectedMailId(conversationId);
          refreshThread();
        })
        .catch((error) => {
          console.error("Failed to approve email:", error);
          toast.error("Failed to approve the email. Please try again.");
          setLoadingSmartSchedule(false);
        });
    }, [
      body,
      conversationId,
      recipientEmail,
      senderEmail,
      setSelectedMailId,
      setThread,
      title,
      updateMailStatus,
      refreshThread,
    ]);

    const handleSendNow = useCallback((thread: EmailMessage[]) => {
      setIsLoadingButton(true);

      let payload;
      let endpoint;

      if (platform === "linkedin") {
        console.log("thread", thread);
        console.log("emails", emails);
        const messageId = thread[thread.length - 1].id;
        payload = {
          receiver: recipientEmail,
          sender: senderEmail,
          user_id: user?.id,
          message: body,
          conversation_id: conversationId,
          message_id: messageId
        };
        endpoint = "/v2/linkedin/send-message";

        // axiosInstance
        //   .post(endpoint, payload)
        //   .then((response) => {
        //     toast.success("Your LinkedIn message has been sent successfully!");
        //     return axiosInstance.get<EmailMessage[]>(`v2/mailbox/conversation/${conversationId}`);
        //   })
        //   .then((threadResponse) => {
        //     setThread(threadResponse.data);
        //     updateMailStatus(conversationId, "sent");
        //     setIsLoadingButton(false);
        //     setIsEditing(false);
        //     setSelectedMailId(conversationId);
        //   })
        //   .catch((error) => {
        //     console.error("Failed to send LinkedIn message:", error);
        //     toast.error("Failed to send the message. Please try again.");
        //     setIsLoadingButton(false);
        //   });
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
          setIsLoadingButton(false);
          setIsEditing(false);
          setSelectedMailId(conversationId);
          refreshThread();
        })
        .catch((error) => {
          console.error("Failed to send message:", error);
          toast.error("Failed to send the message. Please try again.");
          setIsLoadingButton(false);
        });
    }, [
      body,
      conversationId,
      platform,
      recipientEmail,
      senderEmail,
      setSelectedMailId,
      setThread,
      title,
      updateMailStatus,
      user?.id,
      refreshThread,
    ]);

    const handleRegenerateDraft = useCallback(() => {
      const payload = {
        user_id: user?.id,
        conversation_id: conversationId,
        campaign_id: leads[0].campaign_id,
      };
      axiosInstance
        .post(`/v2/mailbox/draft/regenerate`, payload)
        .then((response) => {
          toast.success("Your draft has been regenerated successfully!");
          setTitle(response.data.subject);
          setBody(response.data.body);
          setIsEditing(false);
        })
        .catch((error) => {
          console.error("Failed to regenerate draft:", error);
          toast.error("Failed to regenerate the draft. Please try again.");
        });
    }, [conversationId, leads, user?.id]);

    const handleDeleteDraft = useCallback(
      (draft_id: any) => {
        axiosInstance
          .delete(`/v2/mailbox/draft/${draft_id}`)
          .then(() => {
            toast.success("Your draft has been deleted successfully!");
            setTitle("");
            setBody("");
            setIsEditing(false);
          })
          .catch((error) => {
            console.error("Failed to delete draft:", error);
            toast.error("Failed to delete the draft. Please try again.");
          });
      },
      []
    );

    const handleSaveClick = useCallback(() => {
      setIsEditing(false);

      const payload = {
        subject: title,
        body: body,
      };

      axiosInstance
        .patch(`/v2/mailbox/draft/update?_id=${emails && emails[0]?.id}`, payload)
        .then(() => {
          toast.success("Draft updated successfully!");
        })
        .catch((error) => {
          console.error("Failed to update draft:", error);
          toast.error("Failed to update the draft. Please try again.");
        });
    }, [body, emails, title]);

    if (leads[0]?.type === "omni" && linkedin_exists && connection_status !== "CONNECTED") {
      return null;
    }

    if (isLoading) {
      return (
        <div className="m-4 flex flex-row ">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex flex-col space-y-3 ml-5">
            <Skeleton className="h-[25px] w-[30rem] rounded-lg" />
            <Skeleton className="h-[325px] w-[30rem] rounded-xl" />
          </div>
        </div>
      );
    }

    if (!emails?.length) {
      return null;
    }


    return (
      <div className="flex gap-2 flex-col m-4 h-full">
        <div className="flex w-full">
          <Avatar
            className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
            onClick={() => toggleSidebar(true)}
          >
            <AvatarImage
              src={leads[0]?.photo_url ?? leads[0]?.organization?.logo_url}
              alt="avatar"
            />

            <AvatarFallback className="bg-yellow-400 text-black text-xs">
              {name ? initials(name) : ""}
            </AvatarFallback>
          </Avatar>
          <Card className="w-full mr-5 ">
            <div className="flex gap-5 p-4 items-center">
              <span className="text-sm font-semibold">{"You to " + name}</span>
              <div className="flex gap-3">
                <span
                  className={`${platform === "linkedin"
                    ? "text-blue-500"
                    : "text-green-500"
                    } text-sm flex items-center space-x-2`}
                >
                  {platform === "linkedin" ? "LinkedIn Message" : "Email Draft"}
                  <div className="h-4 w-4 pl-2">
                    {platform === "linkedin" && (
                      <Linkedin className="h-4 w-4" />
                    )}
                  </div>
                </span>
              </div>
            </div>
            {platform !== "linkedin" && (
              <CardHeader>
                <CardTitle className="text-sm flex -mt-8 -ml-3">
                  <Input
                    value={title}
                    disabled={!isEditing}
                    className="text-xs"
                    placeholder="Subject"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </CardTitle>
              </CardHeader>
            )}
            <CardContent className="text-xs -ml-3 -mt-4">
              <ContentDisplay
                content={body}
                className="text-xs h-64"
                readOnly={!isEditing}
                onChange={(value) => setBody(value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between text-xs items-center">
              <div>
                {platform !== "linkedin" && (
                  <Button disabled={isEditing} onClick={handleApproveEmail}>
                    {loadingSmartSchedule ? (
                      <LoadingCircle />
                    ) : (
                      "Smart Schedule"
                    )}
                  </Button>
                )}
                <Button
                  variant={platform === "linkedin" ? "default" : "secondary"}
                  className="ml-2"
                  disabled={
                    isLoadingButton ||
                    (linkedin_exists && connection_status !== "CONNECTED")
                  }
                  onClick={() => handleSendNow(emails)}
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
                <Button
                  variant={"ghost"}
                  onClick={() =>
                    handleDeleteDraft(emails && emails[0]?.conversation_id)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
            <div ref={internalScrollRef} />
          </Card>
        </div>
        {platform !== "linkedin" && (
          <SuggestionDisplay suggestions={emails[0]?.suggestions} />
        )}
      </div>
    );
  });

  const LinkedInMessageBox = () => {
    const [messageBody, setMessageBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { user } = useAuth();

    const handleSendMessage = async () => {
      if (!messageBody.trim()) return;

      setIsSending(true);
      const messageId = thread[thread.length - 1]?.id;

      const payload = {
        receiver: recipientEmail,
        sender: senderEmail,
        user_id: user?.id,
        message: messageBody,
        conversation_id: conversationId,
        message_id: messageId
      };

      try {
        await axiosInstance.post('/v2/linkedin/send-message', payload);
        toast.success("Your LinkedIn message has been sent successfully!");
        const threadResponse = await axiosInstance.get<EmailMessage[]>(`v2/mailbox/conversation/${conversationId}`);
        setThread(threadResponse.data);
        updateMailStatus(conversationId, "sent");
        setSelectedMailId(conversationId);
        setMessageBody('');
      } catch (error) {
        console.error("Failed to send LinkedIn message:", error);
        toast.error("Failed to send the message. Please try again.");
      } finally {
        setIsSending(false);
      }
    };

    return (
      <div className="flex gap-4 flex-col m-4">
        <div className="flex w-full">
          <Avatar
            className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4"
            onClick={() => toggleSidebar(true)}
          >
            <AvatarImage
              src={leads[0]?.photo_url ?? leads[0]?.organization?.logo_url}
              alt="avatar"
            />
            <AvatarFallback className="bg-yellow-400 text-black text-xs">
              {name ? initials(name) : ""}
            </AvatarFallback>
          </Avatar>
          <Card className="w-full mr-5">
            <div className="flex gap-5 p-4 items-center">
              <span className="text-sm font-semibold">{"You to " + name}</span>
              <span className="text-blue-500 text-sm flex items-center space-x-2">
                LinkedIn Message
                <div className="h-4 w-4 pl-2">
                  <Linkedin className="h-4 w-4" />
                </div>
              </span>
            </div>
            <CardContent className="text-xs -ml-3 mt-2">
              <Textarea
                value={messageBody}
                className="text-xs h-32"
                readOnly={false}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Write your message..."
              />
            </CardContent>
            <CardFooter className="flex justify-end text-xs items-center">
              <Button
                disabled={isSending || !messageBody.trim()}
                onClick={handleSendMessage}
              >
                {isSending ? <LoadingCircle /> : "Send"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  };



  const refreshThread = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      // Fetch thread data
      axiosInstance.get<EmailMessage[]>(`v2/mailbox/conversation/${conversationId}`),
      // Fetch lead info
      axiosInstance.get<Lead>(`v2/lead/info/${contact_id}`)
    ])
      .then(([threadResponse, leadResponse]) => {
        setThread(threadResponse.data);
        setItemId(leadResponse.data.id);
        setLeads([leadResponse.data]);
        toast.success("Thread refreshed successfully");
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
        toast.error("Failed to refresh thread");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [conversationId, contact_id, setThread, setItemId, setLeads]);

  if (isLoading || !thread) {
    return (
      <div className="m-4 flex flex-row">
        <Skeleton className="h-7 w-7 rounded-full" />
        <div className="flex flex-col space-y-3 ml-5">
          <Skeleton className="h-[25px] w-[30rem] rounded-lg" />
          <Skeleton className="h-[325px] w-[30rem] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-accent w-[3px] h-full absolute left-7 -z-10"></div>
      <div className="h-full">
        <div className="absolute right-8 top-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshThread}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading ? (
          ""
        ) : (
          <>
            <div className="m-4">
              <div className="flex items-center gap-3">
                <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-xs ml-1">
                  {name} was added in {campaign_name} campaign
                </div>
              </div>
            </div>

            {renderLinkedInStatus()}


            {thread?.length > 0 && (
              <div>
                {thread
                  ?.sort((a, b) => {
                    // First sort by follow_up_number
                    const followUpA = a.follow_up_number || 0;
                    const followUpB = b.follow_up_number || 0;

                    if (followUpA !== followUpB) {
                      return followUpA - followUpB;
                    }

                    // If follow_up_number is the same, sort by scheduled_at/created_at
                    const dateA = new Date(a.scheduled_at || a.created_at).getTime();
                    const dateB = new Date(b.scheduled_at || b.created_at).getTime();
                    return dateA - dateB;
                  })
                  .map((email, index) => (
                    <EmailComponent
                      key={index}
                      email={email}
                    />
                  ))}
              </div>
            )}


            {thread[0]?.channel === "Linkedin" && thread?.length !== 0 &&
              thread[0]?.connection_status === "CONNECTED" &&
              (!thread[thread.length - 1] || thread[thread.length - 1].status !== "TO-APPROVE") && (
                <LinkedInMessageBox />
              )}


            {(thread?.length === 0 ||
              (!thread?.[thread?.length - 1]?.is_reply && thread?.[thread?.length - 1]?.follow_up_number)) && (
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
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default ThreadDisplayMain;
