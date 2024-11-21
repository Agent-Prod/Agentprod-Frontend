/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "./user-context";

interface MailGraphData {
  id: string;
  user_id: string;
  date: string;
  emails: number;
}

interface ContactData {
  date: string;
  leads_count: number;
}

interface MailGraphContextType {
  mailGraphData: MailGraphData[];
  contactsData: ContactData[];
  isLoading: boolean;
  setMailGraphData: (data: MailGraphData[]) => void;
  setContactsData: (data: ContactData[]) => void;
}

const defaultMailGraphState: MailGraphContextType = {
  mailGraphData: [],
  contactsData: [],
  isLoading: true,
  setMailGraphData: () => {},
  setContactsData: () => {},
};

const MailGraphContext = createContext<MailGraphContextType>(defaultMailGraphState);

export const MailGraphProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUserContext();
  const [mailGraphData, setMailGraphData] = useState<MailGraphData[]>([]);
  const [contactsData, setContactsData] = useState<ContactData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get<{
          mailgraph: MailGraphData[];
          contacts: ContactData[];
        }>(`/v2/mailgraph/${user?.id}`);
        
        setMailGraphData(response.data.mailgraph);
        setContactsData(response.data.contacts);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching mailgraph data:", error);
        setError(error.message || "Failed to load data.");
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const contextValue = useMemo(
    () => ({
      mailGraphData,
      contactsData,
      isLoading,
      setMailGraphData,
      setContactsData,
    }),
    [mailGraphData, contactsData, isLoading]
  );

  return (
    <MailGraphContext.Provider value={contextValue}>
      {children}
    </MailGraphContext.Provider>
  );
};

export const useMailGraphContext = () => useContext(MailGraphContext);
