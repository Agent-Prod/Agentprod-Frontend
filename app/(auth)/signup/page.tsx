"use client";
// import { Metadata } from "next";
import Link from "next/link";
import UserAuthForm from "@/components/forms/auth/user-auth-form";
// import { buttonVariants } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";
import { redirect } from "next/navigation";
// import { SignIn } from "@clerk/nextjs";
// export const metadata: Metadata = {
//   title: "Authentication",
//   description: "Authentication forms built using the components.",
// };
export default function AuthenticationPage() {
  const { user } = useAuth();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="p-4 lg:p-8 h-full flex items-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>
        <UserAuthForm formType="signup" />
        {/* <SignIn
          forceRedirectUrl={"/dashboard"}
          afterSignInUrl={"/dashboard"}
          afterSignUpUrl={"/dashboard"}
          redirectUrl={"/dashboard"}
        /> */}
        <Link href={"/"}>Login instead</Link>
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
