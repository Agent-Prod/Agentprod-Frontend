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
import Cookies from 'js-cookie';
interface MailGraphData {
  date: string;
  emails: number;
  new_emails: number;
}

interface MailGraphContextType {
  mailGraphData: MailGraphData[];
  isLoading: boolean;
  setMailGraphData: (data: MailGraphData[]) => void; 
}

const defaultMailGraphState: MailGraphContextType = {
  mailGraphData: [],
  isLoading: true,
  setMailGraphData: () => {},
};

const MailGraphContext = createContext<MailGraphContextType>(
  defaultMailGraphState
);

export const MailGraphProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mailGraphData, setMailGraphData] = useState<MailGraphData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get<MailGraphData[]>(
          `/v2/mailgraph`,{
            headers: {
              'Authorization': 'Bearer ' + Cookies.get('Authorization'),
            },
            withCredentials: true
          }
        );
        setMailGraphData(response.data);
        console.log("Mailgraph Data comingggg:", response.data);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching mailgraph data:", error);
        setError(error.message || "Failed to load data.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const contextValue = useMemo(
    () => ({
      mailGraphData,
      isLoading,
      setMailGraphData,
    }),
    [mailGraphData, isLoading]
  );

  return (
    <MailGraphContext.Provider value={contextValue}>
      {children}
    </MailGraphContext.Provider>
  );
};

export const useMailGraphContext = () => useContext(MailGraphContext);
