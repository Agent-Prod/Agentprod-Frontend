import { cookies } from "next/headers";

import { Mail } from "../../../components/mail/mail";
import { accounts, mails } from "@/constants/data";

export default function MailPage() {
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = [100, 200, 5];
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <>
      {/* Trial Banner */}
      <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-yellow-800 text-sm font-medium text-center">
          You're on a free trial! Enjoy 100 LinkedIn outreach leads for the next 10 days. Need more? Contact us at{' '}
          <a
            href="mailto:founders@agentprod.com"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            founders@agentprod.com
          </a>
          {' '}to scale your outreach!
        </p>
      </div>
      <div className="hidden flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  );
}
