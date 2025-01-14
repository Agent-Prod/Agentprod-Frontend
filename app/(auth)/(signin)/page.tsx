"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import UserAuthForm from "@/components/forms/auth/user-auth-form";
import { useAuth } from "@/context/auth-provider";
import { redirect } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

export default function AuthenticationPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      deleteCookie("auth-token");
      deleteCookie("user");
    }
  }, [user]);

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      handlePasswordResetRedirect(window.location.href);
    }
  }, []);

  if (user) {
    redirect("/dashboard");
  }

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/v2/users/reset-password', {
        email: email
      });
    if (response.status === 200) {
      toast.success("Password reset email sent!");
    } else {
      throw new Error("Failed to send reset email");
    }
  } catch (error) {
    console.error("Password reset error:", error);
    toast.error("Error sending reset email. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handlePasswordResetRedirect = (url: string) => {
  try {
    const hashPart = url.split('#')[1];
    if (hashPart) {
      const params = new URLSearchParams(hashPart);

      const tokens = {
        accessToken: params.get('access_token'),
        refreshToken: params.get('refresh_token'),
        expiresAt: params.get('expires_at'),
        expiresIn: params.get('expires_in'),
        tokenType: params.get('token_type'),
        type: params.get('type')
      };

      const queryParams = new URLSearchParams({
        code: tokens.accessToken || '',
        refresh_token: tokens.refreshToken || '',
        expires_at: tokens.expiresAt || '',
        expires_in: tokens.expiresIn || '',
        token_type: tokens.tokenType || '',
        type: tokens.type || ''
      });

      router.push(`/reset?${queryParams.toString()}`);
    }
  } catch (error) {
    console.error('Error processing reset URL:', error);
    toast.error('Error processing reset link');
  }
};

return (
  <div className="p-4 lg:p-8 h-full flex items-center">
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Login into your account
        </p>
      </div>
      <UserAuthForm formType="signin" />

      <Dialog>
        <DialogTrigger asChild>
          <p className="text-sm dark:text-white/50 text-end cursor-pointer">
            Forgot Password
          </p>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your Email to reset Your Password</DialogTitle>
            <DialogDescription>
              <div className="text-start text-lg py-2">Email</div>
              <Input
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="my-2 mt-4 flex"
                onClick={handlePasswordReset}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Email"}
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Link href={"/signup"}>Create an account</Link>
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
