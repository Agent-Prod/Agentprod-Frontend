"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axiosInstance from "@/utils/axiosInstance";

const autopilotFormSchema = z.object({
  all_messages_actions: z.boolean().optional(),
  email: z.boolean().optional(),
  replies: z.boolean().optional(),
  ooo: z.boolean().optional(),
  positive: z.boolean().optional(),
  negative: z.boolean().optional(),
  neutral: z.boolean().optional(),
  maybe_later: z.boolean().optional(),
  forwarded: z.boolean().optional(),
  error: z.boolean().optional(),
  demo: z.boolean().optional(),
  not_interested: z.boolean().optional(),
  linkedin: z.boolean().optional(),
  linkedin_sequence: z.boolean().optional(),
  linkedin_demo_replies: z.boolean().optional(),
  linkedin_replies: z.boolean().optional(),
});

type AutopilotFormValues = z.infer<typeof autopilotFormSchema>;

const defaultValues: Partial<AutopilotFormValues> = {
  all_messages_actions: false,
  email: false,
  replies: false,
  ooo: false,
  positive: false,
  negative: false,
  neutral: false,
  maybe_later: false,
  forwarded: false,
  error: false,
  demo: false,
  not_interested: false,
  linkedin: false,
  linkedin_sequence: false,
  linkedin_demo_replies: false,
  linkedin_replies: false,
};

const setFormValues = (setValue: any, values: Partial<AutopilotFormValues>) => {
  Object.entries(values).forEach(([key, value]) => {
    if (key in defaultValues) {
      setValue(key as keyof AutopilotFormValues, value);
    }
  });
};


export function AutopilotForm() {
  const params = useParams<{ campaignId: string }>();
  const [type, setType] = useState<"create" | "edit">("create");
  const [channel, setChannel] = useState('omni');
  const router = useRouter();

  const form = useForm<AutopilotFormValues>({
    resolver: zodResolver(autopilotFormSchema),
    defaultValues,
  });

  const { setValue, watch } = form;
  const allMessagesActions = watch("all_messages_actions");
  const reply = watch("replies");

  useEffect(() => {
    setFormValues(setValue, {
      email: allMessagesActions,
      replies: allMessagesActions,
      ooo: allMessagesActions,
      positive: allMessagesActions,
      negative: allMessagesActions,
      neutral: allMessagesActions,
      maybe_later: allMessagesActions,
      forwarded: allMessagesActions,
      error: allMessagesActions,
      demo: allMessagesActions,
      not_interested: allMessagesActions,
      linkedin: allMessagesActions,
      linkedin_sequence: allMessagesActions,
      linkedin_demo_replies: allMessagesActions,
      linkedin_replies: allMessagesActions,
    });
  }, [allMessagesActions, setValue]);

  useEffect(() => {
    setFormValues(setValue, {
      ooo: reply,
      positive: reply,
      negative: reply,
      neutral: reply,
      maybe_later: reply,
      forwarded: reply,
      error: reply,
      demo: reply,
      not_interested: reply,
      linkedin: reply,
      linkedin_sequence: reply,
      linkedin_demo_replies: reply,
      linkedin_replies: reply,
    });
  }, [reply, setValue]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axiosInstance.get(
          `v2/autopilot/${params.campaignId}`
        );
        const data = res.data;
        if (data) {
          setType("edit");
          // Only set form values for fields that exist in our form schema
          const formData: Partial<AutopilotFormValues> = {};
          Object.keys(defaultValues).forEach((key) => {
            if (key in data) {
              formData[key as keyof AutopilotFormValues] = data[key];
            }
          });
          setFormValues(setValue, formData);
        }
      } catch (error) {
        console.error("Error fetching autopilot settings:", error);
        toast.error("Failed to load autopilot settings.");
      }
    }
    fetchData();
  }, [params.campaignId, setValue]);

  useEffect(() => {
    async function fetchCampaignData() {
      try {
        const res = await axiosInstance.get(
          `v2/campaigns/${params.campaignId}`
        );
        const campaignData = res.data.channel;
        setChannel(campaignData);
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        toast.error("Failed to load campaign data.");
      }
    }
    fetchCampaignData();
  }, [params.campaignId]);

  async function onSubmit(data: AutopilotFormValues) {
    try {
      const url = `v2/autopilot`;
      const payload = { campaign_id: params.campaignId, ...data };

      if (type === "create") {
        await axiosInstance.post(url, payload);
        toast.success("Autopilot settings created successfully.");
      } else {
        await axiosInstance.put(url, payload);
        toast.success("Autopilot settings updated successfully.");
      }
      setTimeout(() => {
        router.push(`/campaign/${params.campaignId}`);
      }, 2000);
    } catch {
      toast.error("An error occurred while saving the autopilot settings.");
    }
  }

  const renderSwitchField = (
    name: keyof AutopilotFormValues,
    label: string,
    description: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg px-4 py-2">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );

  const renderEmailFields = () => (
    <>
      {renderSwitchField(
        "email",
        "Outbound sequences",
        "First contact and follow-ups as part of a campaign sequence."
      )}
      {renderSwitchField(
        "replies",
        "Replies",
        "Responses and actions to inbound replies."
      )}
      <div className="pl-8 space-y-2">
        {renderSwitchField(
          "ooo",
          "Out of office",
          "Follow-up when they are back at work."
        )}
        {renderSwitchField(
          "positive",
          "Positive",
          "Respond towards campaign goal on positive reply."
        )}
        {renderSwitchField(
          "negative",
          "Negative",
          "Respond, mark as lost, and block contact on negative reply."
        )}
        {renderSwitchField(
          "neutral",
          "Neutral",
          "Respond towards campaign goal on neutral reply."
        )}
        {renderSwitchField(
          "maybe_later",
          "Maybe later",
          "Respond and follow-up later towards campaign goal."
        )}
        {renderSwitchField(
          "forwarded",
          "Forwarded",
          "Start a new conversation on forwarded reply."
        )}
        {renderSwitchField(
          "error",
          "Error",
          "Block contact and mark as lost if an email bounces."
        )}
        {renderSwitchField(
          "demo",
          "Demo",
          "Respond send them a calendar link"
        )}
        {renderSwitchField(
          "not_interested",
          "Not Interested",
          "Respond, ask for any other help and dont send any future campaign emails."
        )}
      </div>
    </>
  );

  const renderLinkedInFields = () => (
    <>
      {renderSwitchField(
        "linkedin_sequence",
        "LinkedIn Sequences",
        "Send a Linkedin Comments, Linkedin message and follow up messages."
      )}
      {renderSwitchField(
        "linkedin_demo_replies",
        "LinkedIn Demo Replies",
        "Send a demo reply to the lead if they are connected."
      )}
      {renderSwitchField(
        "linkedin_replies",
        "LinkedIn Replies",
        "Send a reply to the lead if they are connected."
      )}
    </>
  );

  return (
    <div className="w-4/5 border p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        { channel === 'omni' && renderSwitchField(
            "all_messages_actions",
            "All messages and actions",
            "Turn on autopilot for all messages and actions."
          )}
          {(channel === 'mail' || channel === 'omni') && renderEmailFields()}
          {(channel === 'Linkedin' || channel === 'omni') && renderLinkedInFields()}

          <Button type="submit">Update notifications</Button>
        </form>
      </Form>
    </div>
  );
}
