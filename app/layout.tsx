import "./globals.css";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import Providers from "@/components/layout/providers";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { AuthStateInterface } from "@/context/auth-provider";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Prod",
  description: "Automate your outbound sales",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  let authData: AuthStateInterface["user"] = null;


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
        <Script type="text/javascript" id="tawk-to">
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
        <Providers userAuthData={authData}>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
