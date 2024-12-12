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
import { resetPassword } from "@/app/(auth)/actions"; // adjust the path accordingly
import { toast } from "sonner";
import { deleteCookie } from "cookies-next";

export default function AuthenticationPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      deleteCookie("auth-token");
      deleteCookie("user");
    }
  }, [user]);

  if (user) {
    redirect("/dashboard");
  }

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      await resetPassword({ email });
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error("Error sending email " + error);
    }
    setLoading(false);
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
            <p className="text-sm text-white/50 text-end cursor-pointer">
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
