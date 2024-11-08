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
import {
  signup as supabaseSignup,
} from "@/app/(auth)/actions";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-provider";
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
  const { login } = useAuth();
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
      let userData;
      console.log("button clicked");
      if (formType === "signin") {
        try {
          // userData = await supabaseLogin({
          //   email: data.email,
          //   password: data.password,
          // });
          const response = await axiosInstance.post("v2/users/login", {
            email: data.email,
            password: data.password,
          });
          userData = response.data;
          toast.success("Sign-in Successful!");

          console.log("User details on signin:", userData.user);
          if (response.data.user_id) {
            setCookie('Authorization', response.data.user_id);
            
            // Set user data first
            const userData = await axiosInstance.get('/v2/settings');
            setUser({
              user_id: userData.data.user_id,
              email: userData.data.email,
              first_name: userData.data.first_name,
              last_name: userData.data.last_name,
              job_title: userData.data.job_title,
              phone_number: userData.data.phone_number,
              company: userData.data.company,
              company_id: userData.data.company_id,
              notifications: userData.data.notifications,
              plan: "",
              leads_used: 0,
              thread_id: "",
              hubspot_token: "",
              salesforce_token: ""
            });

            toast.success("Sign-in Successful!");
            
            // Use replace: true to prevent back navigation to login page
            router.replace('/dashboard');
            // Alternatively, you can use:
            // router.push('/dashboard', { scroll: false });
          }

          
        } catch (error) {
          toast.error("Sign-in failed. Please try again.");
          console.error("Error during sign-in:", error);
        }
      } else if (formType === "signup") {
        userData = await supabaseSignup({
          email: data.email,
          password: data.password,
        });
        toast.success("Verification email sent!");
        console.log("User details on signup:", userData);
      }
      console.log(userData);

      if (userData?.user) {
        console.log("UserData just after logged in", userData);
        setUser({
          user_id: userData?.user?.user_id,
          email: userData?.user?.email,
          first_name: userData?.user?.first_name,
          last_name: userData?.user?.last_name,
          job_title: userData?.user?.job_title,
          phone_number: userData?.user?.phone_number,
          company: userData?.user?.company,
          company_id: userData?.user?.company_id,
          notifications: userData?.user?.notifications,
          plan: "",
          leads_used: 0,
          thread_id: "",
          hubspot_token: "",
          salesforce_token: ""
        });

        try {
          const response = await axiosInstance.post(
            `/v2/users/initiate/${userData.user.id}`,
            {
              userId: userData.user.id,
            }
          );
          console.log(
            "API call response after new api:",
            response.data,
            userData.user.id
          );
        } catch (apiError) {
          console.error("API call failed:", apiError);
          toast.error("Failed to complete user setup.");
        }

        login(userData.user);

      }
    } catch (error: any) {
      console.error(error.message || "An error occurred");
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
