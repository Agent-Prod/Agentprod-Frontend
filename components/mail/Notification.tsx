/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
  Archive,
  Bell,
  CalendarCheck,
  CalendarPlus,
  Check,
  Clock3,
  Edit3,
  Forward,
  LinkedinIcon,
  ListTodo,
  Mail,
  MailPlus,
  MailQuestion,
  MailWarning,
  RefreshCw,
  SendHorizontal,
  ThumbsDown,
  ThumbsUp,
  TimerReset,
  Trash2,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MdInfoOutline, MdOutlineScheduleSend } from "react-icons/md";
import { GoCrossReference } from "react-icons/go";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useLeads } from "@/context/lead-user";
import { useUserContext } from "@/context/user-context";
import { Button } from "../ui/button";
import { useMailbox } from "@/context/mailbox-provider";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { LoadingCircle } from "@/app/icons";
import { parseActionDraft } from "./parse-draft";

interface EmailMessage {
  id: any;
  conversation_id: any;
  received_datetime: any;
  sender: any;
  recipient: any;
  subject: any;
  body: any;
  is_reply: any;
  send_datetime: any;
  open_datetime: any;
  click_datetime: any;
  response_datetime: any;
  status: any;
  sentiment: any;
  category: any;
  action_draft: any;
  message_id: any;
  approved: any;
  is_special: any;
  scheduled_datetime: string;
  referral: string;
  questions: any;
  delivered_datetime: any;
  bounce_datetime: any;
  spam_datetime: any;
  channel?: any;
  connected_on_linkedin?: any;
}

interface NotificationProps {
  email: EmailMessage;
}

const Notification: React.FC<NotificationProps> = ({ email }) => {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [editable, setEditable] = React.useState(false);
  const [isLoadingButton, SetIsLoadingButton] = React.useState(false);
  const [loadingSmartSchedule, setLoadingSmartSchedule] = React.useState(false);
  const [questions, setQuestions] = React.useState([]);
  const [loadingQuestion, setLoadingQuestions] = React.useState(false);
  const [errorQuestion, setErrorQuestions] = React.useState(false);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [answerLoading, setAnswerLoading] = React.useState(false);
  const { leads } = useLeads();
  const { user } = useUserContext();
  const internalScrollRef = React.useRef<HTMLDivElement>(null);

  console.log(email)

  const {
    conversationId,
    thread,
    setThread,
    recipientEmail,
    senderEmail,
    setIsContextBarOpen,
    setConversationId,
  } = useMailbox();

  React.useEffect(() => {
    if (internalScrollRef.current) {
      internalScrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [email]);

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

  const messageId =
    email.category === "Information Required" && email.message_id;

  React.useEffect(() => {
    if (
      email.category === "Information Required" &&
      email.questions?.questions
    ) {
      setQuestions(email.questions.questions);
    } else {
      setQuestions([]); // Reset questions if not applicable
    }
  }, [email]);

  // React.useEffect(() => {
  //   if (email.is_reply && email?.category === "Information Required") {
  //     setLoadingQuestions(true);
  //     axiosInstance
  //       .get(`v2/questions/${messageId}`)
  //       .then((response) => {
  //         setQuestions(response.data.questions.questions);
  //         setLoadingQuestions(false);
  //       })
  //       .catch((error) => {
  //         console.error("Failed to fetch questions", error);
  //         setErrorQuestions(true);
  //         setLoadingQuestions(false);
  //       });
  //   }
  // }, [email.category, email.is_reply, messageId]);

  React.useEffect(() => {
    if (email.action_draft) {
      const lastSubject = thread[thread.length - 1].subject;
      const newSubject = lastSubject.startsWith("Re:") ? lastSubject : `Re: ${lastSubject}`;
      setTitle(newSubject);
      setBody(email.action_draft);
    }
  }, [email.action_draft]);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleGenerateResponse = () => {
    setAnswerLoading(true);
    axiosInstance
      .post("/v2/answers", {
        user_id: user.id,
        questions,
        answers,
      })
      .then((response) => {
        console.log("Response submitted successfully", response);
        return axiosInstance.post("/v2/send-info", {
          messageId,
          to: email.category === "Information Required" && email.recipient,
          from: email.category === "Information Required" && email.sender,
          subject: email.category === "Information Required" && email.subject,
          content: email.category === "Information Required" && email.body,
        });
      })
      .then((response) => {
        toast.success("Response submitted successfully");
        console.log("Info sent successfully", response);
      })
      .catch((error) => {
        console.error("Failed to submit response or send info", error);
      })
      .finally(() => {
        setAnswerLoading(false);
      });
  };

  const regenrate = React.useCallback(() => {
    const payload = {
      follow_up_number: 3,
      user_id: user.id,
      previous_emails: [
        {
          subject: title,
          body: body,
        },
      ],
    };

    axiosInstance
      .post("v2/training/autogenerate/followup", payload)
      .then((response) => {
        const newSubject = response.data.subject.startsWith("Re:")
          ? response.data.subject
          : `Re: ${title}`;
        setTitle(newSubject);
        // setTitle(response.data.subject);
        setBody(response.data.body);
        toast.success("Draft Regenerated!!");
      })
      .catch((error) => {
        console.error("Error fetching followup data:", error);
      });
  }, [user.id, title, body]);

  const cleanedCategory = email?.category?.trim();

  const handleSendNow = () => {
    SetIsLoadingButton(true);
    const payload = {
      conversation_id: conversationId,
      sender: senderEmail,
      recipient: recipientEmail,
      subject: title,
      body: body
    };
    console.log("Payload of sending", payload);

    axiosInstance
      .post("/v2/mailbox/send/immediately", payload)
      .then((response) => {
        toast.success("Your email has been sent successfully!");
        setThread(response.data);
        SetIsLoadingButton(false);
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
        setEditable(false);
      })
      .catch((error) => {
        console.error("Failed to delete draft:", error);
        toast.error("Failed to delete the draft. Please try again.");
      });
  };

  function getTimeDifference(utcTimestamp: any) {
    const utcDate = new Date(utcTimestamp);
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate: any = new Date(utcDate.getTime() + istOffset);

    const currentDate: any = new Date();
    const currentDateInIST: any = new Date(currentDate.getTime() + istOffset);
    const deltaDays = Math.ceil(
      (istDate - currentDateInIST) / (1000 * 60 * 60 * 24)
    );

    const deltaYears = istDate.getFullYear() - currentDateInIST.getFullYear();
    const deltaMonths =
      deltaYears * 12 + (istDate.getMonth() - currentDateInIST.getMonth());

    if (deltaDays < 30) {
      return `${deltaDays} days later`;
    } else {
      return `${deltaMonths} months later`;
    }
  }

  const handleSaveChanges = () => {
    SetIsLoadingButton(true);
    const payload = {
      conversation_id: conversationId,
      action_draft: body,
    };

    axiosInstance.patch(`/v2/mailbox/action_draft/update?_id=${email.id}`, payload)
      .then((response) => {
        toast.success("Draft updated successfully!");
        setEditable(false);
        // Update the email object with the new data if necessary
        // setEmail(response.data);
      })
      .catch((error) => {
        console.error("Failed to update draft:", error);
        toast.error("Failed to update the draft. Please try again.");
      })
      .finally(() => {
        SetIsLoadingButton(false);
      });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {email.is_special && email?.category?.trim() !== "Forwarded to" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              {email.is_special === true && (
                <MdOutlineScheduleSend className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <p className="ml-1 text-xs">
              {email.is_special === true &&
                `Sally has scheduled this message as requested by ${leads.length > 0 && leads[0].first_name
                  ? leads[0].first_name
                  : ""
                }.`}
            </p>
          </div>
        </div>
      )}

      {email.category && email.category.trim() === "Forwarded to" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <GoCrossReference className="h-4 w-4 text-gray-400" />
            </div>
            <p className="ml-1 text-xs">
              Sally obtained this lead through a referral.
            </p>
          </div>
        </div>
      )}

      {email?.category && email.is_reply && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              {cleanedCategory === "OOO" && (
                <UserX className="h-4 w-4 text-gray-400" />
              )}
              {cleanedCategory === "Information Required" &&
                email.is_special && (
                  <MdInfoOutline className="h-4 w-4 text-gray-400" />
                )}
              {cleanedCategory === "Positive" && (
                <ThumbsUp className="h-4 w-4 text-gray-400" />
              )}
              {cleanedCategory === "Negative" && (
                <MailWarning className="h-4 w-4 text-gray-400" />
              )}
              {cleanedCategory === "Forwarded" && (
                <Forward className="h-4 w-4 text-gray-400" />
              )}
              {cleanedCategory === "Later" && (
                <MailQuestion className="h-4 w-4 text-gray-400" />
              )}
              {cleanedCategory === "Demo" && (
                <CalendarPlus className="h-4 w-4 text-gray-400" />
              )}
              {cleanedCategory === "Neutral" && (
                <Mail className="h-4 w-4 text-gray-400" />
              )}

              {/* Adding new Categories */}
              {cleanedCategory === "Block" && (
                <MailWarning className="h-4 w-4 text-gray-400" />
              )}
              {cleanedCategory === "Not Interested" && (
                <MailWarning className="h-4 w-4 text-gray-400" />
              )}
              {/* Adding new Categories */}
            </div>
            <p className="ml-1 text-xs">
              {cleanedCategory === "OOO" && `Currently out of office.`}
              {cleanedCategory === "Information Required" &&
                email.is_special &&
                `Sally got the answers from your sales knowldege documents.
`}
              {cleanedCategory === "Positive" && "Positive response received."}
              {cleanedCategory === "Negative" && "Negative feedback received."}
              {cleanedCategory === "Forwarded" &&
                `This message has been forwarded to ${email?.referral} `}
              {/* {cleanedCategory === "Later" &&
                  `Follow up with ${
                    leads.length > 0 && leads[0].first_name
                      ? leads[0].first_name
                      : ""
                  } in ${getTimeDifference(
                    email?.scheduled_datetime
                  )} as requested.`} */}

              {cleanedCategory === "Later" &&
                email.is_special &&
                `A follow-up interaction with ${leads.length > 0 && leads[0].first_name
                  ? leads[0].first_name
                  : "the lead"
                } has been scheduled for ${getTimeDifference(
                  email?.scheduled_datetime
                )}`}

              {cleanedCategory === "Later" &&
                !email.is_special &&
                `Follow up with ${leads.length > 0 && leads[0].first_name
                  ? leads[0].first_name
                  : ""
                }  as requested.`}

              {cleanedCategory === "Demo" &&
                "Demo scheduling requested by client."}
              {cleanedCategory === "Neutral" && "Neutral response received."}

              {/* Adding new Categories */}
              {cleanedCategory === "Block" &&
                `${leads.length > 0 && leads[0].first_name
                  ? leads[0].first_name
                  : ""
                }  has been blocked.`}
              {cleanedCategory === "Not Interested" &&
                `${leads.length > 0 && leads[0].first_name
                  ? leads[0].first_name
                  : ""
                } has expressed no interest.`}
              {/* Adding new Categories */}
            </p>
            <span className="text-gray-600 text-sm">
              {formatDate(email.received_datetime) || null}
            </span>
          </div>

          {email?.action_draft && !email.approved && (
            <div className="flex w-full">
              <Avatar className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white mr-4">
                <AvatarFallback className="bg-yellow-400 text-black text-xs">
                  {user?.firstName && user.lastName
                    ? user.firstName.charAt(0) + user.lastName.charAt(0)
                    : ""}
                </AvatarFallback>
              </Avatar>
              <Card className={`w-full mr-7`}>
                <div className="flex gap-4 p-4">
                  <span className="text-sm font-semibold">
                    {leads.length > 0 && leads[0].first_name
                      ? "You to " + leads[0].first_name
                      : ""}
                  </span>
                  <span className="text-gray-600 text-sm ">
                    {formatDate(email.received_datetime) || null}
                  </span>
                  <div className="flex gap-3">
                    {!email.approved ? (
                      <span className="text-green-500 text-sm ">Draft</span>
                    ) : null}
                  </div>
                </div>
                <CardHeader className="-mt-8 -ml-3">
                  {email.subject === "" ? (<></>) : (<CardTitle className="text-sm flex flex-col ">
                    <Input
                      className="text-xs"
                      disabled={true}
                      placeholder="Subject"
                      value={title}
                    />
                  </CardTitle>)}
                </CardHeader>
                <CardContent className="text-xs -ml-3 -mt-2">
                  <Textarea
                    className="text-xs h-40"
                    disabled={!editable}
                    placeholder="Enter email body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </CardContent>

                {!email?.approved && (
                  <CardFooter className="flex justify-between text-xs items-center">
                    <div>
                      <Button
                        variant={"secondary"}
                        className="-ml-2"
                        onClick={handleSendNow}
                      >
                        {isLoadingButton ? <LoadingCircle /> : "Send Now"}
                      </Button>
                      {editable && (
                        <Button
                          variant={"ghost"}
                          onClick={handleSaveChanges}
                          disabled={isLoadingButton}
                        >
                          {isLoadingButton ? <LoadingCircle /> : <Check className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                    <div>
                      <Button
                        variant={"ghost"}
                        onClick={() => setEditable(true)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant={"ghost"} onClick={regenrate}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant={"ghost"} onClick={handleDeleteDraft}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
              <div ref={internalScrollRef} />
            </div>
          )}

          {/* {cleanedCategory === "Negative" && (
            <div className="flex items-center gap-3">
              <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                {cleanedCategory === "Negative" && (
                  <MailWarning className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <p className="ml-1 text-xs">
                {cleanedCategory === "Negative" &&
                  ` ${
                    leads.length > 0 && leads[0].first_name
                      ? leads[0].first_name
                      : ""
                  } was blocked because of a negative reply.`}
              </p>
              <span className="text-gray-600 text-sm">
                {formatDate(email.received_datetime) || null}
              </span>
            </div>
          )} */}
          {/* {cleanedCategory === "Demo" && (
            <div className="flex items-center gap-3">
              <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                {cleanedCategory === "Demo" && (
                  <CalendarCheck className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <p className="ml-1 text-xs">
                {cleanedCategory === "Demo" &&
                  ` Sally is scheduling meeting with ${
                    leads.length > 0 && leads[0].first_name
                      ? leads[0].first_name
                      : ""
                  } .`}
              </p>
              <span className="text-gray-600 text-sm">
                {formatDate(email.received_datetime) || null}
              </span>
            </div>
          )} */}
        </div>
      )}

      {email.is_reply &&
        email?.category === "Information Required" &&
        questions.length > 0 && (
          <div>
            <div className="flex items-center gap-3">
              <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                <ListTodo className="h-4 w-4 text-gray-400" />
              </div>
              <p className="ml-1 text-xs">
                <span className="text-gray-500">Todo: </span> Respond to ask
                question
              </p>
            </div>

            <div className="flex gap-2 flex-col h-full">
              {loadingQuestion ? (
                <div className="flex w-full mr-4">
                  <Card className="w-full mr-5 ml-12 p-4 flex flex-row justify-between items-center">
                    <span className="text-xs w-2/3">Loading...</span>
                  </Card>
                </div>
              ) : errorQuestion ? (
                <div className="flex w-full mr-4">
                  <Card className="w-full mr-5 ml-12 p-4 flex flex-row justify-between items-center">
                    <span className="text-xs w-2/3">
                      Unable to load questions. Please try again later.
                    </span>
                  </Card>
                </div>
              ) : (
                questions.map((question, index) => (
                  <div key={index} className="flex w-full mr-4">
                    <Card className="w-full mr-5 ml-12 p-4 flex flex-row justify-between items-center">
                      <span className="text-xs w-2/3">{question}</span>
                      <Input
                        className="w-1/3"
                        placeholder="Answer"
                        value={answers[index] || ""}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                      />
                    </Card>
                  </div>
                ))
              )}

              <Button
                className="ml-12 w-48 flex gap-2 items-center"
                variant="secondary"
                onClick={handleGenerateResponse}
              >
                <span>
                  {answerLoading ? <LoadingCircle /> : "Generate response"}
                </span>
              </Button>
            </div>
          </div>
        )}
      {/* 
      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "scheduled" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Bell className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              {email && email.scheduled_datetime
                ? `Your draft has been scheduled to be sent at
                ${formatDate(email.scheduled_datetime)}`
                : "Your draft has been scheduled to be sent"}
            </p>
          </div>
        )} */}
      {email?.scheduled_datetime && (
        <div className="flex items-center gap-3">
          <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
            <Bell className="h-4 w-4 text-gray-400" />
          </div>
          <p className="ml-1 text-xs">
            {email.status?.toLowerCase() === "scheduled"
              ? `Your draft has been scheduled to be sent at ${formatDate(
                email.scheduled_datetime
              )}`
              : `Your draft was scheduled to be sent at ${formatDate(
                email.scheduled_datetime
              )}`}
          </p>
        </div>
      )}

      {(email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "request") ||
        ((email.send_datetime || email.delivered_datetime) && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <SendHorizontal className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Your message has been successfully sent.
            </p>
            <span className="text-gray-400 text-xs">
              {email.send_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.send_datetime)}
                </span>
              )}
            </span>
          </div>
        ))}

      {/* {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "sent" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <SendHorizontal className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Your message has been successfully sent.
            </p>
            <span className="text-gray-400 text-xs">
              {email.send_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.send_datetime)}
                </span>
              )}
            </span>
          </div>
        )} */}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "delivered" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            {email.channel === "Linkedin"
              ? <p className="ml-1 text-xs">Message was delivered to recipient&apos;s LinkedIn</p>
              : <p className="ml-1 text-xs">Mail was delivered to recipient&apos;s inbox</p>}
            <span className="text-gray-400 text-xs">
              {email.send_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.send_datetime) || null}
                </span>
              )}
            </span>
          </div>
        )}

      

      {email?.status &&
        !email.is_reply &&
        (email?.status?.toLowerCase() === "opened" || email.open_datetime) && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Recipient opened the mail.
            </p>
            <span className="text-gray-400 text-xs">
              {email.open_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.open_datetime)}
                </span>
              )}
            </span>
          </div>
        )}


      {(email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "click") ||
        (email.click_datetime && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">Recipient clicked on the mail.</p>
            <span className="text-gray-400 text-xs">
              {email.click_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.click_datetime)}
                </span>
              )}
            </span>
          </div>
        ))}


      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "unique_opened" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Receipent opened your email for the first time on{" "}
              {formatDate(email.open_datetime)}.
            </p>
            <span className="text-gray-400 text-xs">
              {email.open_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.open_datetime)}
                </span>
              )}
            </span>
          </div>
        )}
      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "proxy_open" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">Email was opened through a proxy.</p>
            <span className="text-gray-400 text-xs">
              {email.open_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.open_datetime)}
                </span>
              )}
            </span>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "pending" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              This message will be available in TODO when the time is right.
            </p>
            <span className="text-gray-400 text-xs">
              {email.click_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.click_datetime)}
                </span>
              )}
            </span>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "deferred" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <SendHorizontal className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">Message delivery has been delayed.</p>
            <span className="text-gray-400 text-xs">
              {email.send_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.send_datetime)}
                </span>
              )}
            </span>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "soft_bounce" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Archive className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Temporary delivery failure occurred.
            </p>
          </div>
        )}
      {email?.status &&
        !email.is_reply && email?.status?.toLowerCase() === "hard_bounce" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Archive className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Permanent delivery failure occurred.
            </p>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "unsubscribed" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Archive className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Recipient has unsubscribed from further communications.
            </p>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "complain"
        && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Recipient marked the email as spam.
            </p>
          </div>
        )}
      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "invalid_email" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              The recipient&apos;s email address is invalid.
            </p>
          </div>
        )}
      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "blocked" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              Email was blocked by the recipient&apos;s server.
            </p>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "error" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">
              An error occurred while sending the email.
            </p>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "TO-APPROVE" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <Clock3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className=" ml-1 text-xs ">Recipient opened the email.</p>
            <span className="text-gray-400 text-xs">
              {email.open_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.open_datetime)}
                </span>
              )}
            </span>
          </div>
        )}

      {email?.status &&
        !email.is_reply &&
        email?.status?.toLowerCase() === "marked as spam" && (
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
              <MailWarning className="h-4 w-4 text-gray-400" />
            </div>
            <p className="ml-1 text-xs">
              This email was marked as spam by the recipient.
            </p>
            <span className="text-gray-400 text-xs">
              {email.spam_datetime && (
                <span className="text-gray-400 text-xs">
                  {formatDate(email.spam_datetime)}
                </span>
              )}
            </span>
          </div>
        )}
    </div>
  );
};

export default Notification;