/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter, useParams } from "next/navigation";
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
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  GoalData,
} from "@/context/campaign-provider";
import { GoalDataWithId, getGoalById } from "./camapign.api";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "@/context/user-context";
import { useButtonStatus } from "@/context/button-status";
import Link from "next/link";
import axios from "axios";

const dummyEmails = [
  "john.doe@example.com",
  "jane.smith@placeholder.com",
  "alex.jones@dummyemail.com",
  "samantha.brown@fakemail.com",
  "michael.wilson@test.com",
  "chris.johnson@norealmail.com",
  "kimberly.martinez@tempmail.com",
  "david.anderson@fakebox.com",
  "emily.thompson@nowhere.com",
  "jason.roberts@nomail.com",
];

const goalFormSchema = z.object({
  success_metric: z.string(),
  scheduling_link: z.union([
    z.string().url({ message: "Invalid URL" }),
    z.string().length(0),  // Allow empty string
    z.null()
  ]).optional(),
  emails: z
    .array(
      z.object({
        value: z.string(),
      })
    )
    .optional(),
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
  const [formsTracker, setFormsTracker] = useState(defaultFormsTracker);

  const { setPageCompletion } = useButtonStatus();
  const params = useParams<{ campaignId: string }>();

  const { createGoal, editGoal } = useCampaignContext();
  const [goalData, setGoalData] = useState<GoalDataWithId>();
  const { user } = useUserContext();
  const [mailboxes, setMailboxes] =
    useState<{ mailbox: string; sender_name: string }[]>();
  const [originalData, setOriginalData] = useState<GoalFormData>();
  const [displayEmail, setDisplayEmail] = useState("Select Email"); // Select Email
  const [type, setType] = useState<"create" | "edit">("create");
  const [campaignChannel, setCampaignChannel] = useState<string>("");

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
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/goals/${params.campaignId}`
          );
          const data = await response.json();
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

  const onEmailAppend = (email: string) => {
    // Check if the email is not already present to avoid duplicates
    if (!emailFields.some((emailField) => emailField.value === email)) {
      appendEmail({ value: email });
      setDisplayEmail(email); // Set display email when a new email is added
    }
  };

  const onEmailRemove = (email: string) => {
    // Find the index of the email object to remove
    const indexToRemove = emailFields.findIndex(
      (emailField) => emailField.value === email
    );
    if (indexToRemove !== -1) {
      removeEmail(indexToRemove);
      setDisplayEmail("Select Email"); // Reset to default text if email is removed
    }
  };

  const watchAllFields = form.watch();

  const onSubmit: SubmitHandler<GoalFormValues> = async (data) => {
    if (type === "create") {
      console.log("Link " + data.scheduling_link);
      createGoal(data as GoalFormData, params.campaignId);
    }
    if (type === "edit") {
      console.log(watchAllFields);

      const changes = Object.keys(data).reduce((acc, key) => {
        // Ensure the correct key type is used
        const propertyKey = key as keyof GoalFormValues;

        // Compare the stringified versions of the current and previous values
        if (
          JSON.stringify(data[propertyKey]) !==
          JSON.stringify(originalData?.[propertyKey])
        ) {
          // Assign only if types are compatible
          acc = { ...acc, [propertyKey]: data[propertyKey] };
        }
        return acc;
      }, {} as GoalFormValues);
      if (Object.keys(changes).length > 0 && goalData) {
        editGoal(changes as GoalFormData, goalData.id, params.campaignId);
      }
    }
    const updatedFormsTracker = {
      schedulingBudget: true,
      offering: true,
      goal: true,
      audience: true,
    };
    localStorage.setItem("formsTracker", JSON.stringify(updatedFormsTracker));
    setFormsTracker((prevFormsTracker) => ({
      ...prevFormsTracker,
      ...updatedFormsTracker,
    }));
    setPageCompletion("goal", true); // Set the page completion to true
    toast.success("Goal added successfully");
  };

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
      });
      // Also update the form values to reflect the initial state
      form.reset({
        ...goalData,
        emails: goalData.emails.map((email) => ({ value: email })),
      });
    }
  }, [goalData, form]);

  useEffect(() => {
    const fetchMailboxes = async () => {
      if (user.id) {
        await axiosInstance
          .get(`v2/settings/mailboxes/${user.id}`)
          .then((response) => {
            const userMailboxes = response.data.map(
              (mailbox: { mailbox: string; sender_name: string }) => {
                return {
                  mailbox: mailbox.mailbox,
                  sender_name: mailbox.sender_name,
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
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}v2/campaigns/${params.campaignId}`
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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mb-5">
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
                  <FormLabel>Sender Email</FormLabel>
                  <FormDescription>
                    Where prospects can schedule a meeting with you
                  </FormDescription>
                </div>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center space-x-3"
                      >
                        <span>{displayEmail}</span>
                        <ChevronDown size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-max">
                      <ScrollArea className="h-60">
                        <DropdownMenuGroup>
                          {mailboxes &&
                          mailboxes.length > 0 &&
                          mailboxes[0].mailbox !== null ? (
                            mailboxes.map((mailbox, index) => (
                              <DropdownMenuItem key={index}>
                                <div
                                  className="flex items-center space-x-2"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Checkbox
                                    checked={emailFields.some(
                                      (emailField) =>
                                        emailField.value === mailbox.mailbox
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        onEmailAppend(mailbox.mailbox);
                                      } else {
                                        onEmailRemove(mailbox.mailbox);
                                      }
                                    }}
                                  />
                                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">

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
                                  href="/dashboard/settings/mailbox"
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
                      min="0" // Ensures the minimum value is 0
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
                      min="0" // Ensures the minimum value is 0
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
          <Button type="submit">Add Goal</Button>
        )}
      </form>
    </Form>
  );
}
