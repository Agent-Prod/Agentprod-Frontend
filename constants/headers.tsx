// pageTitleConfig.js
export const pageTitleConfig = [
  { pathname: "/dashboard", title: "Dashboard", hidden: false },
  { pathname: "/mail", title: "Mail", hidden: true },
  { pathname: "/chat", title: "Chat with Prod", hidden: true },
  { pathname: "/analytics", title: "Analytics", hidden: false },
  { pathname: "/campaign", title: "Campaign", hidden: false },
  { pathname: "/leads", title: "Leads", hidden: false },
  { pathname: "/campaign/create", title: "Create Campaign", hidden: false },
  {
    pathname: "/campaign/create/scheduling-budget",
    title: "Scheduling and Budget",
    hidden: false,
  },
  {
    pathname: "/campaign/create/offering",
    title: "Offering",
    hidden: false,
  },
  {
    pathname: "/campaign/create/goal",
    title: "Goal",
    hidden: false,
  },
  {
    pathname: "/campaign/create/audience",
    title: "Audience",
    hidden: false,
  },
  {
    pathname: "/campaign/create/training",
    title: "Training",
    hidden: false,
  },
  {
    pathname: "/campaign/create/autopilot",
    title: "Autopilot",
    hidden: false,
  },
  {
    pathname: "/campaign/:id",
    title: "Campaign Details",
    hidden: false,
  },
  {
    pathname: "/campaign/:id/scheduling-budget",
    title: "Scheduling and Budget",
    hidden: false,
  },
  {
    pathname: "/campaign/:id/offering",
    title: "Offering",
    hidden: false,
  },
  {
    pathname: "/campaign/:id/goal",
    title: "Goal",
    hidden: false,
  },
  {
    pathname: "/campaign/:id/audience",
    title: "Audience",
    hidden: false,
  },
  {
    pathname: "/campaign/:id/training",
    title: "Training",
    hidden: false,
  },
  {
    pathname: "/settings/account-info",
    title: "Settings",
    subTitle: "Account Info",
    hidden: false,
  },
  {
    pathname: "/settings/mailbox",
    title: "Settings",
    subTitle: "Mailboxes",
    hidden: false,
  },
  {
    pathname: "/settings/integration",
    title: "Settings",
    subTitle: "Integrations",
    hidden: false,
  }
  // Add more configurations as needed
];

export const matchPathname = (currentPathname: string, pattern: any) => {
  const regex = new RegExp(
    "^" + pattern.replace(/:[^\s/]+/g, "([\\w-]+)") + "$"
  );
  return regex.test(currentPathname);
};
