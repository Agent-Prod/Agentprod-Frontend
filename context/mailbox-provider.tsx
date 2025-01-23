import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";

export interface EmailMessage {
  comment: any;
  like_comment_date: any;
  id: string;
  conversation_id: string;
  received_datetime: Date | null;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  is_reply: boolean;
  send_datetime: Date | null;
  open_datetime: Date | null;
  click_datetime: Date | null;
  response_datetime: Date | null;
  status: string;
  sentiment: string | null;
  category: string | null;
  action_draft: string | null;
  message_id: string;
  approved: any;
  is_special: any;
  scheduled_datetime: string;
  created_at: any;
  referral: string;
  questions: any;
  delivered_datetime: any;
  bounce_datetime: any;
  spam_datetime: any;
  channel?: any;
  connected_on_linkedin?: any;
  linkedin_url?: any;
  connection_sent_time?: any;
  connection_accepted_time?: any;
  invite_message?: any;
  message_sent_with_invite?: any;
  scheduled_at?: any;
  follow_up_number?: number;
}

export interface Mailbox {
  conversationId: string;
  setConversationId: (id: string) => void;
  thread: EmailMessage[];
  setThread: (thread: EmailMessage[]) => void;
  recipientEmail: string;
  setRecipientEmail: (email: string) => void;
  senderEmail: string;
  setSenderEmail: (email: string) => void;
  isContextBarOpen: boolean;
  setIsContextBarOpen: (isOpen: boolean) => void;
}

const defaultState: Mailbox = {
  conversationId: "",
  setConversationId: () => { },
  thread: [],
  setThread: () => { },
  recipientEmail: "",
  setRecipientEmail: () => { },
  senderEmail: "",
  setSenderEmail: () => { },
  isContextBarOpen: false,
  setIsContextBarOpen: () => { },
};

// Creating the context
const MailboxContext = createContext<Mailbox>(defaultState);

interface MailboxProviderProps {
  children: ReactNode;
}

// Context provider component
export const MailboxProvider: React.FC<MailboxProviderProps> = ({
  children,
}) => {
  const [conversationId, setConversationId] = useState<string>(
    defaultState.conversationId
  );
  const [thread, setThread] = useState<EmailMessage[]>(defaultState.thread);
  const [recipientEmail, setRecipientEmail] = useState<string>(
    defaultState.recipientEmail
  );
  const [senderEmail, setSenderEmail] = useState<string>(
    defaultState.senderEmail
  );

  const [isContextBarOpen, setIsContextBarOpen] = useState<boolean>(
    defaultState.isContextBarOpen
  );

  const contextValue = useMemo(
    () => ({
      conversationId,
      setConversationId,
      thread,
      setThread,
      recipientEmail,
      setRecipientEmail,
      senderEmail,
      setSenderEmail,
      isContextBarOpen,
      setIsContextBarOpen,
    }),
    [conversationId, thread, recipientEmail, senderEmail, isContextBarOpen]
  );

  return (
    <MailboxContext.Provider value={contextValue}>
      {children}
    </MailboxContext.Provider>
  );
};

// Custom hook to use the mailbox context
export const useMailbox = () => useContext(MailboxContext);
