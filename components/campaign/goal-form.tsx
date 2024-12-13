/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  useCampaignContext,
  GoalFormData,
} from "@/context/campaign-provider";
import { GoalDataWithId, getGoalById } from "./camapign.api";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useButtonStatus } from "@/context/button-status";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/auth-provider";

const goalFormSchema = z.object({
  success_metric: z.string(),
  scheduling_link: z.union([
    z.string().url({ message: "Invalid URL" }),
    z.string().length(0),
    z.null()
  ]).optional(),
  emails: z
    .array(
      z.object({
        value: z.string(),
      })
    )
    .optional(),
  like_post: z.number().nullable().optional().default(0),
  withdraw_invite: z.number().nullable().optional().default(0),
  follow_up_days: z
    .number()
    .min(0, { message: "Follow-up days must be a non-negative number" }),
  follow_up_times: z
    .number()
    .min(0, { message: "Follow-up times must be a non-negative number" }),
  mark_as_lost: z
    .number()
    .min(0, { message: "Mark as lost must be a non-negative number" }),
}).refine((data) => {
  // Only validate scheduling_link when success_metric is "Meeting scheduled"
  if (data.success_metric === "Meeting scheduled") {
    return !!data.scheduling_link && data.scheduling_link.length > 0;
  }
  return true;
}, {
  message: "Scheduling link is required when Meeting scheduled is selected",
  path: ["scheduling_link"],
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

const defaultValues: Partial<GoalFormValues> = {};

export function GoalForm() {
  const defaultFormsTracker = {
    schedulingBudget: true,
    offering: false,
    goal: false,
    audience: false,
    training: false,
  };

  const { setPageCompletion } = useButtonStatus();
  const params = useParams<{ campaignId: string }>();

  const { createGoal, editGoal } = useCampaignContext();
  const [goalData, setGoalData] = useState<GoalDataWithId>();
  const { user } = useAuth();
  const [mailboxes, setMailboxes] =
    useState<{ mailbox: string; sender_name: string; id: number }[]>();
  const [originalData, setOriginalData] = useState<GoalFormData>();
  const [type, setType] = useState<"create" | "edit">("create");
  const [campaignChannel, setCampaignChannel] = useState<string>("");
  const [selectedLinkedInId, setSelectedLinkedInId] = useState<string[]>([]);
  const [likePost, setLikePost] = useState<number>(0);
  const [withdrawInvite, setWithdrawInvite] = useState<number>(0);
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { control, handleSubmit, reset } = form;
  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: "emails",
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await axiosInstance.get(
            `v2/goals/${params.campaignId}`
          );
          const data = response.data;
          if (data.detail === "Goal not found") {
            setType("create");
          } else {
            setGoalData(data);
            setType("edit");
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);

  const onEmailAppend = (email: string, mailbox: { id: number, platform: string | null }) => {
    console.log('onEmailAppend:', { email, mailbox });
    if (!emailFields.some((emailField) => emailField.value === email)) {
      appendEmail({ value: email });
      if (campaignChannel === 'Linkedin') {
        setSelectedLinkedInId(prev => [...prev, mailbox.id.toString()]);
      }
    }
  };

  const onEmailRemove = (email: string) => {
    const indexToRemove = emailFields.findIndex(
      (emailField) => emailField.value === email
    );
    if (indexToRemove !== -1) {
      removeEmail(indexToRemove);
      if (campaignChannel === 'Linkedin') {
        setSelectedLinkedInId(prev => prev.filter((_, index) => index !== indexToRemove));
      }
    }
  };

  const onSubmit: SubmitHandler<GoalFormValues> = async (data) => {
    console.log("Form submitted with data:", data);

    try {
      if (type === "create") {
        const payload = {
          ...data,
          linkedin_accounts: campaignChannel === 'Linkedin' && selectedLinkedInId.length > 0
            ? selectedLinkedInId
            : null
        };

        await createGoal(payload as GoalFormData, params.campaignId);
      }
      if (type === "edit") {
        
          await editGoal(data as GoalFormData, goalData?.id as string, params.campaignId);
        
      }
      const updatedFormsTracker = {
        schedulingBudget: true,
        offering: true,
        goal: true,
        audience: true,
      };
      localStorage.setItem("formsTracker", JSON.stringify(updatedFormsTracker));
      setPageCompletion("goal", true);
      toast.success("Goal added successfully");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save goal");
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) =>
      console.log('Form values changed:', { name, type, value, errors: form.formState.errors })
    );
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    const fetchGoal = async () => {
      if (type === "edit") {
        const id = params.campaignId;
        if (id) {
          const goal = await getGoalById(id);
          setGoalData(goal || null);
          const formattedEmails = goal.emails.map((email) => ({
            value: email,
          }));
          setOriginalData({ ...goal, emails: formattedEmails });
        }
      }
    };

    fetchGoal();
  }, [params.campaignId, getGoalById]);

  useEffect(() => {
    console.log("goal data", goalData);
    if (goalData) {
      setOriginalData({
        success_metric: goalData.success_metric,
        scheduling_link: goalData.scheduling_link,
        follow_up_days: goalData.follow_up_days,
        follow_up_times: goalData.follow_up_times,
        mark_as_lost: goalData.mark_as_lost,
        emails: goalData.emails.map((email) => ({ value: email })),
        linkedin_accounts: goalData.linkedin_accounts,
        like_post: goalData.like_post,
        withdraw_invite: goalData.withdraw_invite,
      });

      if (goalData.linkedin_accounts && Array.isArray(goalData.linkedin_accounts)) {
        setSelectedLinkedInId(goalData.linkedin_accounts);
      }

      form.reset({
        ...goalData,
        emails: goalData.emails.map((email) => ({ value: email })),
      });
    }
  }, [goalData, form]);

  useEffect(() => {
    const fetchMailboxes = async () => {
      if (user?.id) {
        await axiosInstance
          .get(`v2/settings/mailboxes`)
          .then((response) => {
            const userMailboxes = response.data.mailboxes.map(
              (mailbox: { mailbox: string; sender_name: string; id: number }) => {
                return {
                  mailbox: mailbox.mailbox,
                  sender_name: mailbox.sender_name,
                  id: mailbox.id,
                };
              }
            );
            console.log("mailboxes", userMailboxes);
            setMailboxes(userMailboxes);
            console.log("mailboxes", response);
          })
          .catch((error) => {
            console.log("Error occured while fetching mailboxes", error);
          });
      }
    };

    fetchMailboxes();
  }, []);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `v2/campaigns/${params.campaignId}`
        );
        setCampaignChannel(response.data.channel);
      } catch (error) {
        console.error("Error fetching campaign details:", error);
      }
    };

    if (params.campaignId) {
      fetchCampaignDetails();
    }
  }, [params.campaignId]);

  const isFormValid = () => {
    const values = form.getValues();
    const hasEmails = values.emails && values.emails.length > 0;
    const hasRequiredFields =
      values.success_metric &&
      values.follow_up_days !== undefined &&
      values.follow_up_times !== undefined &&
      values.mark_as_lost !== undefined;

    if (values.success_metric === "Meeting scheduled") {
      return hasEmails && hasRequiredFields && values.scheduling_link;
    }

    return hasEmails && hasRequiredFields;
  };

  const getDisplayText = () => {
    if (!emailFields || emailFields.length === 0) {
      return `Select ${campaignChannel === 'Linkedin' ? 'LinkedIn Account' : 'Email'}`;
    }

    if (emailFields.length === 1) {
      return emailFields[0].value;
    }

    return `${emailFields.length} ${campaignChannel === 'Linkedin' ? 'accounts' : 'emails'} selected`;
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('Form validation errors:', errors);
      })} className="space-y-8 mb-5">
        <FormField
          control={form.control}
          name="success_metric"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div>
                <FormLabel>Goal</FormLabel>
                <FormDescription>
                  How success is measured for this campaign
                </FormDescription>
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || goalData?.success_metric}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Meeting scheduled" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Meeting scheduled
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Link clicked" />
                    </FormControl>
                    <FormLabel className="font-normal">Link clicked</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Reply received" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Reply received
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Custom goal" />
                    </FormControl>
                    <FormLabel className="font-normal">Custom goal</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("success_metric") === "Meeting scheduled" && (
          <FormField
            control={form.control}
            name="scheduling_link"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div>
                  <FormLabel>Scheduling Link</FormLabel>
                  <FormDescription>
                    Where prospects can schedule a meeting with you
                  </FormDescription>
                </div>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://calendly.com/example"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div>
                <FormLabel>Sender {campaignChannel === 'Linkedin' ? 'LinkedIn Account' : 'Email'}</FormLabel>
                <FormDescription>
                  Where prospects can schedule a meeting with you
                </FormDescription>
              </div>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center justify-between w-1/4"
                    >
                      <span className="truncate">{getDisplayText()}</span>
                      <ChevronDown size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[400px]" align="start">
                    <ScrollArea className="h-auto">
                      <DropdownMenuGroup className="p-2">
                        {mailboxes &&
                          mailboxes.length > 0 &&
                          mailboxes[0].mailbox !== null ? (
                          mailboxes
                            .filter(mailbox => {
                              if (campaignChannel === 'Linkedin') {
                                return mailbox.mailbox.toLowerCase().includes('linkedin');
                              }
                              return true;
                            })
                            .map((mailbox, index) => (
                              <DropdownMenuItem
                                key={index}
                                className="p-0 focus:bg-transparent"
                              >
                                <div
                                  className="flex items-center space-x-2 w-full px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Checkbox
                                    checked={emailFields.some(
                                      (emailField) =>
                                        emailField.value === mailbox.mailbox
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        onEmailAppend(mailbox.mailbox, {
                                          id: mailbox.id,
                                          platform: campaignChannel
                                        });
                                      } else {
                                        onEmailRemove(mailbox.mailbox);
                                        if (campaignChannel === 'Linkedin') {
                                          setSelectedLinkedInId([]);
                                        }
                                      }
                                    }}
                                  />
                                  <label className="text-sm font-medium leading-none cursor-pointer flex-1">
                                    {mailbox.sender_name} - {mailbox.mailbox}
                                  </label>
                                </div>
                              </DropdownMenuItem>
                            ))
                        ) : (
                          <div className="text-sm m-2 text-center">
                            <p> No mailboxes connected.</p>
                            <p>
                              You can add a mailbox on the{" "}
                              <Link
                                href="/settings/mailbox"
                                className="text-blue-600 underline"
                              >
                                Settings
                              </Link>{" "}
                              page.
                            </p>
                          </div>
                        )}
                      </DropdownMenuGroup>
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {campaignChannel === 'Linkedin' && (<div>
          <FormLabel className="tex-sm font-medium">LinkedIn Account Information</FormLabel>

          <div className="flex gap-4 items-center mt-3">
            <FormField
              control={form.control}
              name="like_post"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <p className="text-sm mb-3">Like last posts (count)</p>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : Number(value));
                      }}
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="withdraw_invite"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <p className="text-sm mb-3">Withdraw invite after (days)</p>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : Number(value));
                      }}
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>)}

        <div>
          <FormLabel className="tex-sm font-medium">Follow Up</FormLabel>

          <div className="flex gap-4 items-center mt-3">
            <FormField
              control={form.control}
              name="follow_up_days"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <p className="text-sm mb-3">Days between follow-ups</p>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numberValue =
                          value === "" ? undefined : Number(value);
                        field.onChange(numberValue);
                      }}
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="follow_up_times"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <p className="text-sm mb-3">Number of follow-ups</p>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numberValue =
                          value === "" ? undefined : Number(value);
                        field.onChange(numberValue);
                      }}
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="mark_as_lost"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Mark as lost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="eg. 10 days"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numberValue =
                      value === "" ? undefined : Number(value);
                    field.onChange(numberValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "edit" ? (
          <Button type="submit">Update Goal</Button>
        ) : (
          <Button type="submit" disabled={!isFormValid()}>Add Goal</Button>
        )}
      </form>
    </Form>
  );
}
