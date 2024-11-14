/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronUp, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tag, TagInput, Tag as type } from "@/components/ui/tag/tag-input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { Contact, Lead, useLeads } from "@/context/lead-user";
import { LoadingCircle } from "@/app/icons";
import { AudienceTableClient } from "../tables/audience-table/client";
import { v4 as uuid } from "uuid";
import { orgLocations, jobTitles, seniorities, InputType, companyDomains, technologies } from "./formUtils";
import { Checkbox } from "@/components/ui/checkbox";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "@/context/user-context";
import { useParams } from "next/navigation";
import { getAudienceFiltersById } from "../campaign/camapign.api";
import { keywords } from "./formUtils";
import { ScrollArea } from "../ui/scroll-area";
import { useButtonStatus } from "@/context/button-status";
import AudienceTable from "../ui/AudienceTable";
import axios from "axios";
import { useSubscription } from "@/hooks/userSubscription";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { headers } from "next/headers";
import { Loader2 } from "lucide-react"
import ApifyAccountManager from "@/utils/apify-account-manager";



const FormSchema = z.object({
  q_organization_domains: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  organization_industry_tag_ids: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      value: z.string(),
    })
  ),
  q_organization_keyword_tags: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
  organization_locations: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
  email_status: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  company_headcount: z.array(z.string()).optional(),
  organization_latest_funding_stage_cd: z.array(z.string()).optional(),
  minimum_company_funding: z
    .object({
      id: z.string(),
      text: z.number(),
    })
    .optional(),
  maximum_company_funding: z
    .object({
      id: z.string(),
      text: z.number(),
    })
    .optional(),
  per_page: z.number(),
  person_titles: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  trading_statuses: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  organization_job_locations: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  q_organization_job_titles: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  // search_signals: z company_headcount: z.array(z.string()).optional(),
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       text: z.string()
  //     })
  //   )
  //   .optional(),
  search_signals: z.array(z.string()).optional(),
  buying_intent_topics: z.array(z.string()).optional(),
  buying_intent_scores: z.array(z.string()).optional(),
  job_posting_titles: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  job_posting_locations: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  currently_using_technologies: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
});

export default function PeopleForm(): JSX.Element {
  const params = useParams<{ campaignId: string }>();
  const { user } = useUserContext();

  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [editFilters, setEditFilters] = React.useState<any>(null);

  const { leads, setLeads } = useLeads();
  const { isSubscribed } = useSubscription();
  const [existLead, setExistLead] = useState([]);
  const [tab, setTab] = useState("tab1");
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isCreateBtnLoading, setIsCreateBtnLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //   const [tags, setTags] = React.useState<Tag[]>([]);
  const [organizationLocationsTags, setOrganizationLocationsTags] =
    React.useState<Tag[]>([]);

  const [personSenioritiesTags, setPersonSenioritiesTags] = React.useState<
    Tag[]
  >([]);

  const [qOrganizationDomainsTags, setQOrganizationDomainsTags] =
    React.useState<Tag[]>([]);

  const [personTitlesTags, setPersonTitlesTags] = React.useState<Tag[]>([]);

  const [jobPostingTitles, setJobPostingTitles] = React.useState<Tag[]>([]);
  const [jobPostingLocations, setJobPostingLocations] = React.useState<Tag[]>([]);

  const [checkedFundingRounds, setCheckedFundingRounds] = React.useState<string[]>([]);

  const [checkedCompanyHeadcount, setCheckedCompanyHeadcount] =
    React.useState<string[]>();

  const [checkedSearchSignal, setCheckedSearchSignal] =
    React.useState<string[]>([]);

  const [checkedIntentTopics, setCheckedIntentTopics] = React.useState<string[]>();
  const [checkedIntentScores, setCheckedIntentScores] = React.useState<string[]>();

  const [minimumCompanyFunding, setMinimumCompanyFunding] =
    React.useState<InputType>({
      id: "",
      text: 0,
    });

  const [maximumCompanyFunding, setMaximumCompanyFunding] =
    React.useState<InputType>({
      id: "",
      text: 0,
    });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [calculatedPages, setCalculatedPages] = useState(1);
  const [filteredKeywords, setFilteredKeywords] = useState(keywords);
  const [keywordSearchTerm, setKeywordSearchTerm] = useState("");

  const [jobLocationTags, setJobLocationTags] = React.useState<Tag[]>([]);

  const [jobOfferingTags, setJobOfferingTags] = React.useState<Tag[]>([]);

  const [organizationKeywordTags, setOrganizationKeywordTags] = React.useState<
    Tag[]
  >([]);

  const [currentlyUsingTechnologiesTags, setCurrentlyUsingTechnologiesTags] = React.useState<
    Tag[]
  >([]);

  const [filteredTechnologies, setFilteredTechnologies] = useState(technologies);
  const [technologiesSearchTerm, setTechnologiesSearchTerm] = useState("");
  const [technologiesDropdownIsOpen, setTechnologiesDropdownIsOpen] = useState(false);
  const technologyDropdownRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [apolloUrl, setApolloUrl] = useState("");
  const [organizationCompanyTags, setOrganizationCompanyTags] = React.useState<
    Tag[]
  >([]);

  const keywordDropdownRef = useRef<HTMLDivElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  const companyDropdownRef = useRef<HTMLDivElement>(null);

  const { setValue } = form;

  interface Data {
    q_organization_domains: { id: string; text: string }[] | undefined;
    organization_locations: { id: string; text: string }[] | undefined;
    person_titles: { id: string; text: string }[] | undefined;
    email_status: { id: string; text: string }[] | undefined;
    company_headcount: { id: string; text: string }[] | undefined;
    organization_latest_funding_stage_cd:
    | { id: string; text: string }[]
    | undefined;
    minimum_company_funding: { id: string; text: number } | undefined;
    maximum_company_funding: { id: string; text: number } | undefined;
    per_page: { id: string; text: number } | undefined;
    q_keywords: { id: string; text: string } | undefined;
    organization_job_locations: { id: string; text: string }[] | undefined;
    q_organization_job_titles: { id: string; text: string }[] | undefined;
    search_signals: { id: string; text: string }[] | undefined;
  }

  interface TagInput {
    id: string;
    text: string;
  }

  // Assuming prevInputValues is a useRef with the initial structure
  const prevInputValues = React.useRef<any>();

  // const email_status = React.useRef<{ text: string }>({
  //   text: "",
  // });

  const [allFilters, setAllFilters] = React.useState<any>();

  const [allFiltersFromDB, setAllFiltersFromDB] = React.useState<any>();
  const [jobTitleDropdownIsOpen, setJobTitleDropdownIsOpen] = useState(false);
  const [filteredJobTitles, setFilteredJobTitles] = useState(jobTitles);
  const [jobTitleSearchTerm, setJobTitleSearchTerm] = useState("");
  const jobTitleDropdownRef = useRef<HTMLDivElement>(null);
  const jobTitleInputRef = useRef<HTMLInputElement>(null);

  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [isLoadingTotalLeads, setIsLoadingTotalLeads] = useState(false);

  const [locationDropdownIsOpen, setLocationDropdownIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(orgLocations);
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);


  const [audienceId, setAudienceId] = React.useState<string>();
  const { setPageCompletion } = useButtonStatus();
  const [type, setType] = useState<"create" | "edit">("create");

  const [companyDomainDropdownIsOpen, setCompanyDomainDropdownIsOpen] = useState(false);
  const [filteredCompanyDomains, setFilteredCompanyDomains] = useState(companyDomains)
  const [companyDomainSearchTerm, setCompanyDomainSearchTerm] = useState("");
  const companyDomainDropdownRef = useRef<HTMLDivElement>(null);
  const companyDomainInputRef = useRef<HTMLInputElement>(null);
  const [selectionType, setSelectionType] = useState('list');



  const handleSelectionTypeChange = (value: any) => {
    setSelectionType(value);
    if (value === 'list') {
      setQOrganizationDomainsTags([]);
      setValue('q_organization_domains', [])
    } else {
      setQOrganizationDomainsTags([]);
      setValue('q_organization_domains', []);
    }
  };

  const handleCompanyDomainDropdownSelect = (company: any) => {
    const newTag = { text: company.companyName, id: company.organizationId };

    if (!qOrganizationDomainsTags.some((tag) => tag.text === company.companyName)) {
      const updatedTags = [...qOrganizationDomainsTags, newTag];
      setQOrganizationDomainsTags(updatedTags);
      setValue('q_organization_domains', updatedTags);
    }
    setCompanyDomainSearchTerm('');
    setCompanyDomainDropdownIsOpen(false);
  };

  useEffect(() => {
    const filtered = companyDomains
      .filter((company) =>
        company.companyName.toLowerCase().includes(companyDomainSearchTerm.toLowerCase())
      )
      .map((company) => company);

    setFilteredCompanyDomains(filtered);
  }, [companyDomainSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDomainDropdownRef.current &&
        !companyDomainDropdownRef.current.contains(event.target as Node) &&
        !companyDomainInputRef.current?.contains(event.target as Node)
      ) {
        setCompanyDomainDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleJobTitleDropdown = (isOpen: boolean) => {
    setJobTitleDropdownIsOpen(isOpen);
  };

  const handleJobTitleDropdownSelect = (title: string) => {
    const newTag: Tag = {
      text: title,
      id: title,
    };

    if (
      !personTitlesTags.some(
        (tag) => tag.text.toLowerCase() === title.toLowerCase()
      )
    ) {
      const updatedTags = [...personTitlesTags, newTag];
      setPersonTitlesTags(updatedTags);
      setValue("person_titles", updatedTags as [Tag, ...Tag[]]);
    }
    setJobTitleSearchTerm("");
    setJobTitleDropdownIsOpen(false);
  };

  useEffect(() => {
    const filtered = jobTitles.filter((title) =>
      title.toLowerCase().includes(jobTitleSearchTerm.toLowerCase())
    );
    setFilteredJobTitles(filtered);
    setJobTitleDropdownIsOpen(jobTitleSearchTerm.length > 0);
  }, [jobTitleSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        jobTitleDropdownRef.current &&
        !jobTitleDropdownRef.current.contains(event.target as Node) &&
        !jobTitleInputRef.current?.contains(event.target as Node)
      ) {
        setJobTitleDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleLocationDropdown = (isOpen: boolean) => {
    setLocationDropdownIsOpen(isOpen);
  };

  const handleLocationDropdownSelect = (location: string) => {
    const newTag: Tag = {
      text: location,
      id: location,
    };

    if (
      !organizationLocationsTags.some(
        (tag) => tag.text.toLowerCase() === location.toLowerCase()
      )
    ) {
      const updatedTags = [...organizationLocationsTags, newTag];
      setOrganizationLocationsTags(updatedTags);
      setValue("organization_locations", updatedTags as [Tag, ...Tag[]]);
    }
    setLocationSearchTerm("");
    setLocationDropdownIsOpen(false);
  };

  useEffect(() => {
    const filtered = orgLocations.filter((location) =>
      location.toLowerCase().includes(locationSearchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
    setLocationDropdownIsOpen(locationSearchTerm.length > 0);
  }, [locationSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setLocationDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/lead/campaign/${params.campaignId}`
          );
          const data = await response.json();
          if (data.detail === "No Contacts found") {
            setType("create");
          } else {
            // setGoalData(data);
            // setAllFiltersFromDB(data.filters_applied);
            console.log("data ==>", data);
            setType("edit");
            try {
              const audienceFilters = await getAudienceFiltersById(id);
              console.log(
                "response from audience filters",
                audienceFilters.filters_applied
              );
              setAllFiltersFromDB(audienceFilters.filters_applied);
              setEditFilters(audienceFilters.filters_applied);
              setAudienceId(audienceFilters.id);
              populateFormWithExistingFilters(audienceFilters.filters_applied);
            } catch (error) {
              console.error("Error fetching audience filters:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
          toast.error("An error occurred while submitting the form");
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);

  // React.useEffect(() => {
  //   console.log("current form values", form.getValues());
  // }, [form]);

  const onTabChange = async (value: any) => {
    if (isSubmitting) {
      return; // Don't allow tab changes while submitting
    }
    //TODO: only change the value if form is correct
    if (value === "tab1") {
      setTab(value);
    } else {
      console.log(form.formState.isValid, '');
      if (form.formState.isValid) {
        setTab(value);
        setIsTableLoading(true);
      }
    }
  };

  const checkedFields = (field: string[] | undefined, returnDashed: boolean) => {
    if (!field || !Array.isArray(field)) {
      return [];
    }

    const checked: string[] = [];
    if (returnDashed) {
      field.forEach((field) => {
        const parts = field.split("-");
        if (parts[1] === "x") {
          checked.push(`${parts[0]}+`);
        } else {
          checked.push(parts.join(","));
        }
      });
    } else {
      field.forEach((field) => {
        checked.push(field);
      });
    }
    return checked;
  };

  const constructApolloUrl = (formData: any) => {
    let url =
      "https://app.apollo.io/#/people?finderViewId=6674b20eecfedd000184539f&contactEmailStatusV2[]=likely_to_engage&contactEmailStatusV2[]=verified&sortByField=account_owner_id&sortAscending=true";

    if (
      formData.organization_locations &&
      formData.organization_locations.length > 0
    ) {
      url += formData.organization_locations
        .map(
          (location: any) =>
            `&personLocations[]=${encodeURIComponent(location.text)}`
        )
        .join("");
    }

    if (
      formData.organization_industry_tag_ids &&
      formData.organization_industry_tag_ids.length > 0
    ) {
      url += formData.organization_industry_tag_ids
        .map(
          (industry: any) =>
            `&organizationIndustryTagIds[]=${encodeURIComponent(
              industry.value
            )}`
        )
        .join("");
    }

    if (
      formData.currently_using_technologies &&
      formData.currently_using_technologies.length > 0
    ) {
      url += formData.currently_using_technologies
        .map(
          (technology: any) =>
            `&currentlyUsingAnyOfTechnologyUids[]=${encodeURIComponent(
              technology.id
            )}`
        )
        .join("")
    }

    if (formData.person_titles && formData.person_titles.length > 0) {
      url += formData.person_titles
        .map(
          (title: any) => `&personTitles[]=${encodeURIComponent(title.text)}`
        )
        .join("");
    }

    if (checkedCompanyHeadcount && checkedCompanyHeadcount.length > 0) {
      url += checkedCompanyHeadcount
        .map((range: string) => {
          if (range === "10000+") {
            return `&organizationNumEmployeesRanges%5B%5D=10001`;
          }
          const [min, max] = range.split("-");
          return `&organizationNumEmployeesRanges[]=${encodeURIComponent(min)},${max === "x" ? "" : encodeURIComponent(max)}`;
        })
        .join("");
    }

    if (selectionType === 'list' && formData.q_organization_domains && formData.q_organization_domains.length > 0) {
      url += formData.q_organization_domains
        .map((domain: any) => `&organizationIds[]=${encodeURIComponent(domain.id)}`)
        .join("");
    } else if (selectionType === 'custom' && formData.q_organization_domains && formData.q_organization_domains.length > 0) {
      const customDomain = formData.q_organization_domains[0];
      if (customDomain && customDomain.text) {
        url += `&qKeywords=${encodeURIComponent(customDomain.text)}`;
      }
    }

    if (
      formData.q_organization_keyword_tags &&
      formData.q_organization_keyword_tags.length > 0
    ) {
      url += formData.q_organization_keyword_tags
        .map(
          (tag: any) =>
            `&qOrganizationKeywordTags[]=${encodeURIComponent(tag.text)}`
        )
        .join("");
      url +=
        "&includedOrganizationKeywordFields[]=tags&includedOrganizationKeywordFields[]=name";
    }

    if (formData.job_posting_titles && formData.job_posting_titles.length > 0) {
      url += formData.job_posting_titles
        .map(
          (tag: any) =>
            `&qOrganizationJobTitles[]=${encodeURIComponent(tag.text)}`
        )
        .join("");
    }

    if (formData.job_posting_locations && formData.job_posting_locations.length > 0) {
      url += formData.job_posting_locations
        .map(
          (tag: any) =>
            `&organizationJobLocations[]=${encodeURIComponent(tag.text)}`
        )
        .join("")
    }

    if (checkedFundingRounds && checkedFundingRounds.length > 0) {
      url += checkedFundingRounds
        .map(
          (round: string) =>
            `&organizationLatestFundingStageCd[]=${encodeURIComponent(round)}`
        )
        .join("");
    }

    if (checkedSearchSignal && checkedSearchSignal.length > 0) {
      url += checkedSearchSignal
        .map(
          (signal: string) =>
            `&searchSignalIds[]=${encodeURIComponent(signal)}`
        )
        .join("")
    }

    if (checkedIntentScores && checkedIntentScores.length > 0) {
      url += checkedIntentScores
        .map(
          (intent: string) =>
            `&intentStrengths[]=${encodeURIComponent(intent)}`
        )
        .join("")
    }

    if (checkedIntentTopics && checkedIntentTopics.length > 0) {
      url += checkedIntentTopics
        .map(
          (intent: string) =>
            `&intentIds[]=${encodeURIComponent(intent)}`
        )
        .join("")
    }

    if (formData.minimum_company_funding || formData.maximum_company_funding) {
      const minRevenue = formData.minimum_company_funding ? encodeURIComponent(formData.minimum_company_funding.text) : '';
      const maxRevenue = formData.maximum_company_funding ? encodeURIComponent(formData.maximum_company_funding.text) : '';

      url += `&revenueRange%5Bmin%5D=${minRevenue}&revenueRange%5Bmax%5D=${maxRevenue}`;
    }

    if (formData.email_status && formData.email_status.length > 0) {
      url += formData.email_status
        .map(
          (status: any) =>
            `&contactEmailStatusV2[]=${encodeURIComponent(status.text)}`
        )
        .join("");
    }

    // console.log(url)

    return url;
  };

  // Inside your component or a useEffect hook:
  useEffect(() => {
    const formData = form.getValues();
    const newApolloUrl = constructApolloUrl(formData);
    setApolloUrl(newApolloUrl);
  }, [
    form,
    checkedCompanyHeadcount,
    checkedFundingRounds,
    checkedSearchSignal,
    checkedIntentScores,
    checkedIntentTopics,
    form.watch("organization_locations"),
    form.watch("organization_industry_tag_ids"),
    form.watch("person_titles"),
    form.watch("q_organization_keyword_tags"),
    form.watch("minimum_company_funding"),
    form.watch("maximum_company_funding"),
    form.watch("email_status"),
    form.watch("q_organization_domains"),
    form.watch("job_posting_locations"),
    form.watch("job_posting_titles"),
    form.watch("currently_using_technologies"),
  ]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const formData = {
      q_organization_domains: data.q_organization_domains,
      organization_industry_tag_ids: data.organization_industry_tag_ids,
      q_organization_keyword_tags: data.q_organization_keyword_tags,
      currently_using_technologies: data.currently_using_technologies,
      job_posting_locations: data.job_posting_locations,
      job_posting_titles: data.job_posting_titles,
      organization_locations: data.organization_locations,
      company_headcount: checkedCompanyHeadcount || [],
      organization_latest_funding_stage_cd: checkedFundingRounds || [],
      search_signals: checkedSearchSignal || [],
      minimum_company_funding: data.minimum_company_funding,
      maximum_company_funding: data.maximum_company_funding,
      person_titles: data.person_titles,
      per_page: data.per_page,
      email_status: data.email_status,
      organization_job_locations: data.organization_job_locations,
      q_organization_job_titles: data.q_organization_job_titles,
      buying_intent_topics: checkedIntentTopics || [],
      buying_intent_scores: checkedIntentScores || [],
    };
    setIsSubmitting(true);
    setPageCompletion("audience", true);
    console.log("form data", formData);

    let shouldCallAPI = false;

    if (!prevInputValues.current) shouldCallAPI = true;

    // Construct the Apollo.io URL based on the selected filters

    // Add more filter conditions here as needed

    let pages = 1;
    if (formData.per_page) {
      if (formData.per_page <= 25) {
        pages = 1;
      } else if (formData.per_page <= 50) {
        pages = 2;
      } else if (formData.per_page <= 75) {
        pages = 3;
      } else {
        pages = Math.ceil(formData.per_page / 25);
      }
    }
    const newApolloUrl = constructApolloUrl(data);
    setApolloUrl(newApolloUrl);

    setCalculatedPages(pages);

    const getRandomEmail = () => {
      const premiumAcc = ["info@agentprod.com", "muskaan@agentprodapp.com", "demo@agentprod.com"];
      const randomIndex = Math.floor(Math.random() * premiumAcc.length);
      return premiumAcc[randomIndex];
    };

    const createScraperBody = (
      count: number,
      startPage: number
    ) => ({
      count: Math.min(count, 25),
      email: getRandomEmail(),
      getEmails: true,
      guessedEmails: true,
      maxDelay: 15,
      minDelay: 8,
      password: "Agentprod06ms",
      searchUrl: apolloUrl,
      startPage: startPage,
      waitForVerification: true,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
        apifyProxyCountry: "IN",
      },
    });

    const APIFY_TOKEN = "apify_api_n5GCPgdvobcZfCa9w38PSxtIQiY22E4k3ARa";

    const fetchLead = async (startPage: number): Promise<any[]> => {
      const TIMEOUT = 90000;
      const maxRetries = 3;
      let retries = 0;

      while (retries < maxRetries) {
        try {
          const scraperBody = {
            ...createScraperBody(25, startPage),
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

          const response = await axios.post(
            `https://api.apify.com/v2/acts/curious_coder~apollo-io-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
            scraperBody,
            {
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);
          return response.data;

        } catch (error) {
          console.error(
            `Error fetching leads for page ${startPage} (attempt ${retries + 1}):`,
            error
          );

          retries++;
          if (retries === maxRetries) {
            console.error(
              `Failed to fetch leads for page ${startPage} after ${maxRetries} attempts`
            );
            return [];
          }

          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
      return [];
    };

    const existingLeadsResponse = await axiosInstance.get(
      `v2/leads/${user?.id}`
    );
    setExistLead(existingLeadsResponse.data);
    console.log("Existing leads:", existingLeadsResponse.data);
    if (existingLeadsResponse.data === null) {
      shouldCallAPI = true;
    } else if (
      existingLeadsResponse.data.length > 100 + pages * 25 &&
      isSubscribed === false
    ) {
      toast.warning("Your free account has reached the limit of 300 leads");
      shouldCallAPI = false;
    } else if (isSubscribed === true) {
      shouldCallAPI = true;
    }
    if (shouldCallAPI) {
      try {
        setIsLoading(true);
        setIsTableLoading(true);

        const calculateCountdownDuration = (perPage: number): number => {
          if (perPage <= 25) return 30;
          if (perPage <= 50) return 40;
          if (perPage <= 100) return 50;
          if (perPage <= 200) return 60;
          if (perPage <= 300) return 90;
          if (perPage <= 400) return 120;
          return 180; // for anything above 400
        };

        let countdownDuration = calculateCountdownDuration(formData.per_page);

        const countdownToastId = toast.loading(
          `Estimated time: ${Math.floor(countdownDuration / 60)}:${(
            countdownDuration % 60
          )
            .toString()
            .padStart(2, "0")}`
        );
        let remainingTime = countdownDuration;
        const countdownInterval = setInterval(() => {
          remainingTime--;
          const minutes = Math.floor(remainingTime / 60);
          const seconds = remainingTime % 60;
          toast.loading(
            `Estimated time: ${minutes}:${seconds.toString().padStart(2, "0")}`,
            {
              id: countdownToastId,
            }
          );

          if (remainingTime <= 0) {
            // Reset the timer instead of showing "Taking longer than usual"
            remainingTime = countdownDuration;
            toast.loading(
              `Estimated time: ${Math.floor(countdownDuration / 60)}:${(
                countdownDuration % 60
              )
                .toString()
                .padStart(2, "0")}`,
              {
                id: countdownToastId,
              }
            );
          }
        }, 1000);

        const batchSize = 8; // Number of concurrent API calls
        const totalPages = Math.ceil(data.per_page / 25);
        let enrichedLeads: any[] = [];

        for (let i = 0; i < totalPages; i += batchSize) {
          const batch = Array.from(
            { length: Math.min(batchSize, totalPages - i) },
            (_, index) => i + index + 1
          );
          console.log(
            `Processing batch ${i / batchSize + 1} of ${Math.ceil(
              totalPages / batchSize
            )}`
          );

          const batchPromises = batch.map(fetchLead);
          const batchResults = await Promise.all(batchPromises);
          const batchLeads = batchResults.flat();

          enrichedLeads.push(...batchLeads);

          // Optional: Add a delay between batches to avoid rate limiting
          if (i + batchSize < totalPages) {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
          }
        }

        clearInterval(countdownInterval);
        toast.dismiss(countdownToastId);

        if (enrichedLeads.length === 0) {
          toast.error("No leads found");
          setTab("tab1");
        } else {
          console.log("Fetched leads:", enrichedLeads);

          const processedLeads = enrichedLeads
            .slice(0, data.per_page)
            .map((person: any) => ({
              ...person,
              type: "prospective",
              campaign_id: params.campaignId,
              id: uuid(),
            }));
          setLeads(processedLeads);
          console.log("Processed new leads:", processedLeads);
          setTab("tab2");

          setIsTableLoading(false);
          toast.success(
            `${processedLeads.length} new leads fetched successfully`
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching data.");
        setError(error instanceof Error ? error.toString() : String(error));
        setTab("tab1");
      } finally {
        setIsSubmitting(false);
        setIsLoading(false);
        setIsTableLoading(false);
        console.log("Fetched leads:", leads);
        setAllFilters({
          ...formData,
        });
        shouldCallAPI = false;
      }
    } else {
      setIsTableLoading(false);
    }
  };

  const [dropdownsOpen, setDropdownsOpen] = useState({
    currentEmployment: false,
    revenueFunding: false,
    companyFunding: false,
    orgLocations: false,
    funding: false,
    headcount: false,
    jobPostings: false,
    companyDomains: false,
    industry: false,
    company: false,
    searchSignals: false,
    technologies: false,
    buyingIntent: false,
  });
  const toggleDropdown = (id: string) => {
    setDropdownsOpen((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  const min = 0;
  const [leadsNum, setLeadsNum] = useState<number>(0);

  type CheckboxOptions = {
    name: string;
    value: string;
    checked: boolean;
  };

  type SignalCheckboxOptions = {
    id: string;
    name: string;
    checked: boolean;
  }

  type IntentScoreCheckboxOptions = {
    id: string;
    name: string;
    checked: boolean;
  }

  type IntentTopicCheckboxOptions = {
    id: string;
    name: string;
    checked: boolean;
  }

  const fundingRounds = [
    { id: "0", name: "Seed" },
    { id: "1", name: "Angel" },
    { id: "10", name: "Venture (Round not Specified)" },
    { id: "2", name: "Series A" },
    { id: "3", name: "Series B" },
    { id: "4", name: "Series C" },
    { id: "5", name: "Series D" },
    { id: "6", name: "Series E" },
    { id: "7", name: "Series F" },
    { id: "13", name: "Debt Financing" },
    { id: "14", name: "Equity Crowdfunding" },
    { id: "15", name: "Convertible Note" },
    { id: "11", name: "Private Equity" },
    { id: "12", name: "Other" },
  ];

  const companyHeadcountOptions: CheckboxOptions[] = [
    { name: "1-10", value: "1-10", checked: false },
    { name: "11-20", value: "11-20", checked: false },
    { name: "21-50", value: "21-50", checked: false },
    { name: "51-100", value: "51-100", checked: false },
    { name: "101-200", value: "101-200", checked: false },
    { name: "201-500", value: "201-500", checked: false },
    { name: "501-1000", value: "501-1000", checked: false },
    { name: "1001-2000", value: "1001-2000", checked: false },
    { name: "2001-5000", value: "2001-5000", checked: false },
    { name: "5001-10000", value: "5001-10000", checked: false },
    { name: "10000+", value: "10000+", checked: false },
  ];

  const signals: SignalCheckboxOptions[] = [
    { id: "643daa349293c1cdaa4d00f8", name: "New role", checked: false },
    { id: "643daa3c9293c1cdaa4d00f9", name: "Opened 2+ emails in past week", checked: false },
    { id: "643daa3f9293c1cdaa4d00fa", name: "Rapid growth", checked: false },
    { id: "643daa439293c1cdaa4d00fb", name: "Recent funding", checked: false },
    { id: "649f201bed59e501eb4d3f0f", name: "High buying intent", checked: false },
    { id: "649f201bed59e501eb4d3f10", name: "Merger or acquisition", checked: false },
    { id: "649f201bed59e501eb4d3f11", name: "New product or service", checked: false },
    { id: "649f201ced59e501eb4d3f12", name: "Cutting costs", checked: false },
    { id: "649f201ced59e501eb4d3f13", name: "Office expansion", checked: false },
    { id: "649f201ced59e501eb4d3f14", name: "New partnership", checked: false },
    { id: "649f201ced59e501eb4d3f15", name: "New client signed", checked: false },
    { id: "649f201ded59e501eb4d3f16", name: "Award or recognition", checked: false },
    { id: "663279c828a0230001e2338b", name: "Former champion changed jobs", checked: false },
    { id: "663279c828a0230001e2338c", name: "Recently promoted", checked: false }
  ];

  const buyingIntentScores: IntentScoreCheckboxOptions[] = [
    { id: "high", name: "High", checked: false },
    { id: "mid", name: "Medium", checked: false },
    { id: "low", name: "Low", checked: false },
    { id: "none", name: "None", checked: false },
  ];

  const buyingIntentTopics: IntentTopicCheckboxOptions[] = [
    { id: "48b1feaa8b0d1805a23f59f268fc7c91", name: "Shopify", checked: false }
  ];


  // const [loading, setLoading] = React.useState(true);

  // console.log("leadsssssss", leads);

  function mapLeadsToBodies(leads: Lead[], campaignId: string): Contact[] {
    return leads.map((lead) => ({
      id: lead.id,
      user_id: user.id,
      campaign_id: campaignId,
      type: "prospective",
      first_name: lead.first_name,
      last_name: lead.last_name,
      name: lead.name,
      title: lead.title,
      linkedin_url: lead?.linkedin_url,
      email_status: lead.email_status,
      photo_url: lead.photo_url,
      twitter_url: lead.twitter_url,
      github_url: lead.github_url,
      facebook_url: lead.facebook_url,
      extrapolated_email_confidence: lead.extrapolated_email_confidence,
      headline: lead.headline,
      email: lead.email,
      employment_history: lead.employment_history,
      state: lead.state,
      city: lead.city,
      country: lead.country,
      is_likely_to_engage: lead.is_likely_to_engage,
      departments: lead.departments,
      subdepartments: lead.subdepartments,
      seniority: lead.seniority,
      functions: lead.functions,
      phone_numbers: lead.phone_numbers,
      intent_strength: lead.intent_strength,
      show_intent: lead.show_intent,
      revealed_for_current_team: lead.revealed_for_current_team,
      is_responded: false,
      company_linkedin_url: lead.company_linkedin_url,
      pain_points: lead.pain_points || [], // Assuming optional or provide default
      value: lead.value || [], // Assuming optional or provide default
      metrics: lead.metrics || [], // Assuming optional or provide default
      compliments: lead.compliments || [], // Assuming optional or provide default
      lead_information: lead.lead_information || String,
      is_b2b: lead.is_b2b,
      score: lead.score,
      qualification_details: lead.qualification_details || String,
      company: lead.company,
      phone: lead.phone,
      technologies: lead.technologies || [],
      organization: lead.organization,
      linkedin_posts: lead.linkedin_posts,
      linkedin_bio: lead.linkedin_bio || "",
      social_monitoring_data: lead.social_monitoring_data || "",
    }));
  }

  const createAudience = async () => {
    const audienceBody = mapLeadsToBodies(leads as Lead[], params.campaignId);
    console.log("data = " + audienceBody);

    setIsCreateBtnLoading(true);
    try {
      const response = await axiosInstance.post<Contact[]>(
        `v2/lead/bulk/`,
        audienceBody
      );
      const data = response.data;
      console.log("DATA from contacts: ", data);
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        setLeads([data]);
      }
      toast.success("Audience created successfully");

      if (type === "create") {
        const formData = form.getValues();
        const postBody = {
          campaign_id: params.campaignId,
          audience_type: "prospective",
          filters_applied: {
            q_organization_domains: formData.q_organization_domains,
            organization_industry_tag_ids:
              formData.organization_industry_tag_ids,
            currently_using_technologies: formData.currently_using_technologies,
            q_organization_keyword_tags: formData.q_organization_keyword_tags,
            job_posting_titles: formData.job_posting_titles,
            job_posting_locations: formData.job_posting_locations,
            organization_locations: formData.organization_locations,
            company_headcount: checkedCompanyHeadcount,
            organization_latest_funding_stage_cd: checkedFundingRounds,
            search_signals: checkedSearchSignal,
            revenue_range: {
              min: formData.minimum_company_funding?.text,
              max: formData.maximum_company_funding?.text,
            },
            person_titles: formData.person_titles,
            per_page: formData.per_page,
            email_status: formData.email_status,
            organization_job_locations: formData.organization_job_locations,
            q_organization_job_titles: formData.q_organization_job_titles,
            buying_intent_topics: checkedIntentTopics,
            buying_intent_scores: checkedIntentScores,
          },
        };

        const audienceResponse = await axiosInstance.post(
          "v2/audience/",
          postBody
        );
        console.log("filters to audience: ", audienceResponse.data);

        const getRecData = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}v2/campaigns/${params.campaignId}`
        );
        if (getRecData.data.schedule_type === "recurring") {
          const recurringResponse = await axiosInstance.post(
            "v2/recurring_campaign_request",
            {
              campaign_id: params.campaignId,
              user_id: user.id,
              apollo_url: apolloUrl,
              page: calculatedPages + 1,
              is_active: false,
              leads_count: calculatedPages * 25,
            }
          );
          console.log("Recurring campaign request: ", recurringResponse.data);
        }

        toast.success("Audience created successfully");
        toast.info("Updating user details, please wait...");

        // Start polling for leads
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = 6000; // 7 seconds

        const checkLeads = async () => {
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_SERVER_URL}v2/lead/campaign/${params.campaignId}`
            );
            if (Array.isArray(response.data) && response.data.length >= 1) {

              setTimeout(() => {
                router.push(`/dashboard/campaign/${params.campaignId}`);
              }, 4000);

              return true;
            }
          } catch (error) {
            console.error("Error checking leads:", error);
          }
          return false;
        };

        const poll = async () => {
          const success = await checkLeads();
          if (success) {
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            console.log("Max attempts reached. Stopping polling.");
            toast.error("Failed to update leads. Please try again later.");
            setIsCreateBtnLoading(false);
            return;
          }

          setTimeout(poll, pollInterval);
        };

        poll(); // Start the polling process
      }
    } catch (error) {
      console.error("Error creating audience:", error);
      setError(error instanceof Error ? error.toString() : String(error));
      toast.error("Audience Creation Failed");
      setIsCreateBtnLoading(false);
    }
  };

  type FieldName =
    | "person_seniorities"
    | "q_organization_domains"
    | "organization_locations"
    | "person_titles"
    | "revenue_range"
    | "organization_industry_tag_ids";

  const mapFiltersToTags = (
    filterName: string,
    filterData: string | undefined,
    tagStateSetter: React.Dispatch<React.SetStateAction<Tag[]>>,
    fieldName: any
  ) => {
    if (
      allFiltersFromDB &&
      typeof allFiltersFromDB === "object" &&
      fieldName in allFiltersFromDB &&
      Array.isArray(filterData) &&
      filterData.length > 0
    ) {
      const tags = filterData.map((value: string, index: number) => {
        return {
          id: String(index),
          text: value,
        };
      });

      tagStateSetter(tags);

      form.setValue(fieldName, allFiltersFromDB[filterName]);
    } else {
      console.error(
        "One of the required variables is undefined or has an unexpected type."
      );
    }
  };

  function populateFormWithExistingFilters(allFiltersFromDB: any) {
    if (allFiltersFromDB) {
      // Organization Industry Tag IDs
      if (allFiltersFromDB.organization_industry_tag_ids) {
        setOrganizationKeywordTags(
          allFiltersFromDB.organization_industry_tag_ids
        );
        setValue(
          "organization_industry_tag_ids",
          allFiltersFromDB.organization_industry_tag_ids
        );
      }

      const headcount = Array.isArray(allFiltersFromDB.company_headcount)
        ? allFiltersFromDB.company_headcount
        : [];

      setCheckedCompanyHeadcount(headcount);
      form.setValue("company_headcount", headcount, {
        shouldValidate: true,
        shouldDirty: true,
      });

      const searchSignal = Array.isArray(allFiltersFromDB.search_signals)
        ? allFiltersFromDB.search_signals
        : [];

      setCheckedSearchSignal(searchSignal)
      form.setValue("search_signals", searchSignal, {
        shouldValidate: true,
        shouldDirty: true,
      })

      const intentTopic = Array.isArray(allFiltersFromDB.buying_intent_topics)
        ? allFiltersFromDB.buying_intent_topics
        : [];

      setCheckedIntentTopics(intentTopic)
      form.setValue("buying_intent_topics", intentTopic, {
        shouldValidate: true,
        shouldDirty: true,
      })

      const intentScore = Array.isArray(allFiltersFromDB.buying_intent_scores)
      ? allFiltersFromDB.buying_intent_scores
      : [];

      setCheckedIntentTopics(intentScore)
      form.setValue("buying_intent_scores", intentScore, {
        shouldValidate: true,
        shouldDirty: true,
      })

      // Currently using Technologies
      if (allFiltersFromDB.currently_using_technologies) {
        setCurrentlyUsingTechnologiesTags(
          allFiltersFromDB.currently_using_technologies
        );
        setValue(
          "currently_using_technologies",
          allFiltersFromDB.currently_using_technologies
        );
      }

      // Organization Keyword Tags
      if (allFiltersFromDB.q_organization_keyword_tags) {
        setOrganizationCompanyTags(
          allFiltersFromDB.q_organization_keyword_tags
        );
        setValue(
          "q_organization_keyword_tags",
          allFiltersFromDB.q_organization_keyword_tags
        );
      }

      // Organization Locations
      if (allFiltersFromDB.organization_locations) {
        setOrganizationLocationsTags(allFiltersFromDB.organization_locations);
        setValue(
          "organization_locations",
          allFiltersFromDB.organization_locations
        );
      }

      // Person Titles
      if (allFiltersFromDB.person_titles) {
        setPersonTitlesTags(allFiltersFromDB.person_titles);
        setValue("person_titles", allFiltersFromDB.person_titles);
      }

      // Job Posting Titles
      if (allFiltersFromDB.job_posting_titles) {
        setJobPostingTitles(allFiltersFromDB.job_posting_titles);
        setValue("job_posting_titles", allFiltersFromDB.job_posting_titles);
      }

      // Job Posting Locations
      if (allFiltersFromDB.job_posting_locations) {
        setJobPostingLocations(allFiltersFromDB.job_posting_locations);
        setValue("job_posting_locations", allFiltersFromDB.job_posting_locations);
      }

      // Per Page
      if (allFiltersFromDB.per_page) {
        setValue("per_page", allFiltersFromDB.per_page);
      }

      // Company Headcount
      if (allFiltersFromDB.company_headcount) {
        setCheckedCompanyHeadcount(allFiltersFromDB.company_headcount);
        setValue("company_headcount", allFiltersFromDB.company_headcount);
      }

      // Funding Rounds
      if (allFiltersFromDB.organization_latest_funding_stage_cd) {
        const fundingRounds = Array.isArray(allFiltersFromDB.organization_latest_funding_stage_cd)
          ? allFiltersFromDB.organization_latest_funding_stage_cd
          : [];

        setCheckedFundingRounds(fundingRounds);
        form.setValue("organization_latest_funding_stage_cd", fundingRounds, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }

      // Search Signals
      if (allFiltersFromDB.search_signals) {
        setCheckedSearchSignal(
          allFiltersFromDB.search_signals
        );
        setValue(
          "search_signals",
          allFiltersFromDB.search_signals
        )
      }

      // Buying intent

      if (allFiltersFromDB.buying_intent_scores) {
        setCheckedIntentScores(
          allFiltersFromDB.buying_intent_scores
        );
        setValue(
          "buying_intent_scores",
          allFiltersFromDB.buying_intent_scores
        )
      }

      if (allFiltersFromDB.buying_intent_topics) {
        setCheckedIntentTopics(
          allFiltersFromDB.buying_intent_topics
        );
        setValue(
          "buying_intent_topics",
          allFiltersFromDB.buying_intent_topics
        )
      }

      // Company Domains
      if (allFiltersFromDB.q_organization_domains) {
        setQOrganizationDomainsTags(allFiltersFromDB.q_organization_domains);
        setValue(
          "q_organization_domains",
          allFiltersFromDB.q_organization_domains
        );
      }

      // Revenue Range
      if (allFiltersFromDB.revenue_range) {
        if (allFiltersFromDB.revenue_range.min) {
          setMinimumCompanyFunding({
            id: "min",
            text: Number(allFiltersFromDB.revenue_range.min),
          });
          setValue("minimum_company_funding", {
            id: "min",
            text: Number(allFiltersFromDB.revenue_range.min),
          });
        }
        if (allFiltersFromDB.revenue_range.max) {
          setMaximumCompanyFunding({
            id: "max",
            text: Number(allFiltersFromDB.revenue_range.max),
          });
          setValue("maximum_company_funding", {
            id: "max",
            text: Number(allFiltersFromDB.revenue_range.max),
          });
        }
      }

      // Job Titles (if used for technology)
      if (allFiltersFromDB.q_organization_job_titles) {
        setJobOfferingTags(allFiltersFromDB.q_organization_job_titles);
        setValue(
          "q_organization_job_titles",
          allFiltersFromDB.q_organization_job_titles
        );
      }

      // Job Locations
      if (allFiltersFromDB.organization_job_locations) {
        setJobLocationTags(allFiltersFromDB.organization_job_locations);
        setValue(
          "organization_job_locations",
          allFiltersFromDB.organization_job_locations
        );
      }

      // Email Status (if applicable)
      if (allFiltersFromDB.email_status) {

        setValue("email_status", allFiltersFromDB.email_status);
      }

      // Additional fields can be added here as needed

      console.log("Form values updated, current values:", form.getValues());
    }
  }

  React.useEffect(() => {
    console.log("checked company headcount", checkedCompanyHeadcount);
  }, [checkedCompanyHeadcount]);

  const updateAudience = async () => {
    setIsTableLoading(true);

    try {
      // Update audience filters



      // Update audience filters
      // await axiosInstance.put(`v2/audience/${audienceId}`, filtersPostBody);

      // Update contacts
      const audienceBody = mapLeadsToBodies(leads as Lead[], params.campaignId);

      await axiosInstance.post(`v2/lead/bulk/update`, audienceBody);
      const getRecData = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}v2/campaigns/${params.campaignId}`
      );
      if (getRecData.data.schedule_type === "recurring") {
        const recurringResponse = await axiosInstance.put(
          "v2/recurring_campaign_request",
          {
            campaign_id: params.campaignId,
            apollo_url: apolloUrl,
            page :calculatedPages + 1,
            
          }
        );
        console.log("Recurring campaign request: ", recurringResponse.data);
      }
      toast.success("Audience updated successfully");
      await router.push(`/dashboard/campaign/${params.campaignId}`);
      setTimeout(async () => {
        try {
          await axiosInstance.post(`v2/contacts/left?without_template=true`, {
            "campaign_id": params.campaignId,
            "user_id": user?.id
          });
          console.log('Refresh API called successfully after 2 minutes');
        } catch (error) {
          console.error('Error in delayed API call:', error);
        }
      }, 120000); // 120 seconds = 12 0000 milliseconds
    } catch (error) {
      console.error("Error updating audience:", error);
      toast.error("Error updating audience");
    } finally {
      setIsTableLoading(false);
    }
  };

  const [keywordDropdownIsOpen, setKeywordDropdownIsOpen] =
    React.useState(false);

  const [companyDropdownIsOpen, setCompanyDropdownIsOpen] =
    React.useState(false);

  useEffect(() => {
    const filtered = keywords.filter((keyword) =>
      keyword.name.toLowerCase().includes(keywordSearchTerm.toLowerCase())
    );
    setFilteredKeywords(filtered);
    setKeywordDropdownIsOpen(keywordSearchTerm.length > 0);
  }, [keywordSearchTerm]);

  function toggleKeywordsDropdown(isOpen: boolean) {
    setKeywordDropdownIsOpen(isOpen);
  }

  function toggleCompanyDropdown(isOpen: boolean) {
    setCompanyDropdownIsOpen(isOpen);
  }

  function handleDropdownSelect(option: any) {
    const keywordTag = {
      id: uuid(),
      text: option.name,
      value: option.value,
    };

    if (
      !organizationKeywordTags.some((tag: any) => tag.value === option.value)
    ) {
      setOrganizationKeywordTags((prevState) => [...prevState, keywordTag]);
      setValue("organization_industry_tag_ids", [
        ...organizationKeywordTags,
        keywordTag,
      ] as any);
    }
    setKeywordSearchTerm("");
    setKeywordDropdownIsOpen(false);
  }

  useEffect(() => {
    if (organizationKeywordTags.length > 0) {
      setValue("organization_industry_tag_ids", organizationKeywordTags as any);
    } else {
      setValue("organization_industry_tag_ids", []); // Handle the case when there are no tags
    }
  }, [organizationKeywordTags, setValue]);

  function handleTechnologiesDropdownSelect(option: any) {
    const technologyTag = {
      id: option.uid,
      text: option.name,
    }

    if (!currentlyUsingTechnologiesTags.some((tag: any) => tag.id === option.id)) {
      setCurrentlyUsingTechnologiesTags((prevState) => [...prevState, technologyTag]);
      setValue("currently_using_technologies", [
        ...currentlyUsingTechnologiesTags,
        technologyTag,
      ] as any)
    }
    setTechnologiesSearchTerm("");
    setTechnologiesDropdownIsOpen(false);
  }

  useEffect(() => {
    const filtered = technologies
      .filter((technology) =>
        technology.name.toLowerCase().includes(technologiesSearchTerm.toLowerCase())
      );

    setFilteredTechnologies(filtered);
    setTechnologiesDropdownIsOpen(technologiesSearchTerm.length > 0);
  }, [technologiesSearchTerm, technologies]);

  useEffect(() => {
    if (currentlyUsingTechnologiesTags.length > 0) {
      setValue("currently_using_technologies", currentlyUsingTechnologiesTags as any);
    } else {
      setValue("currently_using_technologies", []);
    }
  }, [currentlyUsingTechnologiesTags, setValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        technologyDropdownRef.current &&
        !technologyDropdownRef.current.contains(event.target as Node) &&
        !technologyDropdownRef.current?.contains(event.target as Node)
      ) {
        setTechnologiesDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    setValue(
      "q_organization_keyword_tags",
      organizationCompanyTags as [Tag, ...Tag[]]
    );
  }, [organizationCompanyTags]);

  React.useEffect(() => {
    setValue(
      "job_posting_titles",
      jobPostingTitles as [Tag, ...Tag[]]
    );
  }, [jobPostingTitles]);

  React.useEffect(() => {
    setValue(
      "job_posting_locations",
      jobPostingLocations as [Tag, ...Tag[]]
    );
  }, [jobPostingLocations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        keywordDropdownRef.current &&
        !keywordDropdownRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".tag-input-container")
      ) {
        setKeywordDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node)
      ) {
        setCompanyDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const filtered = orgLocations.filter((location) =>
      location.toLowerCase().includes(locationSearchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
    setLocationDropdownIsOpen(locationSearchTerm.length > 0);
  }, [locationSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setLocationDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTotalLeadsClick = async () => {
    setIsLoadingTotalLeads(true);
    try {
      const formData = form.getValues();
      const requestBody = {
        page: 1,
        per_page: 1,
        organization_num_employees_ranges: checkedCompanyHeadcount?.length
          ? checkedFields(checkedCompanyHeadcount, true)
          : undefined,
        
        person_locations: formData.organization_locations?.map((tag: any) => tag.text),
        organization_industry_tag_ids: formData.organization_industry_tag_ids?.map((tag: any) => tag.value),
        q_organization_keyword_tags: formData.q_organization_keyword_tags?.map((tag: any) => tag.text),
        q_organization_job_titles: formData.job_posting_titles?.map((tag: any) => tag.text),
        organization_job_locations: formData.job_posting_locations?.map((tag: any) => tag.text),
        q_organization_domains: formData.q_organization_domains?.map((tag: any) => tag.text),
        person_titles: formData.person_titles?.map((tag: any) => tag.text),
        organization_latest_funding_stage_cd: checkedFields(checkedFundingRounds, false),
        search_signals: checkedFields(checkedSearchSignal, false),
        currently_using_any_of_technology_uids: formData.currently_using_technologies?.map((tag: any) => tag.text.toLowerCase()),
        revenue_range: {
          min: formData.minimum_company_funding?.text?.toString(),
          max: formData.maximum_company_funding?.text?.toString()
        },
        buying_intent_topics: checkedFields(checkedIntentTopics, false),
        buying_intent_scores: checkedFields(checkedIntentScores, false),
        contact_email_status_v2:["likely_to_engage","verified"]
      };

      // Remove undefined or empty array properties
      (Object.keys(requestBody) as Array<keyof typeof requestBody>).forEach(key => {
        if (requestBody[key] === undefined) {
          delete requestBody[key];
        }
      });

      // Add funding range if both min and max are present
      if (formData.minimum_company_funding && formData.maximum_company_funding) {
        (requestBody as any).organization_funding_amount_range = {
          min: formData.minimum_company_funding.text?.toString(),
          max: formData.maximum_company_funding.text?.toString(),
        };
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}v2/apollo/lead/search`, requestBody);

      // Assuming the API returns the total count in the response
      setTotalLeads(response.data.total_leads);
    } catch (error) {
      console.error("Error fetching total leads:", error);
      toast.error("Failed to fetch total leads");
    } finally {
      setIsLoadingTotalLeads(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col items-start"
      >
        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
          <TabsList
            className={`grid grid-cols-2 w-[330px]`}
          >
            <TabsTrigger value="tab1" disabled={isSubmitting}>
              Edit
            </TabsTrigger>
            <TabsTrigger value="tab2" type="submit" disabled={isSubmitting}>
              {isLoading ? (
                <div>
                  <LoadingCircle />
                </div>
              ) : (
                "Preview"
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tab1">
            <div className="flex align-top w-full gap-x-4 justify-between">
              <div className="w-1/2 flex flex-col gap-2">
                <div className="mb-2">Role and personal</div>
                <div className="bg-muted px-2 rounded">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("currentEmployment")}
                  >
                    <div className="text-sm">Current Employment</div>
                    {dropdownsOpen.currentEmployment ? (
                      <ChevronUp color="#000000" />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.currentEmployment ? "block" : "hidden"
                      }`}
                  >
                    <div
                      className={`${dropdownsOpen.currentEmployment ? "block" : "hidden"
                        } relative`}
                    >
                      <FormField
                        control={form.control}
                        name="person_titles"
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-start py-4 w-8/12">
                            <FormLabel className="text-left">
                              Current Job Title
                            </FormLabel>
                            <FormControl>
                              <TagInput
                                {...field}
                                tags={personTitlesTags}
                                placeholder="Enter a job title"
                                variant="base"
                                onFocus={() => toggleJobTitleDropdown(true)}
                                className="sm:min-w-[150px] bg-white/90 text-black placeholder:text-black/[70]"
                                setTags={(newTags) => {
                                  setPersonTitlesTags(newTags);
                                  setValue(
                                    "person_titles",
                                    newTags as [Tag, ...Tag[]]
                                  );
                                }}
                                onInputChange={(value) =>
                                  setJobTitleSearchTerm(value)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* <div className="absolute inline-block text-left -my-4">
                        {jobTitleDropdownIsOpen && (
                          <ScrollArea
                            className="w-56 z-50 rounded-md shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none"
                            style={{
                              height:
                                filteredJobTitles.length > 0
                                  ? `${Math.min(
                                    filteredJobTitles.length * 40,
                                    200
                                  )}px`
                                  : "auto",
                            }}
                          >
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="options-menu"
                              onClick={() => toggleJobTitleDropdown(false)}
                              ref={jobTitleDropdownRef}
                            >
                              {filteredJobTitles.length > 0 ? (
                                filteredJobTitles.map((title) => (
                                  <button
                                    key={title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleJobTitleDropdownSelect(title);
                                      setJobTitleSearchTerm("");
                                    }}
                                    className="dark:text-white block px-4 py-2 text-sm w-full text-left hover:bg-accent"
                                  >
                                    {title
                                      .split(" ")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1).toLowerCase()
                                      )
                                      .join(" ")}
                                  </button>
                                ))
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (jobTitleSearchTerm.trim()) {
                                      handleJobTitleDropdownSelect(
                                        jobTitleSearchTerm.trim()
                                      );
                                      setJobTitleSearchTerm("");
                                    }
                                  }}
                                  className="dark:text-white block px-4 py-2 text-sm w-full text-left hover:bg-accent"
                                >
                                  {jobTitleSearchTerm
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(" ")}
                                </button>
                              )}
                            </div>
                          </ScrollArea>
                        )}
                      </div> */}
                    </div>
                    {/* <FormField
                      control={form.control}
                      name="person_seniorities"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start py-4 w-8/12">
                          <FormLabel className="text-left">
                            Management Positions
                          </FormLabel>
                          <FormControl>
                            <TagInput
                              {...field}
                              dropdown={true}
                              dropdownPlaceholder="Add management positions"
                              dropdownOptions={seniorities}
                              tags={personSenioritiesTags}
                              variant={"base"}
                              className="sm:min-w-[450px] bg-white/90 text-black"
                              setTags={(newTags) => {
                                setPersonSenioritiesTags(newTags);
                                setValue(
                                  "person_seniorities",
                                  newTags as [Tag, ...Tag[]]
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>
                </div>
                <div className="bg-muted px-2 rounded">
                  <FormField
                    control={form.control}
                    name="company_headcount"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-start">
                        <FormLabel
                          className="flex justify-between font-normal w-full py-3 cursor-pointer items-center text-left"
                          onClick={() => toggleDropdown("headcount")}
                        >
                          <div>Company Headcount</div>
                          {dropdownsOpen.headcount ? (
                            <ChevronUp color="#000000" />
                          ) : (
                            <ChevronUp
                              color="#000000"
                              className="transition-transform duration-200 transform rotate-180"
                            />
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className={`${dropdownsOpen.headcount ? "block" : "hidden"}`}>
                            {companyHeadcountOptions.map((headcountOption, index) => (
                              <div className="text-sm flex items-center mb-3" key={index}>
                                <Checkbox
                                  className="mr-2"
                                  checked={checkedCompanyHeadcount?.includes(headcountOption.value)}
                                  onCheckedChange={(checked) => {
                                    const isChecked = checked.valueOf();
                                    const value = headcountOption.value;

                                    const newCheckedValues = isChecked
                                      ? [...(checkedCompanyHeadcount || []), value]
                                      : (checkedCompanyHeadcount || []).filter(item => item !== value);

                                    setCheckedCompanyHeadcount(newCheckedValues);
                                    field.onChange(newCheckedValues);
                                  }}
                                  value={headcountOption.value}
                                />
                                {headcountOption.name}
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="bg-muted px-2 rounded">
                  <FormField
                    control={form.control}
                    name="organization_locations"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-start">
                        <FormLabel
                          className="w-full font-normal flex justify-between cursor-pointer py-3 "
                          onClick={() => toggleDropdown("orgLocations")}
                        >
                          <div>Company Locations</div>
                          {dropdownsOpen.orgLocations ? (
                            <ChevronUp color="#000000" />
                          ) : (
                            <ChevronUp
                              color="#000000"
                              className="transition-transform duration-200 transform rotate-180"
                            />
                          )}
                        </FormLabel>
                        <FormControl>
                          <div
                            className={`${dropdownsOpen.orgLocations ? "block" : "hidden"
                              } relative`}
                          >
                            <TagInput
                              {...field}
                              tags={organizationLocationsTags}
                              placeholder="Enter a location"
                              variant="base"
                              onFocus={() => toggleLocationDropdown(true)}
                              className="sm:min-w-[450px] bg-white/90 text-black placeholder:text-black/[70]"
                              setTags={(newTags) => {
                                setOrganizationLocationsTags(newTags);
                                setValue(
                                  "organization_locations",
                                  newTags as [Tag, ...Tag[]]
                                );
                              }}
                              onInputChange={(value) => setLocationSearchTerm(value)}
                            />
                            <div className="absolute inline-block text-left ">
                              {locationDropdownIsOpen && (
                                <ScrollArea
                                  className="w-56 z-50 rounded-md shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none"
                                  style={{
                                    height:
                                      filteredLocations.length > 0
                                        ? `${Math.min(
                                          filteredLocations.length * 40,
                                          200
                                        )}px`
                                        : "auto",
                                  }}
                                >
                                  <div
                                    className="py-1"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="options-menu"
                                    onClick={() => toggleLocationDropdown(false)}
                                    ref={locationDropdownRef}
                                  >
                                    {filteredLocations.length > 0 ? (
                                      filteredLocations.map((location) => (
                                        <button
                                          key={location}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleLocationDropdownSelect(location);
                                            setLocationSearchTerm("");
                                          }}
                                          className="dark:text-white block px-4 py-2 text-sm w-full text-left hover:bg-accent"
                                        >
                                          {location}
                                        </button>
                                      ))
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (locationSearchTerm.trim()) {
                                            handleLocationDropdownSelect(
                                              locationSearchTerm.trim()
                                            );
                                            setLocationSearchTerm("");
                                          }
                                        }}
                                        className="dark:text-white block px-4 py-2 text-sm w-full text-left hover:bg-accent"
                                      >
                                        {locationSearchTerm}
                                      </button>
                                    )}
                                  </div>
                                </ScrollArea>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="per_page"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start my-4">
                      <FormLabel className="text-left">
                        Number of Leads
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input
                            {...field}
                            type="number"
                            placeholder={"Enter the number of leads you want"}
                            className="sm:min-w-[450px] outline-none"
                            value={field.value || leadsNum}
                            min={25}
                            max={500}
                            step={25}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                field.onChange(undefined);
                                return;
                              }
                              
                              const numberValue = Math.round(Number(value) / 25) * 25;
                              const boundedValue = Math.max(25, Math.min(500, numberValue));
                              
                              field.onChange(boundedValue);
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const numberValue = Math.round(Number(value) / 25) * 25;
                                const boundedValue = Math.max(25, Math.min(500, numberValue));
                                field.onChange(boundedValue);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        These are the number of leads that you&apos;re
                        interested in select between 1 - 125.
                      </FormDescription>
                      <FormDescription>
                      Enter the number of leads you're interested in, in multiples of 25 (e.g., 25, 50, 75, 100, 125).                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col space-y-2 mt-4">
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleTotalLeadsClick}
                      disabled={isLoadingTotalLeads}
                      className="min-w-[120px]"
                    >
                      {isLoadingTotalLeads ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading</span>
                        </div>
                      ) : (
                        "Calculate Leads"
                      )}
                    </Button>
                    {totalLeads !== null && (
                      <div className="flex items-center bg-secondary/20 px-4 py-2 rounded-md">
                        <span className="text-sm font-medium mr-2">Total Available:</span>
                        <span className="text-lg font-bold tabular-nums">
                          {totalLeads.toLocaleString('en-US')}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <div className="mb-2">Advanced</div>

                {/* Company Domain */}

                <div className="bg-muted px-2 rounded">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("companyDomains")}
                  >
                    <div className="text-sm">Company Domains</div>
                    {dropdownsOpen.companyDomains ? (
                      <ChevronUp color="#000000" />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>

                  <div className={`${dropdownsOpen.companyDomains ? "block" : "hidden"}`}>

                    <RadioGroup className="mb-3" value={selectionType} onValueChange={handleSelectionTypeChange}>
                      <div className="flex">
                        <div className="flex items-center space-x-2 mr-3">
                          <RadioGroupItem value="list" id="list" />
                          <Label htmlFor="list">Select from list</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom">Enter custom company</Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {selectionType === 'list' && (

                      <div>
                        <div className="flex flex-row items-center gap-1 mb-2">
                          <p className="text-xs">Contact us to add your company in the list</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a href="mailto:info@agentprod.com" title="info@agnetprod.com">
                                  <ExternalLink size={12} />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>info@agentprod.com</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <FormField
                          control={form.control}
                          name="q_organization_domains"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-start pb-4 w-8/12">
                              <FormControl>
                                <TagInput
                                  {...field}
                                  tags={qOrganizationDomainsTags}
                                  placeholder="Enter Company Domains"
                                  variant="base"
                                  onFocus={() => setCompanyDomainDropdownIsOpen(true)}
                                  className="sm:min-w-[150px] bg-white/90 text-black placeholder:text-black/[70]"
                                  setTags={(newTags) => {
                                    if (Array.isArray(newTags)) {
                                      if (newTags.length < qOrganizationDomainsTags.length) {
                                        setQOrganizationDomainsTags(newTags);
                                        setValue("q_organization_domains", newTags as [Tag, ...Tag[]]);
                                        return;
                                      }

                                      const lastTag = newTags[newTags.length - 1];
                                      const updatedTags = lastTag?.id.includes('-')
                                        ? newTags.slice(0, -1)
                                        : newTags;

                                      setQOrganizationDomainsTags(updatedTags);
                                      setValue("q_organization_domains", updatedTags as [Tag, ...Tag[]]);
                                    }
                                  }}
                                  onInputChange={(value) => setCompanyDomainSearchTerm(value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="absolute inline-block text-left -my-4">
                          {companyDomainDropdownIsOpen && (
                            <ScrollArea
                              className="w-56 z-50 rounded-md shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none"
                              style={{
                                height: filteredCompanyDomains.length > 0
                                  ? `${Math.min(filteredCompanyDomains.length * 40, 200)}px`
                                  : "auto",
                              }}
                            >
                              <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                                ref={companyDomainDropdownRef}
                              >
                                {filteredCompanyDomains.length > 0 ? (
                                  filteredCompanyDomains.map((company) => (
                                    <button
                                      key={company.companyName}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCompanyDomainDropdownSelect(company)
                                        setCompanyDomainSearchTerm("");
                                      }}
                                      className="dark:text-white block px-4 py-2 text-sm w-full text-left hover:bg-accent"
                                    >
                                      {company.companyName
                                        .split(" ")
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                        )
                                        .join(" ")}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    No items found
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      </div>

                    )}

                    {selectionType === 'custom' && (
                      <div className={`${dropdownsOpen.companyDomains ? "block" : "hidden"}`}>
                        <FormField
                          control={form.control}
                          name="q_organization_domains"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-start pb-4 w-8/12">
                              <FormControl>
                                <TagInput
                                  {...field}
                                  tags={qOrganizationDomainsTags}
                                  placeholder="Enter Custom Company"
                                  variant="base"
                                  className="sm:min-w-[150px] bg-white/90 text-black placeholder:text-black/[70]"
                                  setTags={(newTags) => {
                                    setQOrganizationDomainsTags(newTags);
                                    setValue('q_organization_domains', newTags as [Tag, ...Tag[]]);
                                  }}
                                  maxTags={1}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                  </div>
                </div>

                {/* Industry */}

                <div className="bg-muted px-2 rounded">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("industry")}
                  >
                    <div className="text-sm">Industry</div>
                    {dropdownsOpen.industry ? (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-0"
                      />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.industry ? "block" : "hidden"
                      } relative`}
                  >
                    <FormField
                      control={form.control}
                      name="organization_industry_tag_ids"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start pb-4 w-8/12">
                          <FormControl>
                            <TagInput
                              {...field}
                              tags={organizationKeywordTags}
                              placeholder="Enter industry"
                              variant="base"
                              onFocus={() => setKeywordDropdownIsOpen(true)}
                              className="sm:min-w-[450px] bg-white/90 text-black placeholder:text-black/[70]"
                              setTags={(newTags: any) => {
                                if (Array.isArray(newTags)) {
                                  if (newTags.length < organizationKeywordTags.length) {
                                    setOrganizationKeywordTags(newTags);
                                    setValue("organization_industry_tag_ids", newTags as any);
                                    return;
                                  }

                                  const lastTag = newTags[newTags.length - 1];

                                  const updatedTags = lastTag?.id.includes('-')
                                    ? newTags.slice(0, -1)
                                    : newTags;

                                  setOrganizationKeywordTags(updatedTags);
                                  setValue("organization_industry_tag_ids", updatedTags as any);
                                }
                              }}
                              onInputChange={(value) =>
                                setKeywordSearchTerm(value)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="absolute inline-block text-left -my-4">
                      {keywordDropdownIsOpen && (
                        <ScrollArea
                          className="w-56 z-50 rounded-md shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none"
                          style={{
                            height:
                              filteredKeywords.length > 0
                                ? `${Math.min(filteredKeywords.length * 40, 200)}px`
                                : "auto",
                          }}
                        >
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-menu"
                            ref={keywordDropdownRef}
                          >
                            {filteredKeywords.length > 0 ? (
                              filteredKeywords.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDropdownSelect(option);
                                    setKeywordSearchTerm("");
                                  }}
                                  className="dark:text-white block px-4 py-2 text-sm w-full text-left hover:bg-accent"
                                >
                                  {option.name
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(" ")}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No items found
                              </div>
                            )}
                          </div>
                        </ScrollArea>

                      )}
                    </div>
                  </div>
                </div>

                {/* Company keyword section */}
                <div className="bg-muted px-2 rounded">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("company")}
                  >
                    <div className="text-sm">Company Keyword</div>
                    {dropdownsOpen.company ? (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-0"
                      />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.company ? "block" : "hidden"
                      } relative`}
                  >
                    <FormField
                      control={form.control}
                      name="q_organization_keyword_tags"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start pb-4 w-8/12">
                          <FormControl>
                            <TagInput
                              {...field}
                              tags={organizationCompanyTags}
                              placeholder="Enter company keywords"
                              variant="base"
                              className="sm:min-w-[450px] bg-white/90 text-black placeholder:text-black/[70]"
                              setTags={(newTags) => {
                                setOrganizationCompanyTags(newTags);
                                setValue(
                                  "q_organization_keyword_tags",
                                  newTags as [Tag, ...Tag[]]
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* // Revenue and funding */}
                <div className="bg-muted px-2 rounded ">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("revenueFunding")}
                  >
                    <div className="text-sm">Funding Rounds</div>
                    {dropdownsOpen.revenueFunding ? (
                      <ChevronUp color="#000000" />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.revenueFunding ? "block" : "hidden"
                      }`}
                  >
                    <FormField
                      control={form.control}
                      name="organization_latest_funding_stage_cd"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                          <FormLabel
                            className="flex justify-between font-normal w-full py-3 cursor-pointer items-center text-left"
                            onClick={() => toggleDropdown("funding")}
                          >
                            <div>Funding Rounds</div>
                            {dropdownsOpen.funding ? (
                              <ChevronUp color="#000000" />
                            ) : (
                              <ChevronUp
                                color="#000000"
                                className="transition-transform duration-200 transform rotate-180"
                              />
                            )}
                          </FormLabel>
                          <FormControl>
                            <div className={`${dropdownsOpen.funding ? "block" : "hidden"}`}>
                              {fundingRounds.map((round) => (
                                <div className="text-sm flex items-center mb-3" key={round.id}>
                                  <Checkbox
                                    className="mr-2"
                                    checked={checkedFundingRounds?.includes(round.id)}
                                    onCheckedChange={(checked) => {
                                      const isChecked = checked.valueOf();
                                      const value = round.id;

                                      const newCheckedValues = isChecked
                                        ? [...(checkedFundingRounds || []), value]
                                        : (checkedFundingRounds || []).filter(item => item !== value);

                                      setCheckedFundingRounds(newCheckedValues);
                                      field.onChange(newCheckedValues);
                                    }}
                                    value={round.id}
                                  />
                                  {round.name}
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="bg-muted px-2 rounded ">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("companyFunding")}
                  >
                    <div className="text-sm">Revenue</div>
                    {dropdownsOpen.companyFunding ? (
                      <ChevronUp color="#000000" />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.companyFunding ? "block" : "hidden"
                      }`}
                  >
                    <div className="">
                      <div className="text-sm font-medium">
                        Total Company Revenue Range
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <FormField
                          control={form.control}
                          name="minimum_company_funding"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-start mx-1 my-4">
                              <FormControl>
                                <Input
                                  placeholder="Min"
                                  className="w-max bg-white text-black"
                                  value={
                                    minimumCompanyFunding.text
                                      ? minimumCompanyFunding.text
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const numericValue = Number(e.target.value);
                                    if (!isNaN(numericValue)) {
                                      const newValue = {
                                        ...minimumCompanyFunding,
                                        text: numericValue,
                                      };
                                      setMinimumCompanyFunding(newValue); // Update local state
                                      field.onChange(newValue); // Notify React Hook Form of the change
                                    }
                                  }}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="w-1/2">
                          <FormField
                            control={form.control}
                            name="maximum_company_funding"
                            render={({ field }) => (
                              <FormItem className="flex flex-col items-start mx-1 my-4">
                                <FormControl>
                                  <Input
                                    placeholder="Max"
                                    className=" bg-white text-black"
                                    value={
                                      maximumCompanyFunding.text
                                        ? maximumCompanyFunding.text
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const numericValue = Number(
                                        e.target.value
                                      );
                                      const newValue = {
                                        ...maximumCompanyFunding,
                                        text: numericValue,
                                      };
                                      setMaximumCompanyFunding(newValue); // Update local state
                                      field.onChange(newValue); // Notify React Hook Form of the change
                                    }}
                                  />
                                </FormControl>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technologies Section */}

                <div className="bg-muted px-2 rounded">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("technologies")}
                  >
                    <div className="text-sm">Technologies</div>
                    {dropdownsOpen.technologies ? (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-0"
                      />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.technologies ? "block" : "hidden"
                      } relative`}
                  >
                    <FormField
                      control={form.control}
                      name="currently_using_technologies"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start pb-4 w-8/12">
                          <FormControl>
                            <TagInput
                              {...field}
                              tags={currentlyUsingTechnologiesTags}
                              placeholder="Enter Technology"
                              variant="base"
                              onFocus={() => setTechnologiesDropdownIsOpen(true)}
                              className="sm:min-w-[450px] bg-white/90 text-black placeholder:text-black/[70]"
                              setTags={(newTags: any) => {
                                if (Array.isArray(newTags)) {
                                  if (newTags.length < currentlyUsingTechnologiesTags.length) {
                                    setCurrentlyUsingTechnologiesTags(newTags);
                                    setValue("currently_using_technologies", newTags as any);
                                    return;
                                  }

                                  const lastTag = newTags[newTags.length - 1];

                                  const updatedTags = lastTag?.id.includes('-')
                                    ? newTags.slice(0, -1)
                                    : newTags;

                                  setCurrentlyUsingTechnologiesTags(updatedTags);
                                  setValue("currently_using_technologies", updatedTags as any);
                                }
                              }}
                              onInputChange={(value) =>
                                setTechnologiesSearchTerm(value)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="absolute inline-block text-left -my-4">
                      {technologiesDropdownIsOpen && (
                        <ScrollArea
                          className="w-56 z-50 rounded-md shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none"
                          style={{
                            height:
                              filteredTechnologies.length > 0
                                ? `${Math.min(filteredTechnologies.length * 40, 200)}px`
                                : "auto",
                          }}
                        >
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-menu"
                            ref={technologyDropdownRef}
                          >
                            {filteredTechnologies.length > 0 ? (
                              filteredTechnologies.map((option) => (
                                <button
                                  key={option.uid}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleTechnologiesDropdownSelect(option);
                                    setTechnologiesSearchTerm("");
                                  }}
                                  className="dark:text-white block px-4 py-2 text-sm w-full text-left hover:bg-accent"
                                >
                                  {option.name
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(" ")}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No items found
                              </div>
                            )}
                          </div>
                        </ScrollArea>

                      )}
                    </div>
                  </div>
                </div>

                {/* Signals */}

                <div className="bg-muted px-2 rounded">
                  <FormField
                    control={form.control}
                    name="search_signals"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-start">
                        <FormLabel
                          className="flex justify-between font-normal w-full py-3 cursor-pointer items-center text-left"
                          onClick={() => toggleDropdown("searchSignals")}
                        >
                          <div>Signals</div>
                          {dropdownsOpen.searchSignals ? (
                            <ChevronUp color="#000000" />
                          ) : (
                            <ChevronUp
                              color="#000000"
                              className="transition-transform duration-200 transform rotate-180"
                            />
                          )}
                        </FormLabel>
                        <FormControl>
                          <div
                            className={`${dropdownsOpen.searchSignals ? "block" : "hidden"
                              }`}
                          >
                            {signals.map(
                              (signal, index) => (
                                <div
                                  className="text-sm flex items-center mb-3"
                                  key={index}
                                >
                                  <Checkbox
                                    {...field}
                                    className="mr-2"
                                    checked={checkedSearchSignal?.includes(
                                      signal.id
                                    )}
                                    onCheckedChange={(checked) => {
                                      const isChecked = checked.valueOf();
                                      const value = signal.id;


                                      const newCheckedValues = isChecked
                                      ? [...(checkedSearchSignal || []), value]
                                      : (checkedSearchSignal || []).filter(item => item !== value);

                                      setCheckedSearchSignal(newCheckedValues);
                                      field.onChange(newCheckedValues)
                                    }}
                                    value={signal.id}
                                  />
                                  {signal.name}
                                </div>
                              )
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Job Postings */}

                <div className="bg-muted px-2 rounded">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("jobPostings")}
                  >
                    <div className="text-sm">Job Posting</div>
                    {dropdownsOpen.jobPostings ? (
                      <ChevronUp color="#000000" />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.jobPostings ? "block" : "hidden"
                      }`}
                  >
                    <FormField
                      control={form.control}
                      name="job_posting_titles"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start pb-4 w-8/12 mt-3">
                          <FormLabel className="text-left">
                            Job Titles
                          </FormLabel>
                          <FormControl>
                            <TagInput
                              {...field}
                              tags={jobPostingTitles}
                              placeholder="Enter Job Title"
                              variant="base"
                              className="sm:min-w-[450px] bg-white/90 text-black placeholder:text-black/[70]"
                              setTags={(newTags) => {
                                setJobPostingTitles(newTags);
                                setValue(
                                  "job_posting_titles",
                                  newTags as [Tag, ...Tag[]]
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="job_posting_locations"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start pb-4 w-8/12">
                          <FormLabel className="text-left">
                            Job Locations
                          </FormLabel>
                          <FormControl>
                            <TagInput
                              {...field}
                              tags={jobPostingLocations}
                              placeholder="Enter Job Location"
                              variant="base"
                              className="sm:min-w-[450px] bg-white/90 text-black placeholder:text-black/[70]"
                              setTags={(newTags) => {
                                setJobPostingLocations(newTags);
                                setValue(
                                  "job_posting_locations",
                                  newTags as [Tag, ...Tag[]]
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>


                {/* Buying Intent */}

                <div className="bg-muted px-2 rounded">
                  <div
                    className="flex justify-between w-full py-3 cursor-pointer"
                    onClick={() => toggleDropdown("buyingIntent")}
                  >
                    <div className="text-sm">Buying Intent</div>
                    {dropdownsOpen.buyingIntent ? (
                      <ChevronUp color="#000000" />
                    ) : (
                      <ChevronUp
                        color="#000000"
                        className="transition-transform duration-200 transform rotate-180"
                      />
                    )}
                  </div>
                  <div
                    className={`${dropdownsOpen.buyingIntent ? "block" : "hidden"
                      }`}
                  >
                    <FormField
                      control={form.control}
                      name="buying_intent_scores"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                          <FormLabel
                            className="text-left"
                          >
                            Intent Scores
                          </FormLabel>
                          <FormControl>
                            <div>
                              {buyingIntentScores.map(
                                (intent, index) => (
                                  <div
                                    className="text-sm flex items-center mb-3"
                                    key={index}
                                  >
                                    <Checkbox
                                      {...field}
                                      className="mr-2"
                                      checked={checkedIntentScores?.includes(
                                        intent.id
                                      )}
                                      onCheckedChange={(checked) => {
                                        const isChecked = checked.valueOf();
                                        const value = intent.id;

                                        const newCheckedValues = isChecked
                                          ? [...(checkedIntentScores || []), value]
                                          : (checkedIntentScores || []).filter(item => item !== value);

                                        setCheckedIntentScores(newCheckedValues);
                                        field.onChange(newCheckedValues);
                                      }}
                                      value={intent.name}
                                    />
                                    {intent.name}
                                  </div>
                                )
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buying_intent_topics"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                          <FormLabel
                            className="text-left"
                          >
                            Intent Topics
                          </FormLabel>
                          <FormControl>
                            <div>
                              {buyingIntentTopics.map(
                                (intent, index) => (
                                  <div
                                    className="text-sm flex items-center mb-3"
                                    key={index}
                                  >
                                    <Checkbox
                                      {...field}
                                      className="mr-2"
                                      checked={checkedIntentTopics?.includes(
                                        intent.id
                                      )}
                                      
                                      onCheckedChange={(checked) => {
                                        const isChecked = checked.valueOf();
                                        const value = intent.id;

                                        const newCheckedValues = isChecked
                                          ? [...(checkedIntentTopics || []), value]
                                          : (checkedIntentTopics || []).filter(item => item !== value);

                                        setCheckedIntentTopics(newCheckedValues);
                                        field.onChange(newCheckedValues);
                                      }}

                                      value={intent.name}
                                    />
                                    {intent.name}
                                  </div>
                                )
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>
                </div>



                {/* <div className="bg-muted px-2 rounded">
                  <div
                    className={`${dropdownsOpen.jobPostings ? "block" : "hidden"
                      }`}
                  >
                    <div className="flex items-center  gap-2">
                      <div className="mb-3 ">
                        <FormField
                          control={form.control}
                          name="q_organization_job_titles"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-start mx-1 my-4">
                              <FormControl>
                                <TagInput
                                  {...field}
                                  dropdown={true}
                                  dropdownPlaceholder="Enter Technology"
                                  dropdownOptions={jobTitles}
                                  tags={jobOfferingTags}
                                  className="sm:min-w-[450px]"
                                  setTags={(newTags) => {
                                    setJobOfferingTags(newTags);
                                    setValue(
                                      "q_organization_job_titles",
                                      newTags as [Tag, ...Tag[]]
                                    );
                                  }}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div> */}


              </div>
            </div>
            {/* {type === "edit" && (
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  updateAudience();
                }}
                disabled={isTableLoading}
              >
                {isTableLoading ? <LoadingCircle /> : "Update Audience"}
              </Button>
            )} */}
          </TabsContent>
          <TabsContent value="tab2">
            {isTableLoading ? (
              <LoadingCircle />
            ) : (
              <div>
                {!isCreateBtnLoading ? <AudienceTable /> : <div className="mt-10"></div>}
              </div>
            )}

            {type === "create" ? (
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  createAudience();
                }}
                disabled={isSubmitting}
              >
                {isCreateBtnLoading ? <LoadingCircle /> : "Create Audience"}
              </Button>
            ) : (
              <div className="w-1/4 space-y-4 justify-between">
                <Button
                  onClick={(event) => {
                    event.preventDefault();
                    updateAudience();
                  }}
                  disabled={isSubmitting}
                >
                  Update Audience
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}