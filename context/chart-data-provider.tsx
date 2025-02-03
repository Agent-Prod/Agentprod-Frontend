/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "./auth-provider";

interface MailGraphData {
  id: string;
  user_id: string;
  date: string;
  email_count: number;
}

interface ContactData {
  date: string;
  leads_count: number;
}

interface ConnectionData {
  date: string;
  connection_count: number;
}

interface MailGraphContextType {
  mailGraphData: MailGraphData[];
  contactsData: ContactData[];
  isLoading: boolean;
  setMailGraphData: (data: MailGraphData[]) => void;
  setContactsData: (data: ContactData[]) => void;
  fetchDataIfNeeded: () => Promise<void>;
  connectionData: ConnectionData[];
  setConnectionData: (data: ConnectionData[]) => void;
  connectedData: ConnectionData[];
  setConnectedData: (data: ConnectionData[]) => void;
}

const defaultMailGraphState: MailGraphContextType = {
  mailGraphData: [],
  contactsData: [],
  isLoading: false,
  setMailGraphData: () => { },
  setContactsData: () => { },
  fetchDataIfNeeded: async () => { },
  connectionData: [],
  setConnectionData: () => { },
  connectedData: [],
  setConnectedData: () => { },
};

const MailGraphContext = createContext<MailGraphContextType>(defaultMailGraphState);

export const MailGraphProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [mailGraphData, setMailGraphData] = useState<MailGraphData[]>([]);
  const [contactsData, setContactsData] = useState<ContactData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionData[]>([]);
  const [connectedData, setConnectedData] = useState<ConnectionData[]>([]);

  const fetchDataIfNeeded = useCallback(async () => {
    if (!user?.id || hasLoadedData) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get<{
        mailgraph: MailGraphData[];
        contacts: ContactData[];
        linkedin: { connections: ConnectionData[] };
        linkedin_connected: { connections: ConnectionData[] };
      }>(`/v2/mailgraph/`);

      setMailGraphData(response.data.mailgraph);
      setContactsData(response.data.contacts);
      setConnectionData(response.data.linkedin.connections);
      setConnectedData(response.data.linkedin_connected.connections);
      setHasLoadedData(true);
    } catch (error: any) {
      console.error("Error fetching mailgraph data:", error);
      setError(error.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, hasLoadedData]);

  const contextValue = useMemo(
    () => ({
      mailGraphData,
      contactsData,
      connectionData,
      connectedData,
      isLoading,
      setMailGraphData,
      setContactsData,
      setConnectionData,
      setConnectedData,
      fetchDataIfNeeded,
    }),
    [mailGraphData, contactsData, connectionData, connectedData, isLoading, fetchDataIfNeeded]
  );

  return (
    <MailGraphContext.Provider value={contextValue}>
      {children}
    </MailGraphContext.Provider>
  );
};

export const useMailGraphContext = () => useContext(MailGraphContext);
