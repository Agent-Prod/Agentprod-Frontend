/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { LoadingCircle, SendIcon } from "../../icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: any;
}
export default function Home() {
  // const internalScrollRef = useRef<HTMLDivElement>(null);  // for auto scrolling to bottom
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUserContext();
  const [loader, setLoader] = useState(true);
  const [userEmail] = useState(user?.email);
  const [userId] = useState(user?.id);
  const [loading, setLoading] = useState(true);
  const [sallyLoad, setSallyLoad] = useState(false);
  const [allMessages, setAllMessages] = useState<Message[]>([
    // {
    //   id: Math.random().toString(),
    //   role: "assistant",
    //   content: `Hello! I'm Sally, your Sales Rep. I accelerate outbound sales with access to 250 million contacts and manage bespoke email campaigns to thousands. I also reply to queries and schedule meetings. Can I help you start your sales outreach?`,
    // },
  ]);

  // console.log("Id: ", userId);

  // console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  // const fetchUserIdFromEmail = async (email_id: string) => {
  //   const supabase = createClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  //   );

  //   let { data: allUsers } = await supabase
  //     .from("Users")
  //     .select("id")
  //     .eq("email", email_id);
  //   // console.log(allUsers);

  //   if (!allUsers?.length) {
  //     let { data: createdUser, error } = await supabase
  //       .from("Users")
  //       .insert([
  //         {
  //           email: email_id,
  //           user_info: {
  //             email: email_id,
  //             timezone: null,
  //             real_name: null,
  //             profession: null,
  //             display_name: null,
  //             profile_image: null,
  //           },
  //           source: "web",
  //         },
  //       ])
  //       .select("id");

  //     if (error) {
  //       console.error(error);
  //     } else if (createdUser && createdUser[0].id) {
  //       setUserId(createdUser[0].id);
  //       let { data: tokenUsers, error: tokenTableError } = await supabase
  //         .from("UserTokens")
  //         .insert([{ user_id: createdUser[0].id }]);

  //       if (tokenTableError) {
  //         console.error(tokenTableError);
  //       }
  //     }
  //   }

  //   if (allUsers && allUsers[0].id) setUserId(allUsers[0].id);
  // };

  function formatDate(created_at: any) {
    // Ensure createdAt is a valid date
    if (!created_at) return "No date provided";

    const date = new Date(created_at);
    if (isNaN(date.getTime())) return "Invalid date"; // Check if the date is valid

    const IST_OFFSET = 330; // Indian Standard Time offset in minutes
    const now = new Date();
    const past = new Date(date.valueOf() + IST_OFFSET * 60000);
    if (now.toDateString() === past.toDateString()) {
      return past.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === past.toDateString()) {
      return "Yesterday";
    }
    return past.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  const now = new Date(); // Get the current date and time
  const recentDate = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata", // Set the timezone to IST
    hour: "2-digit", // Specify the hour format
    minute: "2-digit", // Specify the minute format
    hour12: true, // Use 12-hour format
  });

  useEffect(() => {
    if (!userId) return;
    const fetchMessages = () => {
      axiosInstance
        .get(`v2/conversation/${userId}`)
        .then((response) => {
          const adaptedMessages = response.data.map((msg: any) => ({
            ...msg,
            createdAt: msg.created_at,
          }));

          setAllMessages(adaptedMessages);
          setLoader(false);
        })
        .catch((error) => { });
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (userId) {
      setLoading(false);
    }
  }, [userId]);

  // useEffect(() => {
  //   try {
  //     fetchUserIdFromEmail(userEmail);
  //     setMessages([
  //       {
  //         id: Math.random().toString(),
  //         type: "assistant",
  //         content: JSON.stringify({
  //           content: `👋 Hey, I'm Agentprod, your AI work assistant! First, allow me to showcase Agentprod's capabilities, designed to supercharge your workflow.`,
  //           buttons: [
  //             {
  //               buttonTitle: "Check out our website",
  //               url: "https://agentprod.com",
  //             },
  //           ],
  //         }),
  //       },
  //       {
  //         id: Math.random().toString(),
  //         type: "assistant",
  //         content: JSON.stringify({
  //           content: `Let's connect to apps! Once you are authenticated you will be prompted to try some tasks`,
  //           buttons: [
  //             {
  //               buttonTitle: "Google Login",
  //               url: `hello.com/test`,
  //             },
  //           ],
  //         }),
  //       },
  //       // {
  //       //   id: Math.random().toString(),
  //       //   type: "user",
  //       //   content: "How much revenue did we close this month?",
  //       // },
  //     ]);
  //     setAllMessages(messagesFromBackend.data);
  //   } catch (err) {
  //     console.log("Something went wrong!", err);
  //   }
  // }, []);

  useEffect(() => {
    try {
      if (allMessages) {
        setMessages(allMessages);
      }
    } catch (err) {
      // console.log("Something went wrong!", err);
    }
  }, [allMessages]);

  // TODO: add chat history for a user
  const { messages, input, setInput, handleSubmit, isLoading, setMessages } =
    useChat({
      api: `${process.env.NEXT_PUBLIC_SERVER_URL}v2/chat/completion`,
      body: {
        user_id: userId,
        content: inputRef.current?.value,
      },

      onResponse: async (response) => {
        console.log("here");

        if (response.status === 429) {
          toast.error("You have reached your request limit for the day.");
          va.track("Rate limited");
          setSallyLoad(false);
          console.log("here");

          return;
        } else {
          const assistantResponse = await response.json();
          va.track("Chat initiated");
          setSallyLoad(false);
          console.log("here");

          // console.log(assistantResponse);
          setAllMessages((prevMessages: Message[]) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              role: "assistant",
              content: assistantResponse,
            },
          ]);
          // setSallyLoad(false);
        }
      },
      onError: (error) => {
        va.track("Chat errored", {
          input,
          error: error.message,
        });
        setSallyLoad(false);
      },
      onFinish(message) {
        // console.log(message);
      },
    });

  useEffect(() => { }, [inputRef.current?.value]);

  const disabled = isLoading || input.length === 0;

  // useEffect(() => { // for auto scrolling to bottom
  //   if (internalScrollRef.current) {
  //     internalScrollRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "end",
  //     });
  //   }
  // });

  return (
    <div className="flex flex-col-reverse overflow-y-scroll h-screen chat">
      <main className="flex flex-col items-center justify-between pb-20 mb-20">
        {messages.length > 0 ? (
          messages.map(
            (message, i) =>
              message && (
                <div
                  key={i}
                  className={clsx(
                    "flex w-full items-center justify-center py-4"
                    // message.type === "user" ? "bg-black" : "bg-black/5",
                  )}
                >
                  <div
                    className={clsx(
                      "flex w-full max-w-screen-lg items-start space-x-4 px-5 sm:px-0",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={clsx(
                        "p-1.5 text-white",
                        message.role === "assistant" ? "" : ""
                      )}
                    >
                      {message.role === "user" ? (
                        <Avatar className="flex h-7 w-7 items-center justify-center space-y-0 border bg-white">
                          <AvatarImage src="/user.png" alt="user" />
                          {/* <AvatarFallback>NB</AvatarFallback> */}
                        </Avatar>
                      ) : (
                        <Avatar className="flex h-7 w-7 items-center justify-center space-y-0 border">
                          {/* <AvatarFallback>JL</AvatarFallback> */}
                          <AvatarImage
                            src="/ai-sales-rep.png"
                            alt="agentprod logo"
                          />
                          {/* <Image
                        // className="mx-auto"
                        width={100}
                        height={100}
                        src={"/bw-logo.png"}
                        alt="AgentProd"
                      /> */}
                        </Avatar>
                      )}
                    </div>
                    <div
                      className={clsx(
                        "flex flex-col !mr-3 space-y-1",
                        message.role === "assistant"
                          ? "items-start"
                          : "items-end"
                      )}
                    >
                      <span className="text-xs">
                        {message.role === "assistant"
                          ? "Sally"
                          : user?.firstName}{" "}
                        {formatDate(message?.createdAt) === "No date provided"
                          ? recentDate
                          : formatDate(message?.createdAt)}
                      </span>
                      <div className="flex flex-col px-4 py-3 dark:bg-[#212121] bg-[#efefef] rounded-xl max-w-3xl">


                        <ReactMarkdown
                          className="prose mt-1 text-base dark:text-[#ECECEC] leading-loose w-full break-words prose-p:leading-relaxed "
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // open links in new tab
                            a: (props) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            ),
                          }}
                        >
                          {message.content &&
                            message.content.replace("Assistant: ", "")}
                        </ReactMarkdown>

                        {/* <div
                      className={clsx(
                        "button-container mt-4",
                        message.type === "assistant" ? "pb-4" : "pb-0"
                      )}
                    >
                      {message.type === "assistant" &&
                      JSON.parse(message.message).buttons
                        ? JSON.parse(message.message).buttons.map(
                            (button: any, index: number) => (
                              <a
                                key={index}
                                href={button.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md border border-gray-200 bg-white px-3 sm:px-5 py-2 sm:py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50 ml-1 sm:ml-2"
                              >
                                {button.buttonTitle}
                              </a>
                            )
                          )
                        : null}
                    </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              )
          )
        ) : loader ? (
          <div className="flex flex-col  h-full w-full pt-40 px-52 space-y-8">
            <div className="flex justify-start  space-x-4 animate-pulse">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>

            <div className="flex justify-end space-x-4 animate-pulse">
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            <div className="flex justify-start  space-x-4 animate-pulse">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>

            <div className="flex justify-end  space-x-4 animate-pulse">
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            <div className="flex justify-start  space-x-4 animate-pulse">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>
            <div className="flex justify-end  space-x-4 animate-pulse">
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center h-screen items-center">
            No messages yet. Start by typing a message in the input field below.
          </div>
        )}
        <div className="fixed bottom-0 flex w-[85%]   flex-col items-center space-y-3 p-5 pb-3 sm:px-0">
          <div className="flex ">
            {sallyLoad && (
              <div className="w-screen pl-60 text-start italic font-thin dark:text-white/60">
                Sally is typing ...
              </div>
            )}
          </div>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              setAllMessages([
                ...allMessages,
                {
                  id: Math.random().toString(),
                  role: "user",
                  content: input,
                },
              ]);
              // console.log(allMessages);
              handleSubmit(e);
            }}
            className="relative w-full max-w-screen-md rounded-xl border px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4 flex dark:bg-[#09090b] bg-white"

          >
            <Input
              ref={inputRef}
              tabIndex={0}
              required
              autoFocus
              placeholder="Send a message"
              value={input}
              disabled={userEmail === "" || loading || isLoading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  formRef.current?.requestSubmit();
                  e.preventDefault();
                  setSallyLoad(true);
                }
              }}
              spellCheck={false}
              className="w-full px-5 focus:outline-none"
            />
            {/* <Textarea
              ref={inputRef}
              tabIndex={0}
              required
              rows={1}
              autoFocus
              placeholder="Send a message"
              value={input}
              disabled={userEmail === "" || loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  formRef.current?.requestSubmit();
                  e.preventDefault();
                }
              }}
              spellCheck={false}
              className="w-full pr-10 focus:outline-none"
            /> */}
            <Button
              type="submit"
              variant={"outline"}
              className="ml-3"
              disabled={isLoading}
              onClick={() => {
                setSallyLoad(true);
              }}
            >
              {loading || isLoading ? (
                <LoadingCircle />
              ) : (
                <SendIcon className={clsx("h-4 w-4")} />
              )}
            </Button>
            {/* <button
              className={clsx(
                "absolute inset-y-0 right-5 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
                disabled
                  ? "cursor-not-allowed bg-white"
                  : "bg-green-500 hover:bg-green-600"
              )}
              disabled={disabled}
            >
              {loading || isLoading ? (
                <LoadingCircle />
              ) : (
                <SendIcon
                  className={clsx(
                    "h-4 w-4",
                    input.length === 0 ? "text-gray-300" : "text-white"
                  )}
                />
              )}
            </button> */}
          </form>
          {/* <p className="text-center text-xs text-gray-400">
         This is a playground environment
        </p> */}
        </div>
        {/* <button
          onClick={() => {
            console.log("isLoading ", isLoading);
            console.log("Loading ", loading);
            console.log(userEmail);
          }}
        >
          LOG
        </button> */}
      </main>
    </div>
  );
}
