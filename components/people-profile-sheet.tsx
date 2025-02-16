/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState, useEffect, JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal } from "react";
import {
  Briefcase,
  ChevronsUpDown,
  MapPinIcon,
  Phone,
  Linkedin,
  MonitorUp,
  Building2,
  Users,
  Layers,
  Activity,
  Search,
  Twitter,
  Youtube,
  Instagram,
  Star,
  Link,
  ChevronDown,
  Newspaper,
  Info,
  Tag,
  TrendingUp,
  Wrench,
  DollarSign,
  Lightbulb,
  LineChart,
  Database,
  Target,
  GraduationCap,
  Trophy,
  ThumbsUp,
  Share2,
} from "lucide-react";
import { GrScorecard } from "react-icons/gr";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import { Lead, Contact } from "@/context/lead-user";
import { ScrollArea } from "./ui/scroll-area";
import { useCompanyInfo, CompanyInfo } from "@/context/company-linkedin";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";

interface PeopleProfileSheetProps {
  data: Lead | Contact;
  companyInfoProp?: CompanyInfo;
  posts?: any;
}

interface SocialMonitoringSection {
  title: string;
  content: string[];
  icon: React.ReactNode;
}

function parseSocialMonitoringData(data: string): SocialMonitoringSection[] {
  try {
    const sections = data.split(/(?=\d+\.\s|\*\*(?=[A-Za-z]))/);

    return sections
      .map(section => {
        if (!section.trim()) return null;

        const lines = section.split('\n');
        const titleLine = lines[0].trim();

        const title = titleLine
          .replace(/^\d+\.\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/:\s*$/, '')
          .trim();

        const contentLines = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            return line
              .replace(/^\s*[-•]\s*/, '• ')
              .replace(/^\s*:\s*/, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .trim();
          })
          .filter(line => line.length > 0 && !line.match(/^\d+\./));

        if (!title || contentLines.length === 0) return null;

        return {
          title,
          content: contentLines,
          icon: getSectionIcon(title)
        };
      })
      .filter((section): section is SocialMonitoringSection =>
        section !== null && section.content.length > 0
      );
  } catch (error) {
    console.error('Error parsing social monitoring data:', error);
    return [];
  }
}

function getSectionIcon(title: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    'Key words': <Tag className="h-4 w-4" />,
    'Products/services': <Layers className="h-4 w-4" />,
    'Firmographics': <Building2 className="h-4 w-4" />,
    'Business indicators': <TrendingUp className="h-4 w-4" />,
    'Customer strategies': <Users className="h-4 w-4" />,
    'Product development': <Wrench className="h-4 w-4" />,
    'Funding': <DollarSign className="h-4 w-4" />,
    'Innovation': <Lightbulb className="h-4 w-4" />,
    'Recent news': <Newspaper className="h-4 w-4" />,
    'Strategic partnerships': <Link className="h-4 w-4" />,
    'Financial overview': <LineChart className="h-4 w-4" />,
    'Technology stack': <Database className="h-4 w-4" />,
    'Competitors': <Target className="h-4 w-4" />,
    'Industry trends': <TrendingUp className="h-4 w-4" />,
  };

  // Find matching icon by checking if title includes any of the keys
  const matchingKey = Object.keys(iconMap).find(key =>
    title.toLowerCase().includes(key.toLowerCase())
  );

  return matchingKey ? iconMap[matchingKey] : <Info className="h-4 w-4" />;
}

function parsePersonalizedSocialInfo(data: string): SocialMonitoringSection[] {
  try {
    const sections = data.split(/(?=\*\*\d+\.\s)/);

    return sections
      .map(section => {
        if (!section.trim()) return null;

        const lines = section.split('\n');
        const titleLine = lines[0].trim();

        const title = titleLine
          .replace(/^\*\*\d+\.\s/, '')
          .replace(/\*\*/, '')
          .trim();

        const contentLines = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            return line
              .replace(/^\s*[-•]\s*/, '• ')
              .replace(/\*\*([^*]+)\*\*/g, '$1')
              .replace(/\*/g, '')
              .trim();
          })
          .filter(line => line.length > 0);

        if (!title || contentLines.length === 0) return null;

        return {
          title,
          content: contentLines,
          icon: getPersonalInfoIcon(title)
        };
      })
      .filter((section): section is SocialMonitoringSection =>
        section !== null && section.content.length > 0
      );
  } catch (error) {
    console.error('Error parsing personalized social info:', error);
    return [];
  }
}

function getPersonalInfoIcon(title: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    'Job Title': <Briefcase className="h-4 w-4" />,
    'Recent Promotions': <TrendingUp className="h-4 w-4" />,
    'Achievements': <Star className="h-4 w-4" />,
    'Work History': <Building2 className="h-4 w-4" />,
    'Professional Background': <Users className="h-4 w-4" />,
    'Education Background': <GraduationCap className="h-4 w-4" />,
    'Top 5 Skills': <Wrench className="h-4 w-4" />,
    'Key Awards': <Trophy className="h-4 w-4" />,
    'Endorsements': <ThumbsUp className="h-4 w-4" />,
    'Social Media Activity': <Share2 className="h-4 w-4" />,
    'Mentions Elsewhere': <Link className="h-4 w-4" />,
    'Industry Involvement': <Users className="h-4 w-4" />,
  };

  const matchingKey = Object.keys(iconMap).find(key =>
    title.toLowerCase().includes(key.toLowerCase())
  );

  return matchingKey ? iconMap[matchingKey] : <Info className="h-4 w-4" />;
}

export const PeopleProfileSheet = ({
  data,
  companyInfoProp,
  posts,
}: PeopleProfileSheetProps) => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [addressCollapsibleOpen, setAddressCollapsibleOpen] = useState(false);
  const [painPointsCollapsibleOpen, setPainPointsCollapsibleOpen] =
    useState(false);
  const [technologiesCollapsibleOpen, setTechnologiesCollapsibleOpen] =
    useState(false);
  const [complimentsCollapsibleOpen, setComplimentsCollapsibleOpen] =
    useState(false);
  const [linkedinPostsCollapsibleOpen, setLinkedinPostsCollapsibleOpen] =
    useState(false);
  const [valueCollapsibleOpen, setValueCollapsibleOpen] = useState(false);
  const [metricsCollapsibleOpen, setMetricsCollapsibleOpen] = useState(false);
  const [affiliatedPagesCollapsibleOpen, setAffiliatedPagesCollapsibleOpen] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [qualificationsCollapsibleOpen, setQualificationsCollapsibleOpen] =
    useState(false);
  const { getCompanyInfo, companyInfo, setCompanyLinkedin } = useCompanyInfo();
  const [subdepartmentsCollapsibleOpen, setSubdepartmentsCollapsibleOpen] =
    useState(false);
  // const [companyCollapsibleOpen, setCompanyCollapsibleOpen] = useState(false);
  const [socialMonitoringOpen, setSocialMonitoringOpen] = useState(false);

  console.log("Leads Data for Indiviual User", data);

  const initials = (name: string) => {
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  const formatName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  const formatText = (text: string) => {
    let spacedText = text.replace(/_+/g, " ");
    return spacedText[0].toUpperCase() + spacedText.slice(1).toLowerCase();
  };

  const isDisplayableImage = (url: string) => {
    // Check if the URL contains common image formats or doesn't contain 'pdf'
    return !url.toLowerCase().includes('pdf');
  };

  useEffect(() => {
    console.log(data);
    const fetchCompanyInfo = async () => {
      if (data) {
        if (!companyInfoProp) {
          if ("company_linkedin_url" in data && data.company_linkedin_url) {
            getCompanyInfo(data.company_linkedin_url);
          }
        } else {
          setCompanyLinkedin(companyInfoProp);
        }
      }
    };

    fetchCompanyInfo();
    setLoading(false);
  }, [data]);

  useEffect(() => {
    console.log("Company Info: ", companyInfo);
  }, [companyInfo]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (posts === "No posts available") {
    return null;
  }
  if (!data) {
    return <div>No lead found.</div>;
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="p-4 h-full">
            <div className="flex">
              <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                <AvatarImage src={data?.photo_url ?? data?.organization?.logo_url} alt="avatar" />
                <AvatarFallback>{initials(data?.name || "AP")}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 w-full">
                <p className="text-sm font-medium leading-none whitespace-normal w-full">
                  {data.name}
                </p>
                <p className="text-sm text-muted-foreground whitespace-normal w-full">
                  {data.email}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pt-4 whitespace-normal w-full">
              {data.headline}
            </p>
            <br />
            <div className="pt-4 space-y-3 w-full">
              <div className="flex space-x-2 w-full">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground whitespace-normal w-full">
                  {data.title}
                </span>
              </div>
              <div className="flex space-x-2 w-full">
                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground whitespace-normal w-full">
                  {data.state && `${data.state}, `}
                  {data.country}
                </span>
              </div>
              <div className="flex space-x-2 w-full">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground whitespace-normal w-full">
                  {data?.employment_history
                    ? data?.employment_history[0]?.organization_name
                    : data.company}
                </span>
              </div>
              {/* {data.phone_numbers && (
                <div className="flex space-x-2 w-full">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground whitespace-normal w-full">
                    {data.phone_numbers[0]?.sanitized_number || data.phone}
                  </span>
                </div>
              )} */}
              <div className="flex space-x-2 w-full">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground whitespace-normal w-full underline">
                  <a
                    href={data.linkedin_url ? (data.linkedin_url.startsWith('http') ? data.linkedin_url : `https://www.${data.linkedin_url}`) : ""}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {data.linkedin_url || "N/A"}
                  </a>
                </span>
              </div>
              {data.seniority && (
                <div className="flex space-x-2 w-full">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground whitespace-normal w-full">
                    Seniority: {data.seniority.toLocaleUpperCase()}
                  </span>
                </div>
              )}
              {data.departments && data.departments.length > 0 && (
                <div className="flex space-x-2 w-full">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground whitespace-normal w-full">
                    Department: {data.departments.map(formatName).join(", ")}
                  </span>
                </div>
              )}

              {data.subdepartments && data.subdepartments.length > 0 && (
                <Collapsible
                  open={subdepartmentsCollapsibleOpen}
                  onOpenChange={setSubdepartmentsCollapsibleOpen}
                  className="pt-2 space-y-2 text-muted-foreground w-full"
                >
                  <div className="flex items-center justify-between space-x-4 w-full">
                    <div className="flex space-x-2 w-full">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground whitespace-normal w-full">
                        Sub-departments
                      </span>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2 w-full">
                    {data.subdepartments.map((subdepartment, index) => (
                      <div
                        key={index}
                        className="flex px-2 py-1 font-mono text-xs justify-between w-full"
                      >
                        <span className="w-full whitespace-normal">
                          {formatName(subdepartment)}
                        </span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
              {data.functions && data.functions.length > 0 && (
                <div className="flex space-x-2 w-full">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground whitespace-normal w-full">
                    Functions: {data.functions.map(formatName).join(", ")}
                  </span>
                </div>
              )}
            </div>
            <br />

            {data.organization && (
              <>
                <div className="text-sm text-muted-foreground whitespace-normal w-full">
                  <span className="font-semibold">Industry:</span>{" "}
                  {data.organization.industry || "N/A"}
                </div>
                <div className="text-sm text-muted-foreground whitespace-normal w-full">
                  <span className="font-semibold">Company Size:</span>{" "}
                  {data.organization.estimated_num_employees
                    ? `${data.organization.estimated_num_employees} employees`
                    : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground whitespace-normal w-full">
                  <span className="font-semibold">Headquarters:</span>{" "}
                  {`${data.organization.city || "N/A"}, ${data.organization.state || "N/A"
                    }, ${data.organization.country || "N/A"}`}
                </div>
                <div className="text-sm text-muted-foreground whitespace-normal w-full">
                  <span className="font-semibold">Type:</span>{" "}
                  {data.organization.publicly_traded_symbol
                    ? "Publicly Traded"
                    : "Privately Held"}
                </div>
                <div className="text-sm text-muted-foreground whitespace-normal w-full">
                  <span className="font-semibold">Founded:</span>{" "}
                  {data.organization.founded_year || "N/A"}
                </div>
                <div className="text-sm text-muted-foreground whitespace-normal w-full">
                  <span className="font-semibold">Website:</span>{" "}
                  {data.organization.website_url ? (
                    <a
                      href={data.organization.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data.organization.website_url}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </div>
                {data.organization.keywords &&
                  data.organization.keywords.length > 0 && (
                    <div className="text-sm text-muted-foreground whitespace-normal w-full">
                      <span className="font-semibold">Keywords:</span>{" "}
                      {data.organization.keywords.join(", ")}
                    </div>
                  )}
                {((data.organization.industries &&
                  data.organization.industries.length > 0) ||
                  (data.organization.secondary_industries &&
                    data.organization.secondary_industries.length > 0)) && (
                    <div className="text-sm text-muted-foreground whitespace-normal w-full">
                      <span className="font-semibold">
                        Industries & Specialties:
                      </span>{" "}
                      {[
                        ...(data.organization.industries || []),
                        ...(data.organization.secondary_industries || []),
                      ].join(", ")}
                    </div>
                  )}
              </>
            )}

            {/* Show here */}
            {companyInfo && (
              <div className="flex flex-col gap-2 w-full">
                {companyInfo.company_info &&
                  Object.entries(companyInfo.company_info).map(
                    ([key, value]) => (
                      <div
                        className="text-sm font-semibold text-muted-foreground whitespace-normal w-full"
                        key={key}
                      >
                        {formatText(key)}:{" "}
                        <span className="text-sm font-normal text-muted-foreground whitespace-normal w-full">
                          {value as string}
                        </span>
                      </div>
                    )
                  )}

                {companyInfo.addresses && companyInfo.addresses.length > 0 && (
                  <Collapsible
                    open={addressCollapsibleOpen}
                    onOpenChange={setAddressCollapsibleOpen}
                    className="pt-4 space-y-2 text-muted-foreground w-full"
                  >
                    <div className="flex items-center justify-between space-x-4 w-full">
                      <h4 className="text-sm font-semibold">Addresses</h4>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <ChevronsUpDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <div className="px-2 py-1 text-xs whitespace-normal w-full">
                      {companyInfo.addresses[0].replace("Get directions", "")}
                    </div>
                    <CollapsibleContent className="space-y-2 w-full">
                      <div className="flex flex-col gap-2 px-2 w-full">
                        {companyInfo.addresses.map((address, index) => {
                          if (index === 0) return null;
                          else {
                            return (
                              <div
                                className="text-xs text-muted-foreground whitespace-normal w-full"
                                key={index}
                              >
                                {address.replace("Get directions", "")}
                              </div>
                            );
                          }
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {companyInfo.affiliated_pages &&
                  companyInfo.affiliated_pages.length > 0 && (
                    <Collapsible
                      open={affiliatedPagesCollapsibleOpen}
                      onOpenChange={setAffiliatedPagesCollapsibleOpen}
                      className="pt-4 space-y-2 text-muted-foreground w-full"
                    >
                      <div className="flex items-center justify-between space-x-4 w-full">
                        <div className="text-sm font-medium text-muted-foreground">
                          Affiliated Pages:
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="space-y-2 w-full">
                        {companyInfo.affiliated_pages.title.map(
                          (title: any, index: any) =>
                            index > 0 && (
                              <div
                                className="px-2 py-1 text-xs text-muted-foreground whitespace-normal w-full"
                                key={index}
                              >
                                {title}
                                {companyInfo.affiliated_pages.description[
                                  index
                                ] &&
                                  ` - ${companyInfo.affiliated_pages.description[index]}`}
                              </div>
                            )
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                {companyInfo.stock_info &&
                  Object.entries(companyInfo.stock_info).length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground">
                        Stock Info:
                      </div>
                      {Object.entries(companyInfo.stock_info).map(
                        ([key, value]) => (
                          <div
                            className="text-muted-foreground text-sm whitespace-normal w-full"
                            key={key}
                          >
                            {formatText(key)}:{" "}
                            <span className="font-normal">
                              {value as string}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {companyInfo.funding_info &&
                  Object.entries(companyInfo.funding_info).length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground">
                        Funding Info:
                      </div>
                      {Object.entries(companyInfo.funding_info).map(
                        ([key, value]) => (
                          <div
                            className="text-muted-foreground text-sm whitespace-normal w-full"
                            key={key}
                          >
                            {formatText(key)}: <span>{value as string}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {data?.qualification_details &&
                  data.qualification_details.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground">
                        Qualifications:
                      </div>
                      {data.qualification_details.map(
                        (qual: any, ind: number) => (
                          <div
                            className="flex text-muted-foreground flex-col px-2 py-1 font-mono text-xs w-full"
                            key={`qual_${ind}`}
                          >
                            <span className="font-semibold">
                              Q: {qual.question}
                            </span>
                            <span>A: {qual.answer}</span>
                            <span>
                              Qualifies: {qual.qualifies ? "Yes" : "No"}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {/* Qualifications */}
                {/* <Collapsible
                  open={qualificationsCollapsibleOpen}
                  onOpenChange={setQualificationsCollapsibleOpen}
                  className="pt-4 space-y-2 text-muted-foreground w-full"
                >
                  <div className="flex items-center justify-between space-x-4 w-full">
                    <h4 className="text-sm font-semibold">Qualifications</h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  {data?.qualification_details && (
                    <>
                      <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                        <span>{data?.qualification_details[0]?.question}</span>
                      </div>
                      <CollapsibleContent className="space-y-2 w-full">
                        {data.qualification_details.map(
                          (qual: any, ind: number) => (
                            <div
                              className="flex flex-col px-2 py-1 font-mono text-xs w-full"
                              key={`qual_${ind}`}
                            >
                              <span className="font-semibold">
                                Q: {qual.question}
                              </span>
                              <span>A: {qual.answer}</span>
                              <span>
                                Qualifies: {qual.qualifies ? "Yes" : "No"}
                              </span>
                            </div>
                          )
                        )}
                      </CollapsibleContent>
                    </>
                  )}
                </Collapsible> */}

                {/* Qualifications */}
              </div>
            )}

            {/* Show here */}
            <Collapsible
              open={collapsibleOpen}
              onOpenChange={setCollapsibleOpen}
              className="pt-4 space-y-2 text-muted-foreground w-full"
            >
              <div className="flex items-center justify-between space-x-4 w-full">
                <h4 className="text-sm font-semibold">Work History</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              {data?.employment_history && (
                <>
                  <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                    <span>
                      {data?.employment_history[0]?.start_date
                        ? data.employment_history[0].start_date.substring(0, 4)
                        : ""}{" "}
                      - present
                    </span>
                    <span className="w-full whitespace-normal">
                      {data?.employment_history[0]?.title}
                    </span>
                  </div>
                  <CollapsibleContent className="space-y-2 w-full">
                    {data.employment_history.map((val, ind) => {
                      if (ind === 0) return null;
                      return (
                        <div
                          className="flex px-2 py-1 font-mono text-xs justify-between w-full"
                          key={`e_his${ind}`}
                        >
                          <span>
                            {/* {val.start_date.substring(0, 4)} -{" "} */}
                            {val.end_date ? val.end_date.substring(0, 4) : ""}
                          </span>
                          <span className="w-full whitespace-normal">
                            {val.title}
                          </span>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </>
              )}
            </Collapsible>

            <br />

            {data.linkedin_bio && <h5 className="text-sm font-medium text-muted-foreground pb-2 flex items-center gap-2"> <Linkedin className="h-4 w-4 text-muted-foreground " />LinkedIn Bio</h5>}
            {data.linkedin_bio && <div className="text-xs text-muted-foreground">{data.linkedin_bio}</div>}
            <br />

            {/* Posts */}
            <Collapsible
              open={linkedinPostsCollapsibleOpen}
              onOpenChange={setLinkedinPostsCollapsibleOpen}
              className="pt-4 space-y-2 text-muted-foreground w-full"
            >
              <div className="flex items-center justify-between space-x-4 w-full">
                <h4 className="text-sm font-semibold flex items-center gap-2"> <Linkedin className="h-4 w-4 text-muted-foreground " />LinkedIn Posts</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>

              {data.linkedin_posts && data.linkedin_posts.length > 0 && (
                <>
                  {data.linkedin_posts.map((post: { split: (arg0: string) => [any, any]; }, index: number) => {
                    // Split the post text and attachments if they exist
                    const [postText, attachmentsText] = post.split("[Attachments:");
                    const attachments = attachmentsText
                      ? attachmentsText.replace("]", "").split(", ")
                      : [];

                    // Truncate the post text if it's too long
                    const displayText = postText.length > 300 ? postText.substring(0, 300) + "..." : postText;

                    return (
                      <div key={`post_${index}`} className="border-white/20 border rounded-md p-2">
                        <div className="text-sm font-semibold mb-2">Post {index + 1}</div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-grow">
                            <p className="text-xs whitespace-pre-wrap break-words">{displayText}</p>
                          </div>
                        </div>
                        {attachments.length > 0 && (
                          <div className="mt-2">
                            {attachments.map((attachment: string, attachmentIndex: number) => (
                              <div key={`attachment_${attachmentIndex}`} className="mt-2">
                                {isDisplayableImage(attachment) ? (
                                  <Image src={attachment} alt={`Attachment ${attachmentIndex + 1}`} width={200} height={200} />
                                ) : (
                                  <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    View Attachment {attachmentIndex + 1}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </Collapsible>
            {/* Posts */}

            {/* Company Research Section */}
            {data.social_monitoring_data && (
              <div className="pt-4 space-y-2 text-muted-foreground w-full">
                <div className="flex items-center space-x-4 w-full">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MonitorUp className="h-4 w-4 text-muted-foreground" />
                    Company Research
                  </h4>
                </div>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {data.social_monitoring_data.split('\n').map((line, index) => {
                        // Handle bold text wrapped in **
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <p key={index} className=" py-1">
                              {line.replace(/\*\*/g, '')}
                            </p>
                          );
                        }
                        // Handle numbered points
                        if (/^\d+\.\s/.test(line)) {
                          return (
                            <p key={index} className="py-1">
                              <span className="">{line}</span>
                            </p>
                          );
                        }
                        // Regular text
                        return (
                          <p key={index} className="py-1">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Personalized Social Info */}
            {data.personalized_social_info && (
              <div className="pt-4 space-y-2 text-muted-foreground w-full">
                <div className="flex items-center space-x-4 w-full">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Professional Profile
                  </h4>
                </div>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {parsePersonalizedSocialInfo(data.personalized_social_info)
                      .filter(section => section.content.length > 0)
                      .map((section, index) => (
                        <div key={index} className="space-y-2">
                          <h5 className="text-sm font-semibold flex items-center gap-2">
                            {section.icon}
                            {section.title}
                          </h5>
                          <div className="space-y-1">
                            {section.content.map((item, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">
                                {item.startsWith('-') || item.startsWith('•') ? item : `• ${item}`}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Technologies */}

            {/* <Collapsible
              open={technologiesCollapsibleOpen}
              onOpenChange={setTechnologiesCollapsibleOpen}
              className="pt-4 space-y-2 text-muted-foreground w-full"
            >
              <div className="flex items-center justify-between space-x-4 w-full">
                <h4 className="text-sm font-semibold">Technologies</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              {data?.technologies && data.technologies.length > 0 ? (
                <>
                  <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                    <span>{data.technologies[0]}</span>
                  </div>
                  <CollapsibleContent className="space-y-2 w-full">
                    {data.technologies.slice(1).map((val, ind) => (
                      <div
                        className="flex px-2 py-1 font-mono text-xs justify-between w-full"
                        key={`e_his${ind + 1}`}
                      >
                        <span className="w-full whitespace-normal">{val}</span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </>
              ) : (
                <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                  <span>No data available</span>
                </div>
              )}
            </Collapsible> */}

            {/* Technologies */}

            {/* Pain Points */}
            <Collapsible
              open={painPointsCollapsibleOpen}
              onOpenChange={setPainPointsCollapsibleOpen}
              className="pt-4 space-y-2 text-muted-foreground w-full"
            >
              <div className="flex items-center justify-between space-x-4 w-full">
                <h4 className="text-sm font-semibold">Pain Poitns</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              {data?.pain_points && (
                <>
                  <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                    <span>{data?.pain_points[0]}</span>
                  </div>
                  <CollapsibleContent className="space-y-2 w-full">
                    {data.pain_points.map((val: any, ind: any) => {
                      if (ind === 0) return null;
                      return (
                        <div
                          className="flex px-2 py-1 font-mono text-xs justify-between w-full"
                          key={`e_his${ind}`}
                        >
                          <span className="w-full whitespace-normal">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </>
              )}
            </Collapsible>

            {/* Pain Points */}

            {/* Value */}
            <Collapsible
              open={valueCollapsibleOpen}
              onOpenChange={setValueCollapsibleOpen}
              className="pt-4 space-y-2 text-muted-foreground w-full"
            >
              <div className="flex items-center justify-between space-x-4 w-full">
                <h4 className="text-sm font-semibold">Values</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              {data?.value && (
                <>
                  <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                    <span>{data?.value[0]}</span>
                  </div>
                  <CollapsibleContent className="space-y-2 w-full">
                    {data.value.map((val: any, ind: any) => {
                      if (ind === 0) return null;
                      return (
                        <div
                          className="flex px-2 py-1 font-mono text-xs justify-between w-full"
                          key={`e_his${ind}`}
                        >
                          <span className="w-full whitespace-normal">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </>
              )}
            </Collapsible>

            {/* Value */}

            {/* Metrics */}
            <Collapsible
              open={metricsCollapsibleOpen}
              onOpenChange={setMetricsCollapsibleOpen}
              className="pt-4 space-y-2 text-muted-foreground w-full"
            >
              <div className="flex items-center justify-between space-x-4 w-full">
                <h4 className="text-sm font-semibold">Metrics</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              {data?.metrics && (
                <>
                  <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                    <span>{data?.metrics[0]}</span>
                  </div>
                  <CollapsibleContent className="space-y-2 w-full">
                    {data.metrics.map((val: any, ind: any) => {
                      if (ind === 0) return null;
                      return (
                        <div
                          className="flex px-2 py-1 font-mono text-xs justify-between w-full"
                          key={`e_his${ind}`}
                        >
                          <span className="w-full whitespace-normal">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </>
              )}
            </Collapsible>

            {/* Metrics */}

            {/* Compliments */}
            <Collapsible
              open={complimentsCollapsibleOpen}
              onOpenChange={setComplimentsCollapsibleOpen}
              className="pt-4 space-y-2 text-muted-foreground w-full"
            >
              <div className="flex items-center justify-between space-x-4 w-full">
                <h4 className="text-sm font-semibold">Compliments</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              {data?.compliments && (
                <>
                  <div className="flex px-2 py-1 font-mono text-xs justify-between w-full">
                    <span>{data?.compliments[0]}</span>
                  </div>
                  <CollapsibleContent className="space-y-2 w-full">
                    {data.compliments.map((val: any, ind: any) => {
                      if (ind === 0) return null;
                      return (
                        <div
                          className="flex px-2 py-1 font-mono text-xs justify-between w-full"
                          key={`e_his${ind}`}
                        >
                          <span className="w-full whitespace-normal">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </>
              )}
            </Collapsible>

            {/* Compliments */}
            <br />
            <p className="flex gap-2 items-center text-sm text-muted-foreground whitespace-normal w-full">
              <Building2 className="h-4 w-4" />
              Company Type: {data?.is_b2b ? "B2B" : "B2C"}
            </p>
            <br />
            <p className="flex gap-2 items-center text-sm text-muted-foreground whitespace-normal w-full">
              <GrScorecard className="h-4 w-4" />
              Score: {data?.score ? data?.score + "/10" : "Score not available"}
            </p>
            <br />
            <div className="flex space-x-2 w-full">
              <MonitorUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground whitespace-normal w-full">
                {data?.lead_information || "No Information"}
              </span>
            </div>

            <br />
            <br />
            <div>
              <p className="text-sm font-medium leading-none whitespace-normal w-full">
                {data?.employment_history &&
                  data?.employment_history[0]?.organization_name}
              </p>
            </div>

            <br />
            {companyInfo && (
              <div className="space-y-3 w-full">
                <div className="flex space-x-2 w-full">
                  <span className="text-sm text-muted-foreground whitespace-normal w-full">
                    {companyInfo.about_us}
                  </span>
                </div>
                <br />
              </div>
            )}

            {/* Add this section after the LinkedIn Posts collapsible */}


          </div>
        </div>
      </div>
    </ScrollArea>
  );
};