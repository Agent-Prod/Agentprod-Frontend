/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/context/user-context";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import axios from "axios";

type Info = {
  id: string;
  value: string | undefined | null | number;
  isEditable: boolean;
};

export default function Page() {
  const { user, updateUser } = useUserContext();
  const [isEditing, setIsEditing] = useState(false);
  const [accountInfo, setAccountInfo] = useState<Info[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDataInfo = async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/v2/settings/${user.id}`);
        const data = response.data;

        const initialAccountInfo = [
          { id: "ID", value: data.user_id || user.id, isEditable: false },
          { id: "Sender First Name", value: data.first_name, isEditable: true },
          { id: "Sender Last Name", value: data.last_name, isEditable: true },
          { id: "Sender Job", value: data.job_title, isEditable: true },
          { id: "Email", value: data.email || user.email, isEditable: true },
          { id: "Phone", value: data.phone_number, isEditable: true },
          { id: "Company", value: data.company, isEditable: true },
          { id: "Company ID", value: data.companyId, isEditable: true },
          { id: "Notifications", value: data.notifications, isEditable: true },
          { id: "Plan", value: "", isEditable: false },
          { id: "Leads used", value: data.leads_used, isEditable: false },
        ];

        setAccountInfo(initialAccountInfo);
        updateUser({
          id: data.user_id,
          firstName: data.first_name,
          lastName: data.last_name,
        });

        // Fetch user subscription
        await fetchUserSubscription();
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast.error("Error fetching user details.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}v2/pricing-plans/${user.id}`
      );
      const planValue = res.data.subscription_mode || "Unknown";
      updatePlanInfo(planValue);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Handle 404 error (user not subscribed)
        updatePlanInfo("Not Subscribed");
      } else {
        console.error("Error fetching user subscription:", error);
        updatePlanInfo("Error fetching plan");
      }
    }
  };

  const updatePlanInfo = (planValue: string) => {
    setAccountInfo((prev) =>
      prev.map((info) =>
        info.id === "Plan" ? { ...info, value: planValue } : info
      )
    );
  };

  useEffect(() => {
    if (user?.id) {
      fetchDataInfo();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user?.id) {
    return <div>Please log in to view account information.</div>;
  }

  const handleInputChange = (id: string, value: string) => {
    setAccountInfo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  const handleUpdateClick = async () => {
    const payload = {
      user_id: user.id,
      first_name: accountInfo.find(info => info.id === "Sender First Name")?.value,
      last_name: accountInfo.find(info => info.id === "Sender Last Name")?.value,
      job_title: accountInfo.find(info => info.id === "Sender Job")?.value,
      phone_number: accountInfo.find(info => info.id === "Phone")?.value,
      email: accountInfo.find(info => info.id === "Email")?.value,
      company: accountInfo.find(info => info.id === "Company")?.value,
      company_id: accountInfo.find(info => info.id === "Company ID")?.value,
      // Assuming these fields are not editable in the UI, we'll keep their current values
      notifications: accountInfo.find(info => info.id === "Notifications")?.value,
      plan: accountInfo.find(info => info.id === "Plan")?.value,
      leads_used: accountInfo.find(info => info.id === "Leads used")?.value,
      // These fields are not in the UI, so we'll need to handle them separately
      thread_id: "", // You may need to get this value from somewhere else
      hubspot_token: "", // You may need to get this value from somewhere else
      salesforce_token: "" // You may need to get this value from somewhere else
    };

    try {
      const response = await axiosInstance.put(`/v2/settings`, payload);
      // Update the local state with the response data
      setAccountInfo(prev => prev.map(info => {
        const key = info.id.replace(/ /g, "_").toLowerCase();
        const newValue = response.data[key];
        return newValue !== undefined ? { ...info, value: newValue } : info;
      }));
      toast.success("User details updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user details:", error);
      toast.error("Error in updating user details.");
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div>
      <div className="rounded-md border border-collapse mb-8">
        <Table className="w-full text-left">
          <TableBody>
            {accountInfo.map((info) => (
              <TableRow key={info.id} className="hover:bg-transparent">
                <TableCell className="font-medium px-4 py-2 border-r bg-muted/50 w-1/3">
                  {info.id}
                </TableCell>
                <TableCell className="px-4 py-2">
                  {isEditing && info.isEditable ? (
                    <Input
                      type="text"
                      value={info?.value?.toString() ?? ""}
                      onChange={(e) =>
                        handleInputChange(info.id, e.target.value)
                      }
                    />
                  ) : (
                    info?.value?.toString()
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-4">
        <Button onClick={isEditing ? handleUpdateClick : handleEditClick}>
          {isEditing ? "Update" : "Edit"}
        </Button>
        {isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
