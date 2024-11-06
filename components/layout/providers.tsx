"use client";
import React from "react";

import ThemeProvider from "./ThemeToggle/theme-provider";
import { UserContextProvider } from "../../context/user-context";
import { LeadSheetSidebarProvider } from "../../context/lead-sheet-sidebar";
import { LeadsProvider } from "../../context/lead-user";
import { CampaignProvider } from "../../context/campaign-provider";
import { CompanyProvider } from "@/context/company-linkedin";
import { MailboxProvider } from "@/context/mailbox-provider";
import { AutoGenerateProvider } from "@/context/auto-generate-mail";
import { FieldsListProvider } from "@/context/training-fields-provider";
import { MailGraphProvider } from "@/context/chart-data-provider";
import { ButtonStatusProvider } from "@/context/button-status";

export default function Providers({
  // session,
  children,
}: {
  // session: SessionProviderProps["session"];
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AutoGenerateProvider>
            <UserContextProvider>
              <LeadSheetSidebarProvider>
                <LeadsProvider>
                  <FieldsListProvider>
                    <CampaignProvider>
                      <MailGraphProvider>
                          <ButtonStatusProvider>
                            <CompanyProvider>
                              <MailboxProvider>
                                {/* <SessionProvider session={session}> */}
                                {children}
                                {/* </SessionProvider> */}
                              </MailboxProvider>
                            </CompanyProvider>
                          </ButtonStatusProvider>
                      </MailGraphProvider>
                    </CampaignProvider>
                  </FieldsListProvider>
                </LeadsProvider>
              </LeadSheetSidebarProvider>
            </UserContextProvider>
          </AutoGenerateProvider>
      </ThemeProvider>
    </>
  );
}
