import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Agentprod",
  description: "Basic dashboard with Next.js and Shadcn",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/examples/authentication"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 hidden top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-black" />

          <div className="relative z-20 flex flex-col bg-black h-full justify-center items-center  text-lg font-medium">
            <Image
              src="/banner.png"
              alt="banner"
              width={800} // Specify the width of the image
              height={500} // Specify the height of the image
              className=""
            />
          </div>
        </div>
        {children}
      </div>
    </>
  );
}
