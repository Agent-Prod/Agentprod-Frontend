/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { setCookie } from "cookies-next";
import { toast } from "sonner";
import { useUserContext } from "@/context/user-context";
import axiosInstance from "@/utils/axiosInstance";
import { redirect, useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm({
  formType,
}: {
  formType: "signin" | "signup";
}) {
  const { user, setUser } = useUserContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      if (formType === "signin") {
        const response = await axiosInstance.post("v2/users/login", {
          email: data.email,
          password: data.password,
        });

        if (response.data.user_id) {
          setCookie('Authorization', response.data.user_id);
          
          // Get user settings in a separate request
          const userSettingsResponse = await axiosInstance.get('/v2/settings');
          const userData = userSettingsResponse.data;
          
          setUser({
            user_id: userData.user_id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            job_title: userData.job_title,
            phone_number: userData.phone_number,
            company: userData.company,
            company_id: userData.company_id,
            notifications: userData.notifications,
            plan: "",
            leads_used: 0,
            thread_id: "",
            hubspot_token: "",
            salesforce_token: ""
          });

          toast.success("Sign-in Successful!");
          router.replace('/dashboard');
        }
      } else if (formType === "signup") {
        await axiosInstance.post("v2/users/signup", {
          email: data.email,
          password: data.password,
        });
        toast.success("Verification email sent!");
      }
    } catch (error: any) {
      toast.error("Sign-in failed. Please try again.");
      console.error("Error during authentication:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto w-full" type="submit">
            {formType === "signin" ? "Log In" : "Send Verification Email"}
          </Button>
        </form>
      </Form>
    </>
  );
}
