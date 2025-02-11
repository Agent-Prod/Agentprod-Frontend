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
