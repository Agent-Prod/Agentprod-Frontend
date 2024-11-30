/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
"use client";

import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import React, { useEffect, useState } from "react";
import { useUserContext } from "@/context/user-context";
import { CampaignEntry } from "@/context/campaign-provider";
import { useButtonStatus } from "@/context/button-status";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

const campaignTypes = ["Outbound", "Inbound", "Nurturing"];

const campaignFormSchema = z.object({
  campaignName: z
    .string()
    .min(2, "Campaign Name must be at least 2 characters.")
    .max(50, "Campaign Name must not be longer than 50 characters."),
  campaignType: z.enum(["Outbound", "Inbound", "Nurturing"], {
    required_error: "Please select a campaign type.",
  }),
  scheduleType: z.enum(["recurring", "immediate"], {
    required_error: "Please select a schedule type.",
  }),
  schedule: z.object({
    weekdayStartTime: z.string().optional(),
    weekdayEndTime: z.string().optional(),
  }),
  channelType: z.enum(["mail", "Linkedin"], {
    required_error: "Please select a channel type.",
  }),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

const defaultValues: Partial<CampaignFormValues> = {
  schedule: {
    weekdayStartTime: "09:00",
    weekdayEndTime: "17:00"
  }
};

export function SchedulingForm() {
  const router = useRouter();
  const params = useParams<{ campaignId: string }>();
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  });

  const { user } = useUserContext();
  const [campaignData, setCampaignData] = useState<CampaignEntry>();
  const { setPageCompletion } = useButtonStatus();
  const [type, setType] = useState<"create" | "edit">("create");

  const onSubmit = async (data: CampaignFormValues) => {
    if (!user) return;
    const campaignData = {
      user_id: user.id,
      campaign_name: data.campaignName,
      campaign_type: data.campaignType,
      monday_start: data.schedule.weekdayStartTime,
      monday_end: data.schedule.weekdayEndTime,
      tuesday_start: data.schedule.weekdayStartTime,
      tuesday_end: data.schedule.weekdayEndTime,
      wednesday_start: data.schedule.weekdayStartTime,
      wednesday_end: data.schedule.weekdayEndTime,
      thursday_start: data.schedule.weekdayStartTime,
      thursday_end: data.schedule.weekdayEndTime,
      friday_start: data.schedule.weekdayStartTime,
      friday_end: data.schedule.weekdayEndTime,
      schedule_type: data.scheduleType,
      autopilot: false,
      is_active: false,
      channel: data.channelType,
    };

    try {
      if (type === "create") {
        const response = await axiosInstance.post(
          `v2/campaigns/`,
          campaignData
        );
        router.push(`/campaign/${response.data.id}`);
        toast.success("Campaign is scheduled successfully!");
      } else {
        await axiosInstance.put(
          `v2/campaigns/${params.campaignId}`,
          campaignData
        );
        router.push(`/campaign/${params.campaignId}`);
        toast.success("Campaign is updated successfully!");
      }

      const updatedFormsTracker = {
        schedulingBudget: true,
        offering: true,
      };
      localStorage.setItem("formsTracker", JSON.stringify(updatedFormsTracker));
      setPageCompletion("scheduling-budget", true);
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error("Failed to save campaign. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await axiosInstance.get(
            `v2/campaigns/${params.campaignId}`
          );
          const data = response.data;
          if (data.detail === "Campaign not found") {
            setType("create");
          } else {
            setCampaignData(data as CampaignEntry);
            setType("edit");
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);

  useEffect(() => {
    if (campaignData) {
      form.setValue("campaignName", campaignData.campaign_name);
      form.setValue(
        "campaignType",
        campaignData.campaign_type as "Outbound" | "Inbound" | "Nurturing"
      );
      form.setValue("scheduleType", campaignData.schedule_type as "recurring" | "immediate");
      form.setValue("channelType", campaignData.channel);

      const processTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(":").map(Number);
        const paddedHours = String(hours).padStart(2, "0");
        const paddedMinutes = String(minutes).padStart(2, "0");
        return `${paddedHours}:${paddedMinutes}`;
      };

      if (campaignData.monday_start && campaignData.monday_end) {
        form.setValue(
          "schedule.weekdayStartTime",
          processTime(campaignData.monday_start)
        );
        form.setValue(
          "schedule.weekdayEndTime",
          processTime(campaignData.monday_end)
        );
      }
    }
  }, [campaignData]);

  return (
    <Form {...form}>
      {/* {JSON.stringify(campaignData)} */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-5">
        <FormField
          control={form.control}
          name="campaignName"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="Campaign Name" {...field} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="campaignType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Campaign Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || campaignData?.campaign_type}
                  className="flex flex-col space-y-1"
                >
                  {campaignTypes.map((type) => (
                    <FormItem
                      key={type}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={type} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {type}
                        {(type === "Inbound" || type === "Nurturing") && (
                          <span className="ml-2 rounded-full px-2 py-1 text-xs font-semibold text-white/70 border-white/80 border">
                            Beta
                          </span>
                        )}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scheduleType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Schedule Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || campaignData?.schedule_type} // Updated line
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="recurring" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Contact Leads Everyday
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="immediate" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      One Time Campaign
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="channelType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Channel Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || campaignData?.channel}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mail" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Email
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Linkedin" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Linkedin
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <h1>Schedule</h1>
        <div className="flex w-[400px] justify-between">
          <h1>Weekdays</h1>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name={`schedule.weekdayStartTime`}
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage>{error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`schedule.weekdayEndTime`}
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input type="time" placeholder="End Time" {...field} />
                  </FormControl>
                  <FormMessage>{error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={type === "create" && !form.formState.isValid}>
          {type === "create" ? "Add" : "Update"} Campaign
        </Button>
      </form>
    </Form>
  );
}
