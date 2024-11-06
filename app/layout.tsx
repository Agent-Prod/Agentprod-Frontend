import "./globals.css";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import Providers from "@/components/layout/providers";
// import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
// import { AuthStateInterface } from "@/context/auth-provider";
import { Toaster } from "sonner";
import Script from "next/script";
// import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Prod",
  description: "Basic dashboard with Next.js and Shadcn",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerSession();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // let authData: AuthStateInterface["user"] = null;

  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) {
    // authData = data?.user;
  }

  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-3LG32WF4MD"
          ></Script>
          <Script id="google-analytics">
            {` window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-3LG32WF4MD');`}
          </Script>
          <Script type="text/javascript">
          {`
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    window.Tawk_API.autoStart = false;
    (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/66fab4bae5982d6c7bb6a806/1i91l3u89';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
    })();
  `}
        </Script>
          
        </head>
        <body className={`${inter.className} overflow-hidden`}>
            <Toaster />
            {children}
        </body>
      </html>
  );
}
