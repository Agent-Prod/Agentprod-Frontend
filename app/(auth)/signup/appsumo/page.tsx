"use client";
// Import necessary modules and components
import React, { useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { redirect } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { setCookie } from "cookies-next";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { signupAppsumo as supabaseSignup } from "@/app/(auth)/actions";
import { useUserContext } from "@/context/user-context";
import axios from "axios";

// Define the expected return type of supabaseSignup
type SupabaseUser = {
  id: string;
  email: string;
};

// Define the form validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  code: z.string(),
});

// Define the type for the form values
type UserFormValue = z.infer<typeof formSchema>;

// Define the functional component for the registration page
function RegistrationPage() {
  const { login } = useAuth(); // Use authentication context for login
  const { setUser } = useUserContext(); // Use user context for setting user details
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Form hook for handling form state and validation
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema), // Use Zod resolver for form validation
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true); // Set loading state to true during form submission

    try {
      const { data: dataCode } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}v2/check/coupon/${data.code}`
      );

      if (dataCode !== "Not Found") {
        const user: any = await supabaseSignup({
          email: data.email,
          password: data.password,
        });

        if (user && user.id) {
          console.log("User ID:", user.id);
          const res = axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/pricing-plans/`,
            {
              user_id: user.id,
              subscription_mode: "AppSumo",
              order_id: data.code,
              payment_id: "",
              amount: "",
              email: data.email,
              start_time: new Date().toISOString(),
              subscribed: true,
            }
          );
          toast.success("Verification email sent!");
        } else {
          toast.error("Failed to get user data after signup.");
        }
      } else {
        toast.error("Invalid coupon code. Please try again.");
      }
    } catch (error: any) {
      console.error("An error occurre", error.message || error);
      toast.error("Invalid Coupon code. Please try again.");
    } finally {
      setLoading(false); // Set loading state to false after form submission completes
    }
  };

  // Render the registration form component
  return (
    <div className="p-4 lg:p-8 h-full flex items-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Create your account using AppSumo User Code
          </p>
        </div>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)} // Handle form submission on submit button click
              className="space-y-2 w-full"
            >
              {/* Form field for email input */}
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
                        disabled={loading} // Disable input field during form submission
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Form field for password input */}
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
                        disabled={loading} // Disable input field during form submission
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Form field for redemption code input */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter AppSumo Redemption Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your Redemption Code"
                        disabled={loading} // Disable input field during form submission
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Button to submit form */}
              <Button
                disabled={loading} // Disable button during form submission
                className="ml-auto w-full"
                type="submit"
              >
                Verify Code and Send Email
              </Button>
            </form>
          </Form>
        </div>
        {/* Additional text and links for terms of service and privacy policy */}
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage; // Export the registration page component
