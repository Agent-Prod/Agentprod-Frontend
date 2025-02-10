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
import { useAuth } from "@/context/auth-provider";
import axiosInstance from "@/utils/axiosInstance";

export default function UserAuthForm({
  formType,
}: {
  formType: "signin" | "signup";
}) {
  const { login } = useAuth();
  const { setUser, setToken, setRefreshToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const emailSchema = formType === "signup"
    ? z.string()
      .email({ message: "Enter a valid email address" })
      .refine((email) => {
        // Split email at @ and check domain isn't a common personal email provider
        const [_, domain] = email.split('@');
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
        return !personalDomains.includes(domain.toLowerCase());
      }, { message: "Please use your work email address" })
    : z.string().email({ message: "Enter a valid email address" });

  const formSchema = z.object({
    email: emailSchema,
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  });

  type UserFormValue = z.infer<typeof formSchema>;

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
        const response = await axiosInstance.post('/v2/users/login', {
          email: data.email,
          password: data.password
        });

        const userData = response.data.user_id;

        if (userData?.session?.access_token) {
          setToken(userData.session.access_token);
          setRefreshToken(userData.session.refresh_token);
          setUser(userData.user);
          localStorage.setItem('login_timestamp', new Date().toISOString());
          toast.success("Sign-in Successful!");
          login({ user_id: userData });
          window.location.href = "/dashboard";
        } else {
          throw new Error("Invalid response structure");
        }
      } else if (formType === "signup") {
        const response = await axiosInstance.post('/v2/users/signup', {
          email: data.email,
          password: data.password,
        });

        toast.success("Verification email sent!");
      }
    } catch (error: any) {
      console.error(error.message || "An error occurred");
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full">
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
  );
}
