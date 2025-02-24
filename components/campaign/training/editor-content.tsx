/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable-next-line padded-blocks */
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Loader, X, BookOpen } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import SubjectForm from "@/components/campaign/training/subject-form";
import FieldList from "@/components/campaign/training/field-list";
import FieldTextArea from "@/components/campaign/training/field-text-area";
import { Button } from "@/components/ui/button";
import { useAutoGenerate } from "@/context/auto-generate-mail";
import { useParams } from "next/navigation";
import { useFieldsList } from "@/context/training-fields-provider";
import { Textarea } from "@/components/ui/textarea";
import {
  getAutogenerateFollowup,
  getAutogenerateTrainingTemplate,
  getTraining,
} from "./training.api";
import { FieldType, VariableType, allFieldsListType } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingCircle } from "@/app/icons";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/context/auth-provider";
import { FollowUpSection } from "./follow-up-section";

interface Variable {
  id: string;
  value: string;
  length: string;
  isCustom: boolean;
}

// Add type for follow-up
interface FollowUp {
  id: number;
  value: string;
}

const EmailExampleDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Email Example Sequence</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col space-y-3">
        <div className="font-semibold text-foreground">
          Email Reference Template
        </div>
        <div className="font-semibold text-base">
          Subject:{" "}
          <span className="font-normal text-muted-foreground">
            Connecting with{" "}
            <b className="text-foreground/60">
              {"{"}recievers company{"} "}
            </b>
            founders
          </span>
        </div>
        <div className="font-semibold text-base text-foreground">
          Subject:{" "}
          <span className="font-normal text-muted-foreground">
            Connecting with GenAi founders
          </span>
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-2 text-sm">
            <div>
              Hi{" "}
              <b className="text-foreground/60">
                {"{"}lead name{"}"}
              </b>
              ,
            </div>
            <div>
              I came across{" "}
              <b className="text-foreground/60">
                {"{"}company name{"} "}
              </b>
              and saw that you're selling{" "}
              <b className="text-foreground/60">
                {"{"}
                company offering{"} "}
              </b>
              . I'd like to introduce you to AgentProd, an AI sales
              automation platform that can help scale your sales
              efficiently.
            </div>
            <div>
              I'm the co-founder of AgentProd. We're helping some of
              the fastest growing startups in{" "}
              <b className="text-foreground/60">
                {" "}
                {"{"}company location
                {"} "}
              </b>
              to automate their sales processes with our GPT-based
              platform.{" "}
              <b className="text-foreground/60">
                {"{"} if sender location is same as company location
                say "We should meet and discuss about your product
                sales and it's growth in person" other wise say
                nothing {"}"}.
              </b>
              We're currently in private beta, but I thought you might
              be interested in giving AgentProd a try.{" "}
              <b className="text-foreground/60">
                {"{"} if is funded company say "It's great to see that
                you are a funded company!" other wise say "It's great
                to see your interest and efforts!"{"} "}
              </b>
              I'm happy to prioritize you.
            </div>
            <div>Cheers,</div>
            <div>
              <b className="text-foreground/60">
                {"{"}sender name{"}"}
              </b>
            </div>
            <div>
              <b className="text-foreground/60">
                {"{"}phone no{"}"}
              </b>
            </div>
          </div>
        </div>
        <div className="text-lg font-semibold text-foreground">
          Follow-up Template 1
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-2 text-sm">
            Hi{" "}
            <b className="text-foreground/60">
              {"{"}lead name{"}"}
            </b>
            , just bumping this up since I haven't heard back from you
            yet. Other companies using our platform have already seen
            a significant increase in their sales. I'd be happy to
            jump on a call and discuss how AgentProd can benefit your
            company.
          </div>
        </div>
        <div className="text-lg font-semibold text-foreground">
          Follow-up Template 2
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-4 text-sm">
            Hi{" "}
            <b className="text-foreground/60">
              {"{"}lead name{"}"}
            </b>
            , since I haven't heard back from you yet, I assume our
            platform may not be relevant to you at this point. If
            there's someone else in your team who might be the right
            point of contact, please connect me. Sorry if I bothered
            you, and I wish you all the best!
          </div>
        </div>
        <hr />
        <div className="font-semibold text-xl text-foreground">
          Reference Email
        </div>
        <div className="font-semibold text-base text-foreground">
          Subject:{" "}
          <span className="font-normal text-muted-foreground">
            Connecting with GenAi founders
          </span>
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-2 text-sm">
            <div>
              Hi Alex, I came across Koxa and saw that you're selling
              an accounting-to-banking API. I'd like to introduce you
              to AgentProd, an AI sales automation platform that can
              help scale your sales efficiently.
            </div>
            <div>
              I'm the co-founder of AgentProd. We're helping some of
              the fastest growing startups in Silicon Valley to
              automate their sales processes with our GPT-based
              platform. We should meet and discuss about your product
              sales and it's growth in person. We're currently in
              private beta, but I thought you might be interested in
              giving AgentProd a try. It's great to see that you are a
              funded company! I'm happy to prioritize you.
            </div>
            <div>
              Cheers, <div>Muskaan</div>
              <div>+1-555-555-5555</div>
            </div>
          </div>
        </div>
        <div className="text-lg font-semibold text-foreground">
          Follow-up 1
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-4 text-sm">
            Hi Alex, just bumping this up since I haven't heard back
            from you yet. Other API-first companies like Svix have
            already seen a significant increase in their sales through
            us. I'd be happy to jump on a call and discuss how
            AgentProd can benefit your company.
          </div>
        </div>
        <div className="text-lg font-semibold text-foreground">
          Follow-up 2
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-4 text-sm">
            Hi Alex, since I haven't heard back from you yet, I assume
            automating sales with AI is not relevant to you at this
            point. If there's someone else in your team who might be
            the right point of contact, please connect me. Sorry if I
            bothered you, and wish you all the best!
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const LinkedInExampleDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>LinkedIn Example Sequence</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col space-y-3">
        <div className="font-semibold text-foreground">
          LinkedIn Message Template
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-2 text-sm">
            <div>
              Hi <b className="text-foreground/60">{"{"}first name{"}"}</b>,
            </div>
            <div>
              I noticed you're leading <b className="text-foreground/60">{"{"}current job role{"}"}</b> at <b className="text-foreground/60">{"{"}current company{"}"}</b>.
              I'm reaching out because we've developed an AI sales automation platform that's helping companies in the <b className="text-foreground/60">{"{"}industry{"}"}</b> space scale their sales operations efficiently.
            </div>
            <div>
              Would you be open to a quick chat about how we could help streamline your sales processes?
            </div>
            <div>Best regards,</div>
            <div><b className="text-foreground/60">{"{"}sender name{"}"}</b></div>
          </div>
        </div>

        <div className="text-lg font-semibold text-foreground mt-6">
          Example Message
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-2 text-sm">
            <div>Hi Sarah,</div>
            <div>
              I noticed you're leading Sales Operations at TechCorp. I'm reaching out because we've developed an AI sales automation platform that's helping companies in the SaaS space scale their sales operations efficiently.
            </div>
            <div>
              Would you be open to a quick chat about how we could help streamline your sales processes?
            </div>
            <div>Best regards,</div>
            <div>Alex</div>
          </div>
        </div>

        <div className="text-lg font-semibold text-foreground mt-6">
          Follow-up Template 1
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-2 text-sm">
            Hi <b className="text-foreground/60">{"{"}first name{"}"}</b>,
            I wanted to follow up on my previous message. Our platform has been helping companies achieve 3x more meetings with qualified leads.
            Would you be interested in seeing how it works?
          </div>
        </div>

        <div className="text-lg font-semibold text-foreground mt-6">
          Follow-up Template 2
        </div>
        <div className="flex space-x-5 py-4">
          <div className="w-3 h-full bg-muted"></div>
          <div className="text-foreground/40 space-y-2 text-sm">
            Hi <b className="text-foreground/60">{"{"}first name{"}"}</b>,
            I'll make this my final message. If you're interested in learning how we're helping companies like yours automate their sales processes,
            feel free to reach out anytime. Wishing you continued success!
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default function EditorContent() {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showAdditionalTextArea, setShowAdditionalTextArea] = useState(false);
  const [showAdditionalTextAreaTwo, setShowAdditionalTextAreaTwo] =
    useState(false);
  const [followUpButton, setFollowUpButton] = useState(false);

  const [variableDropdownIsOpen, setVariableDropdownIsOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [templateIsLoading, setTemplateIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const followUpRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    fieldsList,
    body,
    setBody,
    subject,
    setSubject,
    followUpOne,
    setFollowUpOne,
    followUp,
    setFollowUp,
    setFieldsList,
    linkedinBody,
    setLinkedinBody,
    linkedinFollowUp,
    setLinkedinFollowUp,
    linkedinFollowUpTwo,
    setLinkedinFollowUpTwo,
    emailFollowUps,
    setEmailFollowUps,
    linkedinFollowUps,
    setLinkedinFollowUps,
  } = useFieldsList();
  const params = useParams<{ campaignId: string }>();

  // Separate state for email content
  const [localEmailBody, setLocalEmailBody] = useState(body);
  const [localEmailSubject, setLocalEmailSubject] = useState(subject);
  const [localEmailFollowUp, setLocalEmailFollowUp] = useState("");
  const [localEmailFollowUpTwo, setLocalEmailFollowUpTwo] = useState("");

  // Separate state for LinkedIn content
  const [localLinkedInBody, setLocalLinkedInBody] = useState("");
  const [localLinkedInFollowUp, setLocalLinkedInFollowUp] = useState("");
  const [localLinkedInFollowUpTwo, setLocalLinkedInFollowUpTwo] = useState("");

  const [campaignType, setCampaignType] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<string>("");

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailButton1, setEmailButton1] = useState(true);
  const [linkedinButton1, setLinkedinButton1] = useState(true);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [linkedInDialogOpen, setLinkedInDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await axiosInstance.get(`v2/campaigns/${id}`);
          const data = response.data;
          console.log(data, "ress")
          if (response.status === 200) {
            setCampaignType(data.campaign_type);
            setCampaignChannel(data.channel);
          } else {
            toast.error("Failed to fetch campaign data");
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
          toast.error("An error occurred while fetching campaign data");
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await axiosInstance.get(
            `v2/training/${params.campaignId}`
          );
          const data = response.data;

          if (data.detail === "Training information not found") {
            return;
          }

          try {
            // Parse the email template
            if (data.template) {
              const emailTemplateData = JSON.parse(data.template);

              setLocalEmailSubject(emailTemplateData.subject || '');
              setSubject(emailTemplateData.subject || '');
              setLocalEmailBody(emailTemplateData.body || '');
              setBody(emailTemplateData.body || '');

              // Handle follow-ups
              const newEmailFollowUps: FollowUp[] = [];
              Object.entries(emailTemplateData).forEach(([key, value]) => {
                if (key.startsWith('follow_up_template_') && value) {
                  newEmailFollowUps.push({
                    id: Date.now() + Math.random(),
                    value: value as string
                  });
                }
              });
              setEmailFollowUps(newEmailFollowUps);
            }

            // Parse the LinkedIn template
            if (data.linkedin_template) {
              const linkedinTemplateData = JSON.parse(data.linkedin_template);

              setLocalLinkedInBody(linkedinTemplateData.body || '');
              setLinkedinBody(linkedinTemplateData.body || '');

              // Handle LinkedIn follow-ups
              const newLinkedinFollowUps: FollowUp[] = [];
              Object.entries(linkedinTemplateData).forEach(([key, value]) => {
                if (key.startsWith('follow_up_template_') && value) {
                  newLinkedinFollowUps.push({
                    id: Date.now() + Math.random(),
                    value: value as string
                  });
                }
              });
              setLinkedinFollowUps(newLinkedinFollowUps);
            }

          } catch (parseError) {
            console.error("Error parsing template JSON:", parseError);
            toast.error("Error parsing template data");
          }

        } catch (error) {
          console.error("Error fetching campaign:", error);
          toast.error("Failed to fetch campaign data");
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);
  const handleAddEmailFollowUp = () => {
    setEmailFollowUps([...emailFollowUps, { id: Date.now(), value: '' }]);
  };

  const handleRemoveEmailFollowUp = (id: number) => {
    setEmailFollowUps(emailFollowUps.filter((followUp) => followUp.id !== id));
  };
  const handleChangeEmailFollowUp = (id: number, value: string) => {
    setEmailFollowUps(emailFollowUps.map((followUp: FollowUp) =>
      followUp.id === id ? { ...followUp, value } : followUp
    ));
  };

  const handleAddLinkedinFollowUp = () => {
    setLinkedinFollowUps([...linkedinFollowUps, { id: Date.now(), value: '' }]);
  };
  const handleRemoveLinkedinFollowUp = (id: number) => {
    setLinkedinFollowUps(linkedinFollowUps.filter((followUp) => followUp.id !== id));
  };

  const handleChangeLinkedinFollowUp = (id: number, value: string) => {
    setLinkedinFollowUps(linkedinFollowUps.map((followUp) =>
      followUp.id === id ? { ...followUp, value } : followUp
    ));
  };

  const handleTextChange = (text: string, setText: (value: string) => void) => {
    const variablePattern = /[\[\{]([^\]\}]+)[\]\}]/g;
    let match;
    const newVariables: VariableType[] = [];

    while ((match = variablePattern.exec(text)) !== null) {
      let variableName = match[1].trim();
      variableName = variableName.replace(/['"]/g, "");

      let custom = true;
      // if (presetVariables.includes(variableName)) {
      //   custom = false;
      // }

      const newVariable: VariableType = {
        id: Math.random().toString(),
        value: variableName,
        length: "auto",
        isCustom: custom,
      };
      newVariables.push(newVariable);
    }

    const updatedVariables = fieldsList.variables.filter((variable) =>
      newVariables.some((newVar) => newVar.value === variable.value)
    );

    newVariables.forEach((newVar) => {
      if (
        !updatedVariables.some((variable) => variable.value === newVar.value)
      ) {
        updatedVariables.push(newVar);
      }
      setVariableDropdownIsOpen(false);
    });

    setFieldsList({ ...fieldsList, variables: updatedVariables });
    setText(text);
  };

  const handleEmailSubjectChange = (text: string) => {
    setLocalEmailSubject(text);
    setSubject(text);
    handleTextChange(`${text}`, setSubject);
  };

  const handleEmailBodyChange = (text: string, cursorPos?: number) => {
    setLocalEmailBody(text);
    setBody(text);
    handleTextChange(`${text}`, setBody);
    if (cursorPos !== undefined) {
      setCursorPosition(cursorPos);
    }
  };

  const handleEmailFollowUpChange = (text: string) => {
    setLocalEmailFollowUp(text);
    setFollowUp(text);
    handleTextChange(text, setFollowUp);
  };

  const handleEmailFollowUpTwoChange = (text: string) => {
    setLocalEmailFollowUpTwo(text);
    setFollowUpOne(text);
    handleTextChange(text, setFollowUpOne);
  };

  const handleLinkedInBodyChange = (text: string, cursorPos?: number) => {
    setLocalLinkedInBody(text);
    setLinkedinBody(text);
    handleTextChange(`${text}`, setLinkedinBody);
    if (cursorPos !== undefined) {
      setCursorPosition(cursorPos);
    }
  };

  const handleLinkedInFollowUpChange = (text: string) => {
    setLocalLinkedInFollowUp(text);
    setLinkedinFollowUp(text);
    handleTextChange(text, setLinkedinFollowUp);
  };

  const handleLinkedInFollowUpTwoChange = (text: string) => {
    setLocalLinkedInFollowUpTwo(text);
    setLinkedinFollowUpTwo(text);
    handleTextChange(text, setLinkedinFollowUpTwo);
  };

  const handleDropdownSelect = (option: string) => {
    if (cursorPosition === null) return;

    const textarea = textareaRef.current || followUpRef.current;
    if (!textarea) return;

    // Get the text before the cursor position to determine the opening bracket
    const textBeforeCursor = textarea.value.slice(0, cursorPosition);
    const openingBracket = textBeforeCursor.slice(-1); // Last character before cursor

    let variable = "";
    if (openingBracket === "[") {
      variable = `[${option}]`;
    } else if (openingBracket === "{") {
      variable = `{${option}}`;
    } else {
      // Default to square brackets if no valid opening bracket is found
      variable = `[${option}]`;
    }

    let newText = "";
    let setText: (value: string) => void;

    if (focusedField === "subject") {
      newText =
        localEmailSubject.slice(0, cursorPosition - 1) + // Remove the opening bracket
        variable +
        localEmailSubject.slice(cursorPosition);
      setText = setLocalEmailSubject;
      handleEmailSubjectChange(newText);
    } else if (focusedField === "body") {
      newText =
        localEmailBody.slice(0, cursorPosition - 1) + // Remove the opening bracket
        variable +
        localEmailBody.slice(cursorPosition);
      setText = setLocalEmailBody;
      handleEmailBodyChange(newText, cursorPosition - 1 + variable.length);
    } else if (focusedField === "followUp") {
      newText =
        localEmailFollowUp.slice(0, cursorPosition - 1) + // Remove the opening bracket
        variable +
        localEmailFollowUp.slice(cursorPosition);
      setText = setLocalEmailFollowUp;
      handleEmailFollowUpChange(newText);
    }

    setVariableDropdownIsOpen(false);
  };

  const mapFields = (response: any) => {
    const newFieldsList: allFieldsListType = {
      variables: [...fieldsList.variables],
      personalized_fields: [],
      offering_variables: [],
      enriched_fields: [],
    };

    const addFieldsFromCategory = (category: keyof allFieldsListType) => {
      if (response[category] && category !== "variables") {
        Object.keys(response[category]).forEach((key) => {
          const field: FieldType = {
            id: String(Math.random()),
            fieldName: key,
            description: `${response[category][key]}`,
          };
          if (
            category === "personalized_fields" ||
            category === "offering_variables" ||
            category === "enriched_fields"
          ) {
            newFieldsList[category].push(field as FieldType);
          }
        });
      } else {
        if (response.variables && response.variables.length > 0) {
          response.variables.forEach((variable: string) => {
            let custom = true;
            // if (presetVariables.includes(variable)) {
            //   custom = false;
            // }
            const newVariable = {
              id: String(Math.random()),
              length: "auto",
              isCustom: custom,
              value: variable,
            };
            if (
              !fieldsList.variables.some((field) => field.value === variable)
            ) {
              newFieldsList.variables.push(newVariable);
            }
          });
        }
      }
    };

    addFieldsFromCategory("enriched_fields");
    addFieldsFromCategory("personalized_fields");
    addFieldsFromCategory("offering_variables");

    console.log(newFieldsList);
    setFieldsList(newFieldsList);
  };

  const updateDropdownPosition = (cursorPos: number) => {
    const textarea = textareaRef.current || followUpRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const lines = text.substring(0, cursorPos).split("\n");
    const lineNumber = lines.length;
    const charNumber = lines[lines.length - 1].length;

    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    const top = lineNumber * lineHeight + 5 - textarea.scrollTop;
    const left = charNumber * 8; // Approximate character width in pixels

    setDropdownPosition({ top, left });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setVariableDropdownIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("localbodyy ==  " + localEmailBody);
  console.log("body " + body);
  return (
    <div className="w-full">
      {/* Email Section */}
      {(campaignChannel === "mail" || campaignChannel === "omni") && (
        <div className={`${campaignChannel === "omni" ? "w-1/2 float-left pr-4" : "w-full"}`}>
          <div className="flex justify-center px-6 py-4">
            <div className="flex-col w-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-semibold">Email Message</h2>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmailDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Example
                    </Button>
                    <div className="text-xs text-gray-500">
                      *use variables like: [variable_name] or {`{variable_name}`}
                    </div>
                  </div>
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Write an enticing subject"
                      className="flex-1"
                      value={localEmailSubject}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        handleEmailSubjectChange(e.target.value);
                      }}
                      onFocus={() => setFocusedField("subject")}
                    />
                    <CollapsibleTrigger asChild>
                      <Settings className="h-5 w-5 cursor-pointer" />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <SubjectForm />
                  </CollapsibleContent>
                </Collapsible>

                <Textarea
                  placeholder="Write a message"
                  value={localEmailBody}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    handleEmailBodyChange(e.target.value, e.target.selectionStart);
                  }}
                  className="w-full h-[200px]"
                  ref={textareaRef}
                  onFocus={() => setFocusedField("body")}
                />
              </div>

              <FollowUpSection
                type="email"
                followUps={emailFollowUps}
                onAddFollowUp={handleAddEmailFollowUp}
                onRemoveFollowUp={handleRemoveEmailFollowUp}
                onChangeFollowUp={handleChangeEmailFollowUp}
                campaignType={campaignType}
              />
            </div>
          </div>
          <EmailExampleDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
        </div>
      )}

      {(campaignChannel === "Linkedin" || campaignChannel === "omni") && (
        <div className={`${campaignChannel === "omni" ? "w-1/2 float-left pl-4" : "w-full"}`}>
          <div className="flex justify-center px-6 py-4">
            <div className="flex-col w-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-semibold">LinkedIn Message</h2>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLinkedInDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Example
                    </Button>
                    <div className="text-xs text-gray-500">
                      *use variables like: [variable_name] or {`{variable_name}`}
                    </div>
                  </div>
                </div>

                <Textarea
                  placeholder="Write your LinkedIn message"
                  value={localLinkedInBody}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    handleLinkedInBodyChange(e.target.value, e.target.selectionStart);
                  }}
                  className="w-full h-[200px]"
                  ref={textareaRef}
                  onFocus={() => setFocusedField("body")}
                />
              </div>

              <FollowUpSection
                type="linkedin"
                followUps={linkedinFollowUps}
                onAddFollowUp={handleAddLinkedinFollowUp}
                onRemoveFollowUp={handleRemoveLinkedinFollowUp}
                onChangeFollowUp={handleChangeLinkedinFollowUp}
                campaignType={campaignType}
              />
            </div>
          </div>
          <LinkedInExampleDialog open={linkedInDialogOpen} onOpenChange={setLinkedInDialogOpen} />
        </div>
      )}

      <div className="clear-both"></div>
    </div>
  );
}
