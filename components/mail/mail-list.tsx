/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useMemo, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMail } from "@/hooks/useMail";
import { Conversations } from "./mail";
import { useMailbox } from "@/context/mailbox-provider";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "@/context/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Ban,
  Bell,
  CalendarCheck,
  Forward,
  LinkedinIcon,
  Mail,
  MailPlus,
  ThumbsDown,
  ThumbsUp,
  TimerReset,
  Trash2Icon,
  UserX,
} from "lucide-react";
import { MdForwardToInbox } from "react-icons/md";
import { toast } from "sonner";
import { LoadingCircle } from "@/app/icons";


interface MailListProps {
  items: Conversations[];
  selectedMailId: string | null;
  setSelectedMailId: (id: string | null) => void;
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  onDeleteMail: (id: string) => Promise<void>;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const time = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
  };
  const formattedDate = new Intl.DateTimeFormat("en-GB", dateOptions).format(
    date
  );
  return `${time}, ${formattedDate}`;
};

const MailList: React.FC<MailListProps> = ({
  items,
  selectedMailId,
  setSelectedMailId,
  hasMore,
  loading,
  loadMore,
  onDeleteMail
}) => {
  const [selectedStatus] = React.useState("all");
  const [mail, setMail] = useMail();
  const [hoveredMailId, setHoveredMailId] = React.useState<string | null>(null);
  const { setConversationId, setRecipientEmail, setSenderEmail } = useMailbox();
  const { user } = useUserContext();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        selectedStatus === "all" ||
        item.status.toLowerCase() === selectedStatus.toLowerCase()
    );
  }, [items, selectedStatus]);

  useEffect(() => {
    if (user?.id) {
      axiosInstance
        .get(`/v2/mailbox/${user.id}`)
        .then((response) => {
          console.log("Mailbox data fetched:", response.data);
        })
        .catch((error) => {
          console.error("Error fetching mailbox:", error);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  const handleMailClick = useCallback(
    (item: Conversations) => {
      setMail((prevMail) => ({ ...prevMail, selected: item.id }));
      setSelectedMailId(item.id);
      setConversationId(item.id);
      setRecipientEmail(item.recipient);
    },
    [setMail, setSelectedMailId, setConversationId, setRecipientEmail]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await onDeleteMail(id);
      } catch (error) {
        console.error("Failed to delete mail:", error);
        toast.error("Failed to delete mail");
      }
    },
    [onDeleteMail]
  );

  const renderMailItem = useCallback(
    (item: Conversations) => {
      const getCategoryBadge = (category: string) => {
        const categoryMap: {
          [key: string]: { color: string; icon: React.ReactNode };
        } = {
          Positive: {
            color: "bg-green-400",
            icon: <ThumbsUp className="h-[14px] w-[14px] scale-x-100" />,
          },
          "Information Required": {
            color: "bg-green-600",
            icon: <MailPlus className="h-[14px] w-[14px] scale-x-100" />,
          },
          Negative: {
            color: "bg-red-600",
            icon: <ThumbsDown className="h-[14px] w-[14px] -scale-x-100" />,
          },
          OOO: {
            color: "bg-yellow-600",
            icon: <UserX className="h-[14px] w-[14px] scale-x-100" />,
          },
          Forwarded: {
            color: "bg-blue-600",
            icon: <Forward className="h-[14px] w-[14px] scale-x-100" />,
          },
          "Forwarded to": {
            color: "bg-blue-400",
            icon: (
              <MdForwardToInbox className="h-[14px] w-[14px] scale-x-100" />
            ),
          },
          Neutral: {
            color: "bg-yellow-300",
            icon: <Bell className="h-[14px] w-[14px] scale-x-100" />,
          },
          Demo: {
            color: "bg-purple-600",
            icon: <CalendarCheck className="h-[14px] w-[14px] scale-x-100" />,
          },
          Later: {
            color: "bg-orange-600",
            icon: <TimerReset className="h-[14px] w-[14px] scale-x-100" />,
          },
          "Not Interested": {
            color: "bg-red-600",
            icon: <ThumbsDown className="h-[14px] w-[14px] -scale-x-100" />,
          },
          Block: {
            color: "bg-red-600",
            icon: <Ban className="h-[14px] w-[14px] -scale-x-100" />,
          },
        };

        const { color, icon } = categoryMap[category.trim()] || {
          color: "",
          icon: null,
        };

        return (
          <Badge className={`gap-1 text-xs items-center rounded-full ${color}`}>
            {icon}
            {category.trim() === "Later"
              ? "Later"
              : category.trim() === "Information Required"
                ? "Info Req"
                : category.trim() === "Not Interested"
                  ? "Disinterested"
                  : category.trim() === "Forwarded"
                    ? "Referral"
                    : category.trim() === "Forwarded to"
                      ? "Forwarded"
                      : category}
          </Badge>
        );
      };

      return (
        <button
          key={item.id}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
            selectedMailId === item.id && "bg-muted"
          )}
          onClick={() => handleMailClick(item)}
          onMouseEnter={() => setHoveredMailId(item.id)}
          onMouseLeave={() => setHoveredMailId(null)}
        >
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Avatar className="flex h-8 w-8 items-center justify-center space-y-0 border bg-white">
                  <AvatarImage src={item.photo_url || ""} alt="avatar" />
                  <AvatarFallback className="bg-yellow-400 text-black text-xs">
                    {item.name
                      ? item.name
                        .split(" ")
                        .map((namePart, index, arr) =>
                          index === 0 || (index === 1 && arr.length > 1)
                            ? namePart[0]
                            : ""
                        )
                        .join("")
                      : ""}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold w-72 truncate">{`${item.name || "unknown"
                  } from ${item.company_name || "unknown company"}`}</div>
                <span className="text-xs">
                  {item.category && getCategoryBadge(item.category)}
                </span>
              </div>
              <div
                className={cn(
                  "ml-auto text-xs flex gap-2 items-center",
                  selectedMailId === item.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.subject === "" ? (
                  <LinkedinIcon className="w-3 h-3 text-white" />
                ) : (
                  <Mail className="w-3 h-3 text-white" />
                )}
                <span className="text-xs text-gray-400">
                  {item.updated_at && formatDate(item.updated_at)}
                </span>
              </div>
            </div>
            <div className="text-xs font-medium ml-10">{item.subject}</div>
            <div className="line-clamp-2 text-xs text-muted-foreground ml-10 flex flex-row justify-between items-center">
              {(item.body_substr as string)?.substring(0, 80)}
              {hoveredMailId === item.id && (
                <Trash2Icon
                  className="w-4 h-4 dark:hover:text-white hover:text-black cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                />
              )}
            </div>
          </div>
        </button>
      );
    },
    [selectedMailId, hoveredMailId, handleDelete, handleMailClick]
  );

  return (
    <ScrollArea className="h-screen pb-44">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {filteredItems.length > 0 ? (
          <>
            {filteredItems.map(renderMailItem)}
            {hasMore && (
              <div ref={ref} className="h-10 flex justify-center items-center">
                {loading && <LoadingCircle />}
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground text-center mt-10">
            No Mails Available
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default React.memo(MailList);
