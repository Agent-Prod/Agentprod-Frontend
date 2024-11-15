import { cookies } from "next/headers";

import { Mail } from "../../../components/mail/mail";
import { accounts, mails } from "@/constants/data";

export default function MailPage() {
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = [100, 200, 5];
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <>
      {/* <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div> */}
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
