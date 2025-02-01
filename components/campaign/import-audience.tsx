/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */
import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { LoadingCircle } from "@/app/icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2Icon, Loader2, FileIcon } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { Contact, Lead, useLeads } from "@/context/lead-user";
import { AudienceTableClient } from "../tables/audience-table/client";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useButtonStatus } from "@/context/button-status";
import axios from "axios";
import AudienceTable from "../ui/AudienceTable";
import { Card, CardHeader } from "@/components/ui/card";
import { CardTitle } from "../ui/card";
import { CardDescription } from "../ui/card";
import { useAuth } from "@/context/auth-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useSubscription } from "@/hooks/userSubscription";

interface FileData {
  [key: string]: string;
}

interface MappedColumn {
  required: boolean;
  label: string;
  key: string;
  description: string;
}

const REQUIRED_MAPPINGS: MappedColumn[] = [
  {
    required: true,
    label: "First Name",
    key: "first_name",
    description: "Contact's first name"
  },
  {
    required: false,
    label: "Last Name",
    key: "last_name",
    description: "Contact's last name"
  },
  {
    required: true,
    label: "Email",
    key: "email",
    description: "Contact's email address"
  },
  {
    required: true,
    label: "Company Name",
    key: "organization_name",
    description: "Company/Organization name"
  },
  {
    required: false,
    label: "LinkedIn URL",
    key: "linkedin_url",
    description: "Contact's LinkedIn profile URL"
  },
  {
    required: false,
    label: "Title",
    key: "title",
    description: "Job title/position"
  },
  {
    required: false,
    label: "Phone",
    key: "phone",
    description: "Contact's phone number"
  },
  {
    required: false,
    label: "Company City",
    key: "company_city",
    description: "City where the company is located"
  },
  {
    required: false,
    label: "Company State",
    key: "company_state",
    description: "State where the company is located"
  },
  {
    required: false,
    label: "Company Country",
    key: "company_country",
    description: "Country where the company is located"
  },
  {
    required: false,
    label: "Company Address",
    key: "company_address",
    description: "Address of the company"
  },
  {
    required: false,
    label: "Company Zip",
    key: "company_zip",
    description: "Zip code of the company location"
  },
  {
    required: false,
    label: "Company Website",
    key: "company_website",
    description: "Website of the company"
  },
  {
    required: false,
    label: "Company LinkedIn",
    key: "company_linkedin",
    description: "LinkedIn URL of the company"
  },
  {
    required: false,
    label: "Company Facebook",
    key: "company_facebook",
    description: "Facebook URL of the company"
  },
  {
    required: false,
    label: "Company Twitter",
    key: "company_twitter",
    description: "Twitter URL of the company"
  },
  {
    required: false,
    label: "Industry",
    key: "industry",
    description: "Industry of the company"
  },
  {
    required: false,
    label: "Employee Count",
    key: "employee_count",
    description: "Number of employees in the company"
  },
  {
    required: false,
    label: "Annual Revenue",
    key: "annual_revenue",
    description: "Annual revenue of the company"
  },
  {
    required: false,
    label: "Technologies",
    key: "technologies",
    description: "Technologies used by the company"
  }
];

export const ImportAudience = () => {
  const [fileData, setFileData] = useState<FileData[]>();
  const [file, setFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const { leads, setLeads, selectedLeadIds } = useLeads();
  const [isLeadsTableActive, setIsLeadsTableActive] = useState(false);
  const [isCreateBtnLoading, setIsCreateBtnLoading] = useState(false);
  const { user } = useAuth();
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const [type, setType] = useState<"create" | "edit">("create");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setPageCompletion } = useButtonStatus();

  const [isEnrichmentLoading, setIsEnrichmentLoading] = useState(false);
  const [showCard, setShowCard] = useState(true);

  const [importMethod, setImportMethod] = useState<'enhance' | 'direct' | null>(null);
  const [directImportData, setDirectImportData] = useState<FileData[]>();

  const [showImportCards, setShowImportCards] = useState(true);

  const [showProviderDialog, setShowProviderDialog] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  const [showMappedTable, setShowMappedTable] = useState(false);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [dailyLimit, setDailyLimit] = useState<number>(50);
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    const fetchDailyLimit = async () => {
      try {
        const response = await axiosInstance.get(`v2/linkedin/user-sum/${params.campaignId}`);
        if (response.data && response.data.count) {
          setDailyLimit(Math.min(response.data.count, mappedData.length));
        }
      } catch (error) {
        console.error("Error fetching daily limit:", error);
        setDailyLimit(mappedData.length);
      }
    };

    if (user?.id) {
      fetchDailyLimit();
    }
  }, [user?.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];

      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size exceeds 50MB limit");
        return;
      }

      setIsLoading(true);
      setFile(file);
      setShowImportCards(false);
    }
  };

  useEffect(() => {
    if (file) {
      if (file.name.endsWith(".csv")) {
        if (importMethod === 'direct') {
          Papa.parse(file, {
            header: true,
            complete: (results) => {
              setDirectImportData(results.data as FileData[]);
              setIsLoading(false);
              setIsDialogOpen(true);
            },
            error: (error) => {
              setError("Error parsing CSV: " + error.message);
              setIsLoading(false);
            },
          });
        } else {
          parseCSV(file);
        }
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        if (importMethod === 'direct') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);
            setDirectImportData(parsedData as FileData[]);
            setIsLoading(false);
            setIsDialogOpen(true);
          };
          reader.readAsBinaryString(file);
        } else {
          parseExcel(file);
        }
      }
    }
  }, [file, importMethod]);

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setFileData(results.data as FileData[]);
        setIsLoading(false);
        setIsDialogOpen(true);
      },
      error: (error) => {
        setError("Error parsing CSV: " + error.message);
        setIsLoading(false);
      },
    });
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setFileData(parsedData as FileData[]);
      setIsLoading(false);
      setIsDialogOpen(true);
    };
    reader.onerror = (error) => {
      setError("Error parsing Excel: " + error);
      setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await axiosInstance.get(
            `v2/lead/campaign/${params.campaignId}`
          );
          const data = response.data;
          if (data.detail === "No Contacts found") {
            setType("create");
          } else {
            setLeads(data);
            setType("edit");
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);

  const handleRemoveFile = () => {
    setFile(undefined);
    setFileData(undefined);
  };

  const [selectedValue, setSelectedValue] = useState<
    {
      presetValue: string;
      fileColumnName: string;
    }[]
  >([]);

  const [presetValues, setPresetValue] = useState<string[]>([]);

  const handleSelectChange = (value: string) => {
    const [presetValue, fileColumnName] = value.split("~");
    if (!presetValues.includes(presetValue)) {
      setPresetValue((prevState) => [...prevState, presetValue]);
      setSelectedValue((prevState) => [
        ...prevState,
        { presetValue, fileColumnName },
      ]);
    }
  };

  const enrichmentHandler = async () => {
    setIsEnrichmentLoading(true);
    setShowCard(false);
    try {
      const response = await axiosInstance.post(`v2/apollo/leads/bulk_enrich`, {
        user_id: user?.id,
        campaign_id: params.campaignId,
        details: mappedData,
        apollo_url: "",
        daily_limit: dailyLimit

      });
      console.log(response.data);
      const leadBulkEnrichResponse = await axiosInstance.post(`v2/lead/bulk/`, {
        user_id: user?.id,
        campaign_id: params.campaignId,
        leads: response.data
      });
      console.log(leadBulkEnrichResponse.data);
      const getRecData = await axiosInstance.get(
        `v2/campaigns/${params.campaignId}`
      );

      if (getRecData.data.schedule_type === "recurring") {
        const recurringResponse = await axiosInstance.post(
          "v2/recurring_campaign_request",
          {
            campaign_id: params.campaignId,
            user_id: user?.id,
            apollo_url: "",
            page: dailyLimit,
            is_active: false,
            leads_count: dailyLimit,
          }
        );
      }
      const postBody = {
        campaign_id: params.campaignId,
        audience_type: "prospective",
        filters_applied: {},
      };
      const audienceResponse = await axiosInstance.post(
        "v2/audience/",
        postBody
      );
      const audienceData = audienceResponse.data;
      console.log("Audience created:", audienceData);

      setPageCompletion("audience", true);
      toast.success("Audience created successfully");

      // Step 3: Update user details
      toast.info("Updating user details, please wait...");
      let attempts = 0;
      const maxAttempts = 13;
      const pollInterval = 7000; // 7 seconds

      const checkLeads = async () => {
        try {
          const response = await axiosInstance.get(
            `v2/lead/campaign/${params.campaignId}`
          );
          if (Array.isArray(response.data) && response.data.length >= 1) {
            setIsCreateBtnLoading(false);
            setTimeout(() => {
              setIsEnrichmentLoading(false);
              router.push(`/campaign/${params.campaignId}`);
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

      poll();
    } catch (error) {
      console.error("Error enriching leads:", error);
    }
    finally {

    }

  };

  function mapLeadsToBodies(leads: Lead[]): Contact[] {
    if (!user) {
      return [];
    }
    return leads.map((lead: any) => ({
      id: lead.id,
      user_id: user.id,
      campaign_id: lead.campaign_id,
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
      pain_points: lead.pain_points || [],
      value: lead.value || [],
      metrics: lead.metrics || [],
      compliments: lead.compliments || [],
      lead_information: lead.lead_information || String,
      is_b2b: "false",
      score: lead.score,
      qualification_details: lead.qualification_details || String,
      company: lead.company,
      phone: lead.phone,
      technologies: lead.technologies || [],
      organization: lead.organization,
      linkedin_posts: lead.linkedin_posts || [],
      linkedin_bio: lead.linkedin_bio || "",
      social_monitoring_data: lead.social_monitoring_data || "",
      personalized_social_info: lead.personalized_social_info || "",
      sequence_count: lead.sequence_count || 0,
    }));
  }

  const createAudience = async () => {
    const audienceBody = mapLeadsToBodies(leads as Lead[]);
    setIsCreateBtnLoading(true);
    try {
      // Step 1: Create contacts
      const contactsResponse = await axiosInstance.post(
        `v2/lead/bulk/`,
        {
          user_id: user?.id,
          campaign_id: params.campaignId,
          leads: selectedLeadIds
        }
      );
      const contactsData = contactsResponse.data;
      setLeads(Array.isArray(contactsData) ? contactsData : [contactsData]);

      // Step 2: Create audience entry
      const postBody = {
        campaign_id: params.campaignId,
        audience_type: "prospective",
        filters_applied: {}, // Add any filters if applicable
      };

      const audienceResponse = await axiosInstance.post(
        "v2/audience/",
        postBody
      );
      const audienceData = audienceResponse.data;
      console.log("Audience created:", audienceData);

      setPageCompletion("audience", true);
      toast.success("Audience created successfully");

      // Step 3: Update user details
      toast.info("Updating user details, please wait...");
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 6000; // 7 seconds

      const checkLeads = async () => {
        try {
          const response = await axiosInstance.get(
            `v2/lead/campaign/${params.campaignId}`
          );
          if (Array.isArray(response.data) && response.data.length >= 1) {
            setIsCreateBtnLoading(false);
            setTimeout(() => {
              router.push(`/campaign/${params.campaignId}`);
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

      poll();
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.toString() : String(error));
      setIsCreateBtnLoading(false);
      toast.error("Failed to create audience");
    }
  };

  const filteredOptions = [
    "Name",
    "Email",
    "LinkedIn URL",
    "Company Name",
    "Company Website URL",

  ];

  const handleCardClick = () => {
    if (fileInputRef.current) {
      setImportMethod('enhance');
      fileInputRef.current.click();
    }
  };

  const handleImportCardClick = () => {
    setShowProviderDialog(true);
  };



  const DirectImportTable = ({ data }: { data: FileData[] }) => {
    // Add record count check
    useEffect(() => {
      if (data.length > 2000) {
        toast.error("File contains more than 2000 records. Please reduce the number of records.");
        setShowImportCards(true);
        setFile(undefined);
        setFileData(undefined);
        setDirectImportData(undefined);
        setImportMethod(null);
      }
    }, [data]);

    const filteredData = data.filter(row =>
      Object.values(row).some(value =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== 'Empty'
      )
    );

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const startIndex = 0;
    const endIndex = currentPage * recordsPerPage;
    const hasMoreRecords = endIndex < filteredData.length;

    const handleLoadMore = () => {
      setCurrentPage(prev => prev + 1);
    };
    const [dailyLimit, setDailyLimit] = useState<number>(25); // Default value of 50
    const [isSaving, setIsSaving] = useState(false);

    const [showMapping, setShowMapping] = useState(selectedProvider === 'csv');
    const [mappedColumns, setMappedColumns] = useState<Record<string, string>>({});

    // Add this helper function to determine if mapping is needed
    const shouldShowMapping = () => {
      return selectedProvider === 'csv';
    };

    useEffect(() => {
      const fetchDailyLimit = async () => {
        try {
          const response = await axiosInstance.get(`v2/linkedin/user-sum/${params.campaignId}`);
          if (response.data && response.data.count) {
            setDailyLimit(Math.min(response.data.count, filteredData.length));
          }
        } catch (error) {
          console.error("Error fetching daily limit:", error);
          setDailyLimit(filteredData.length);
        }
      };

      if (user?.id) {
        fetchDailyLimit();
      }
    }, [params.campaignId]);

    const ColumnMappingDialog = () => {
      return (
        <Dialog
          open={showMapping}
          onOpenChange={setShowMapping}
          modal={false}
        >
          <DialogContent
            className="max-w-2xl max-h-[80vh] flex flex-col"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Map CSV Columns</DialogTitle>
              <DialogDescription>
                Map your CSV columns to required fields. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-6 -mr-6">
              <div className="space-y-4">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[200px]">Required Field</TableHead>
                      <TableHead>CSV Column</TableHead>
                      <TableHead>Sample Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REQUIRED_MAPPINGS.map((mapping) => (
                      <TableRow key={mapping.key}>
                        <TableCell className="font-medium">
                          {mapping.label} {mapping.required && "*"}
                          <div className="text-xs text-muted-foreground">
                            {mapping.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mappedColumns[mapping.key] || ""}
                            onValueChange={(value) => {
                              setMappedColumns(prev => ({
                                ...prev,
                                [mapping.key]: value
                              }));
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              <SelectGroup>
                                {Object.keys(data[0]).map((column) => (
                                  <SelectItem key={column} value={column}>
                                    {column}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {mappedColumns[mapping.key] ? data[0][mappedColumns[mapping.key]] : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="mt-4 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportCards(true);
                  setFile(undefined);
                  setFileData(undefined);
                  setDirectImportData(undefined);
                  setImportMethod(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const requiredFields = REQUIRED_MAPPINGS.filter(m => m.required).map(m => m.key);
                  const missingFields = requiredFields.filter(field => !mappedColumns[field]);

                  if (missingFields.length > 0) {
                    toast.error(`Please map all required fields: ${missingFields.join(", ")}`);
                    return;
                  }

                  setShowMapping(false);
                }}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    const handleSaveContacts = async () => {
      setIsSaving(true);
      try {
        const mappedData = filteredData.map(row => {
          const mapped: Record<string, any> = {};
          Object.entries(mappedColumns).forEach(([key, csvColumn]) => {
            mapped[key] = row[csvColumn];
          });
          return mapped;
        });

        const payload = {
          user_id: user?.id,
          campaign_id: params.campaignId,
          daily_limit: dailyLimit,
          provider: selectedProvider,
          leads: mappedData
        };

        const response = await axiosInstance.post('v2/contacts/bulk-import', payload);

        const getRecData = await axiosInstance.get(
          `v2/campaigns/${params.campaignId}`
        );

        if (getRecData.data.schedule_type === "recurring") {
          const recurringResponse = await axiosInstance.post(
            "v2/recurring_campaign_request",
            {
              campaign_id: params.campaignId,
              user_id: user?.id,
              apollo_url: "",
              page: dailyLimit,
              is_active: false,
              leads_count: dailyLimit,
            }
          );
        }

        toast.info("Updating user details, please wait...");

        // Start polling for leads
        let attempts = 0;
        const maxAttempts = 15;
        const pollInterval = 6000; // 7 seconds

        const checkLeads = async () => {
          try {
            const response = await axiosInstance.get(
              `v2/lead/campaign/${params.campaignId}`
            );
            if (Array.isArray(response.data) && response.data.length >= 1) {

              setTimeout(() => {
                router.push(`/campaign/${params.campaignId}`);
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
            setIsSaving(false);
            return;
          }

          setTimeout(poll, pollInterval);
        };

        poll();



      } catch (error) {
        console.error("Error saving contacts:", error);
        toast.error("Failed to save contacts. Please try again.", { id: "import" });
      }
    };

    // Add this to get mapped columns for display
    const getMappedHeaders = () => {
      return Object.entries(mappedColumns)
        .filter(([_, value]) => value) // Only include columns that have been mapped
        .map(([key, value]) => ({
          originalHeader: value,
          mappedHeader: REQUIRED_MAPPINGS.find(m => m.key === key)?.label || key
        }));
    };

    // Add this to transform data for display
    const getDisplayData = () => {
      return filteredData.map(row => {
        const displayRow: Record<string, string> = {};
        Object.entries(mappedColumns).forEach(([mappedKey, originalColumn]) => {
          if (originalColumn) { // Only include mapped columns
            const label = REQUIRED_MAPPINGS.find(m => m.key === mappedKey)?.label || mappedKey;
            displayRow[label] = row[originalColumn];
          }
        });
        return displayRow;
      });
    };

    return (
      <div className="mt-4 space-y-4">
        {shouldShowMapping() && <ColumnMappingDialog />}
        {(!shouldShowMapping() || !showMapping) && ( // Show preview if not CSV or mapping is complete
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {shouldShowMapping() ? "Preview Mapped Data" : "Preview Import Data"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(endIndex, filteredData.length)} of {filteredData.length} total records
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="relative max-w-[calc(100vw-2rem)]">
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          {shouldShowMapping() ? (
                            getMappedHeaders().map(({ mappedHeader }, index) => (
                              <TableHead
                                key={index}
                                className="bg-muted/50 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                              >
                                {mappedHeader}
                              </TableHead>
                            ))
                          ) : (
                            Object.keys(filteredData[0]).map((header) => (
                              <TableHead
                                key={header}
                                className="bg-muted/50 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                              >
                                {header}
                              </TableHead>
                            ))
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(shouldShowMapping() ? getDisplayData() : filteredData)
                          .slice(startIndex, endIndex)
                          .map((row, rowIndex) => (
                            <TableRow
                              key={rowIndex}
                              className="hover:bg-muted/50 transition-colors border-b last:border-0"
                            >
                              {Object.values(row).map((value, cellIndex) => (
                                <TableCell
                                  key={cellIndex}
                                  className="py-2.5 text-sm whitespace-nowrap px-4"
                                >
                                  {value && value !== 'Empty' ? (
                                    <span className="truncate max-w-[200px] block">
                                      {value}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground italic text-xs">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <div className="border-t bg-muted/50 p-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {hasMoreRecords ? (
                    <div
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={handleLoadMore}
                    >
                      + Show {filteredData.length - endIndex} more records
                    </div>
                  ) : (
                    `Showing all ${filteredData.length} records`
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="dailyLimit"
                className="text-sm text-muted-foreground whitespace-nowrap"
              >
                Number of leads to be contacted per day:
              </label>
              <Input
                id="dailyLimit"
                type="number"
                min={1}
                max={200}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-[100px] h-9"
                placeholder="50"
              />
            </div>

            <div className="text-sm text-muted-foreground pb-4">
              Your Campaign would be completed in {Math.ceil(filteredData.length / dailyLimit)} days
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportCards(true);
                  setFile(undefined);
                  setFileData(undefined);
                  setDirectImportData(undefined);
                  setImportMethod(null);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveContacts}
                disabled={isSaving || filteredData.length === 0}
                className="min-w-[140px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save {filteredData.length} Contacts
                  </>
                )}
              </Button>
            </div>
            {isSaving && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-card p-6 rounded-lg shadow-lg text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-lg font-medium">Processing your contacts...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments. Please don't close this window.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const ProviderSelectionDialog = () => {
    const [localProvider, setLocalProvider] = useState<any | null>(null);

    const handleProviderChange = (value: string) => {
      setLocalProvider(value as any);
    };

    const handleContinue = () => {
      if (localProvider) {
        setSelectedProvider(localProvider);
        setShowProviderDialog(false);
        setImportMethod('direct');
        fileInputRef.current?.click();
      }
    };

    return (
      <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Data Provider</DialogTitle>
            <DialogDescription>
              Choose your data source to import contacts
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <RadioGroup
              value={localProvider || ''}
              onValueChange={handleProviderChange}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="apollo"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${localProvider === 'apollo' ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                    }`}
                >
                  <RadioGroupItem value="apollo" id="apollo" />
                  <div className="bg-primary/10 p-2 rounded">
                    <Image
                      src="/apollo.svg"
                      alt="Apollo"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <div className="font-medium">Apollo</div>
                    <div className="text-sm text-muted-foreground">Import from Apollo contacts</div>
                  </div>
                </Label>

                <Label
                  htmlFor="rocketreach"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${localProvider === 'rocketreach' ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                    }`}
                >
                  <RadioGroupItem value="rocketreach" id="rocketreach" />
                  <div className="bg-primary/10 p-2 rounded">
                    <Image
                      src="/rocketreach.png"
                      alt="RocketReach"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <div className="font-medium">RocketReach</div>
                    <div className="text-sm text-muted-foreground">Import from RocketReach</div>
                  </div>
                </Label>

                <Label
                  htmlFor="lusha"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${localProvider === 'lusha' ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                    }`}
                >
                  <RadioGroupItem value="lusha" id="lusha" />
                  <div className="bg-primary/10 p-2 rounded">
                    <Image
                      src="/lusha.png"
                      alt="lusha"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <div className="font-medium">Lusha</div>
                    <div className="text-sm text-muted-foreground">Import from Lusha</div>
                  </div>
                </Label>

                <Label
                  htmlFor="zoominfo"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${localProvider === 'zoominfo' ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                    }`}
                >
                  <RadioGroupItem value="zoominfo" id="zoominfo" />
                  <div className="bg-primary/10 p-2 rounded">
                    <Image
                      src="/zoominfo.png"
                      alt="zoominfo"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <div className="font-medium">ZoomInfo</div>
                    <div className="text-sm text-muted-foreground">Import from ZoomInfo</div>
                  </div>
                </Label>


                <Label
                  htmlFor="csv"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${localProvider === 'csv' ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                    }`}
                >
                  <RadioGroupItem value="csv" id="csv" />
                  <div className="bg-primary/10 p-2 rounded">
                    <FileIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium">CSV/Excel File</div>
                    <div className="text-sm text-muted-foreground">Upload your own contact list</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setShowProviderDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!localProvider}
            >
              Continue with {localProvider || ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };


  return (
    <>
      {showImportCards && (
        <div className="my-4">
          <h2 className="text-2xl font-bold mb-4">Choose Your Import Method</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className={` transition-all h-60 border-primary hover:shadow-lg ${!isSubscribed ? 'opacity-50 cursor-not-allowed' : ' cursor-pointer'
                }`}
              onClick={isSubscribed ? handleCardClick : undefined}
            >
              <CardHeader>
                <CardTitle className="text-2xl mb-2 flex items-center">
                  <FileIcon className="mr-2" /> Enhance Your Contact List {!isSubscribed && "*"}
                </CardTitle>
                <CardDescription>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Upload your file (CSV, Excel, etc.)</li>
                    <li>We'll enrich each contact with additional details</li>
                    <li>Get their email ID, LinkedIn ID, job titles, company size, etc.</li>
                    <li>Save time on manual research</li>
                    <li>Required fields: Name, Company</li>
                  </ul>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer transition-all h-60 border-primary hover:shadow-lg"
              onClick={handleImportCardClick}
            >
              <CardHeader>
                <CardTitle className="text-2xl mb-2 flex items-center">
                  <FileIcon className="mr-2" /> Import Your Contact List
                </CardTitle>
                <CardDescription>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Upload your file (CSV, Excel, etc.)</li>
                    <li>Direct import of your contacts</li>
                    <li>No enrichment process</li>
                    <li>Maximum file size: 50MB</li>
                    <li>Maximum 2000 records per import</li>
                  </ul>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {!isSubscribed && (
            <p className="text-sm text-gray-500 italic mt-4">
              * Contact enrichment is available with our paid plans. Contact support to unlock all features.
            </p>
          )}

          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      <ProviderSelectionDialog />
      {!showImportCards && (
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => {
            setShowImportCards(true);
            setFile(undefined);
            setFileData(undefined);
            setDirectImportData(undefined);
            setImportMethod(null);
          }}
        >
          ← Back to Import Options
        </Button>
      )}
      {error && <div className="text-red-500">{error}</div>}
      {isLoading && <LoadingCircle />}
      {importMethod === 'enhance' && fileData && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Map File Columns</DialogTitle>
                <DialogDescription>
                  Map the file columns to appropriate fields.
                </DialogDescription>
              </DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[150px] font-semibold">Column Name</TableHead>
                    <TableHead className="w-[150px] font-semibold">Select Type</TableHead>
                    <TableHead className="w-[150px] font-semibold">Samples</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(fileData[0]).map((column, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-primary">{column}</TableCell>
                      <TableCell>
                        <Select onValueChange={handleSelectChange}>
                          <SelectTrigger className="w-[180px] border-primary/20">
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                          <SelectContent className="h-60">
                            <SelectGroup>
                              <SelectLabel className="font-semibold">Options</SelectLabel>
                              {filteredOptions.map((option, index) => (
                                <SelectItem
                                  key={index}
                                  value={`${option.toLowerCase().replace(/ /g, "_")}~${column}`}
                                  className="cursor-pointer hover:bg-primary/10"
                                >
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground italic">
                        {fileData[0][column]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DialogFooter className="flex sm:justify-start">
                <Button
                  onClick={() => {
                    // Transform data based on selected mappings
                    const transformedData = fileData.map(row => {
                      const mappedRow: Record<string, string> = {};
                      selectedValue.forEach(({ presetValue, fileColumnName }) => {
                        mappedRow[presetValue] = row[fileColumnName];
                      });
                      return mappedRow;
                    });

                    setMappedData(transformedData);
                    setShowMappedTable(true);
                    setIsDialogOpen(false);
                  }}
                  className="w-1/3"
                >
                  Confirm
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="w-1/3">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {showMappedTable && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Preview Mapped Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {mappedData.length} records
                  </p>
                </div>
                <Button
                  onClick={enrichmentHandler}
                  disabled={isEnrichmentLoading}
                >
                  {isEnrichmentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrich Contacts
                    </>
                  ) : (
                    "Enrich Contacts"
                  )}
                </Button>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(mappedData[0] || {}).map((header) => (
                          <TableHead
                            key={header}
                            className="bg-muted/50 py-3 text-xs font-medium uppercase tracking-wider"
                          >
                            {header.replace(/_/g, ' ')}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappedData.slice(0, 10).map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell
                              key={cellIndex}
                              className="py-2.5 text-sm"
                            >
                              {value === null || value === undefined ? '-' : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {mappedData.length > 10 && (
                  <div className="border-t bg-muted/50 p-4">
                    <div className="text-sm text-muted-foreground">
                      Showing first 10 of {mappedData.length} records
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="dailyLimit"
                  className="text-sm text-muted-foreground whitespace-nowrap"
                >
                  Number of leads to be contacted per day:
                </label>
                <Input
                  id="dailyLimit"
                  type="number"
                  min={1}
                  max={50}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-[100px] h-9"
                  placeholder="50"
                />
              </div>

              <div className="text-sm text-muted-foreground pb-4">
                Your Campaign would be completed in {Math.ceil(mappedData.length / dailyLimit)} days
              </div>


              <Button
                variant="outline"
                onClick={() => {
                  setShowMappedTable(false);
                  setIsDialogOpen(true);
                }}
                className="mt-4"
              >

                Back to Mapping
              </Button>
              {isEnrichmentLoading && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-card p-6 rounded-lg shadow-lg text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-lg font-medium">Processing your contacts...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments. Please don't close this window.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {importMethod === 'direct' && directImportData && (
        <DirectImportTable data={directImportData} />
      )}

      {isLeadsTableActive && (
        <>
          <AudienceTable />
          {isCreateBtnLoading ? (
            <LoadingCircle />
          ) : (
            <Button
              onClick={(event) => {
                event.preventDefault();
                createAudience();
              }}
            >
              {type === "create" ? "Create Audience" : "Update Audience"}
            </Button>
          )}
        </>
      )}
    </>
  );
};
