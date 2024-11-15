import { Icons } from "@/components/icons";
import { NavInterface, NavItem, SidebarNavItem } from "@/types";
import Image from "next/image";

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};
export const users: User[] = [
  {
    id: 1,
    name: "Candice Schiner",
    company: "Dell",
    role: "Frontend Developer",
    verified: false,
    status: "Active",
  },
  {
    id: 2,
    name: "John Doe",
    company: "TechCorp",
    role: "Backend Developer",
    verified: true,
    status: "Active",
  },
  {
    id: 3,
    name: "Alice Johnson",
    company: "WebTech",
    role: "UI Designer",
    verified: true,
    status: "Active",
  },
  {
    id: 4,
    name: "David Smith",
    company: "Innovate Inc.",
    role: "Fullstack Developer",
    verified: false,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Emma Wilson",
    company: "TechGuru",
    role: "Product Manager",
    verified: true,
    status: "Active",
  },
  {
    id: 6,
    name: "James Brown",
    company: "CodeGenius",
    role: "QA Engineer",
    verified: false,
    status: "Active",
  },
  {
    id: 7,
    name: "Laura White",
    company: "SoftWorks",
    role: "UX Designer",
    verified: true,
    status: "Active",
  },
  {
    id: 8,
    name: "Michael Lee",
    company: "DevCraft",
    role: "DevOps Engineer",
    verified: false,
    status: "Active",
  },
  {
    id: 9,
    name: "Olivia Green",
    company: "WebSolutions",
    role: "Frontend Developer",
    verified: true,
    status: "Active",
  },
  {
    id: 10,
    name: "Robert Taylor",
    company: "DataTech",
    role: "Data Analyst",
    verified: false,
    status: "Active",
  },
];

export type Lead = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export const navItems: NavInterface[] = [
  {
    category: "Main",
    items: [
      {
        title: "Chat with Sally",
        href: "/chat",
        icon: "chat",
        label: "chat with sally",
        isCollapsible: false,
        beta: true,
      },
    ],
  },
  {
    category: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        label: "Dashboard",
        isCollapsible: false,
      },
      {
        title: "Inbox",
        href: "/mail",
        icon: "mail",
        label: "mail",
        isCollapsible: true,
      },
      {
        title: "Campaign",
        href: "/campaign",
        icon: "campaign",
        label: "campaign",
        isCollapsible: false,
      },
    ],
  },
  {
    category: "Extras",
    items: [
      {
        title: "Leads",
        href: "/leads",
        icon: "lead",
        label: "leads",
        isCollapsible: false,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: "analytics",
        label: "analytics",
        isCollapsible: false,
      },
      {
        title: "Settings",
        href: "/settings/account-info",
        icon: "settings",
        label: "settings",
        isCollapsible: false,
      },
    ],
  },
  {
    category: "Report a bug",
    items: [

    ],
  },
];

export const mails = [
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting Tomorrow",
    text: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William",
    date: "2023-10-22T09:00:00",
    read: true,
    labels: ["Email"],
  },
];

export type Mail = (typeof mails)[number];

export const accounts = [
  {
    label: "AgentProd - Sales Rep",
    email: "alicia@example.com",
    icon: (
      <Image
        src={"/bw-logo.png"}
        width={50}
        height={50}
        alt="Sally"
        className="w-6 h-6 ml-2" // Tailwind CSS classes for specific space
      />
    ),
  },
  {
    label: "Mark - The Marketer",
    text: "Coming soon",
    link: "https://agentprod.com/AIEmployees",
    email: "mark@example.com",
    disable: true,
    icon: (
      <Image
        src={"/mark.png"}
        width={24}
        height={24}
        alt="Mark"
        className="w-10 h-10 scale-125 " // Tailwind CSS classes for specific space
      />
    ),
  },
  {
    label: "Rema - The Recruiter",
    text: "Coming soon",
    link: "https://agentprod.com/AIEmployees",
    email: "rema@example.com",
    disable: true,
    icon: (
      <Image
        src={"/rema.png"}
        width={24}
        height={24}
        alt="Rema"
        className="w-10 h-10 scale-150" // Tailwind CSS classes for specific space
      />
    ),
  },

  // {
  //   label: "Alicia Koch",
  //   email: "alicia@gmail.com",
  //   icon: (
  //     <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  //       <title>Gmail</title>
  //       <path
  //         d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
  //         fill="currentColor"
  //       />
  //     </svg>
  //   ),
  // },
  // {
  //   label: "Alicia Koch",
  //   email: "alicia@me.com",
  //   icon: (
  //     <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  //       <title>iCloud</title>
  //       <path
  //         d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"
  //         fill="currentColor"
  //       />
  //     </svg>
  //   ),
  // },
];

export type Account = (typeof accounts)[number];

export const contacts = [
  {
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
  },
  {
    name: "Liam Wilson",
    email: "liam.wilson@example.com",
  },
  {
    name: "Olivia Davis",
    email: "olivia.davis@example.com",
  },
  {
    name: "Noah Martinez",
    email: "noah.martinez@example.com",
  },
  {
    name: "Ava Taylor",
    email: "ava.taylor@example.com",
  },
  {
    name: "Lucas Brown",
    email: "lucas.brown@example.com",
  },
  {
    name: "Sophia Smith",
    email: "sophia.smith@example.com",
  },
  {
    name: "Ethan Wilson",
    email: "ethan.wilson@example.com",
  },
  {
    name: "Isabella Jackson",
    email: "isabella.jackson@example.com",
  },
  {
    name: "Mia Clark",
    email: "mia.clark@example.com",
  },
  {
    name: "Mason Lee",
    email: "mason.lee@example.com",
  },
  {
    name: "Layla Harris",
    email: "layla.harris@example.com",
  },
  {
    name: "William Anderson",
    email: "william.anderson@example.com",
  },
  {
    name: "Ella White",
    email: "ella.white@example.com",
  },
  {
    name: "James Thomas",
    email: "james.thomas@example.com",
  },
  {
    name: "Harper Lewis",
    email: "harper.lewis@example.com",
  },
  {
    name: "Benjamin Moore",
    email: "benjamin.moore@example.com",
  },
  {
    name: "Aria Hall",
    email: "aria.hall@example.com",
  },
  {
    name: "Henry Turner",
    email: "henry.turner@example.com",
  },
  {
    name: "Scarlett Adams",
    email: "scarlett.adams@example.com",
  },
];
export const draftEmail = {
  title: "Try Agentprod for your business!",
  body: `Hi Olliver,

I wanted to tell you about this great new AI assistant tool called Agentprod that I think could really help your business. 

Agentprod is an AI-powered virtual assistant that can understand customer questions and respond with accurate answers instantly. It's perfect for automating common customer service queries so your team can focus on more complex issues.

Some key benefits:

- 24/7 availability - Agentprod never sleeps! It can handle customer queries even when your team is offline.

- Scalability - You can have as many conversations at once as you need. Agentprod can scale to handle increased demand seamlessly.

- Customizable - Easily train Agentprod to understand industry/business specific language and terminology. 

- Analytics - Get insights into the most common customer questions and queries. Use this to improve products/services.

Let me know if you would like me to set up a demo of Agentprod for your customer service team. I really think this could help reduce workload and costs while also improving customer satisfaction.

Looking forward to hearing your thoughts!

Regards,
Agent Prod`,
};

export type Contact = (typeof contacts)[number];

export const card_data = [
  {
    title: "Total Emails Sent",
    // value: dashboardData?.emails_sent,
    value: "396",
  },
  {
    title: "Engaged Leads",
    // value: dashboardData?.engaged
    value: "99",
  },
  {
    title: "Total Meetings Booked (Via Calendly)",
    // value: dashboardData?.meetings_booked
    value: "22",
  },
  {
    title: "Response Rate",
    // value: dashboardData?.response_rate
    value: "5.56%",
  },
];

export const campaigns = [
  {
    name: "AI BDR Launch: Targeting tech startups",
    persona: "Alex - Tech Enthusiast - early adopter persona",
    engaged: "54",
    response_rate: "7.00",
    bounce_rate: "0.75",
    open_rate: "48.00",
  },
  {
    name: "Scale with AI: Aimed at B2B companies seeking growth",
    persona: "Sam - Regular Subscriber - newsletter recipient persona",
    engaged: "45",
    response_rate: "4.50",
    bounce_rate: "0.50",
    open_rate: "51.00",
  },
];

export const hot_leads = [
  {
    id: 1,
    src: "/avatars/01.png",
    fallback: "TG",
    name: "Taylor Griffin",
    company: "NextGen Innovations",
  },
  {
    id: 2,
    src: "/avatars/02.png",
    fallback: "MY",
    name: "Morgan Yu",
    company: "BioTech Pioneers",
  },
  {
    id: 3,
    src: "/avatars/03.png",
    fallback: "RH",
    name: "Riley Harper",
    company: "CloudServ Inc.",
  },
  {
    id: 4,
    src: "/avatars/04.png",
    fallback: "CJ",
    name: "Casey Jordan",
    company: "Marketing Maven",
  },
  {
    id: 5,
    src: "/avatars/05.png",
    fallback: "AP",
    name: "Alex Park",
    company: "FinTech Frontiers",
  },
  {
    id: 6,
    src: "/avatars/05.png",
    fallback: "DM",
    name: "Drew Morgan",
    company: "HealthTech Connect",
  },
  {
    id: 7,
    src: "/avatars/05.png",
    fallback: "SL",
    name: "Sam Lee",
    company: "EcoTech Ventures",
  },
];
