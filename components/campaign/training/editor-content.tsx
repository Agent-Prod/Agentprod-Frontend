/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable-next-line padded-blocks */
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Loader, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
import { useUserContext } from "@/context/user-context";

interface Variable {
  id: string;
  value: string;
  length: string;
  isCustom: boolean;
}

export default function EditorContent() {
  const { user } = useUserContext();

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
  } = useFieldsList();
  const params = useParams<{ campaignId: string }>();

  const [localBody, setLocalBody] = useState(body);
  const [localSubject, setLocalSubject] = useState(subject);
  const [localFollowUp, setLocalFollowUp] = useState("");
  const [localFollowUpTwo, setLocalFollowUpTwo] = useState("");
  const [campaignType, setCampaignType] = useState("");

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [examplePopup, setExamplePopup] = useState(false);
  const [button1, setButton1] = useState(true);
  const presetVariables = [
    "first name",
    "last name",
    "current company",
    "current job role",
    "current company location",
    "industry",
  ];

  // useEffect(() => {
  //   const fetchTrainingData = async () => {
  //     try {
  //       const trainingData = await getTraining(params.campaignId);
  //       console.log(trainingData.template);

  //       const parseTemplate = (template: string) => {
  //         const subjectStart =
  //           template.indexOf("Subject: ") + "Subject: ".length;
  //         const subjectEnd = template.indexOf("\n", subjectStart);
  //         const subject = template.substring(subjectStart, subjectEnd).trim();
  //         const bodyStart = template.indexOf("\n", subjectEnd) + 1;
  //         const body = template.substring(bodyStart).trim();
  //         return { subject, body };
  //       };

  //       const splitSections = trainingData.template.split("---");

  //       if (splitSections.length > 1) {
  //         const mainEmail = parseTemplate(splitSections[0]);
  //         const followUpEmail = parseTemplate(splitSections[1]);

  //         setBody(mainEmail.subject);
  //         setSubject(mainEmail.body);
  //         setFollowUp(followUpEmail.body);
  //       } else {
  //         const mainEmail = parseTemplate(trainingData.template);

  //         setLocalSubject(mainEmail.subject);
  //         setLocalBody(mainEmail.body);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch training data:", error);
  //     }
  //   };

  //   fetchTrainingData();
  // }, [params.campaignId]);

  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/campaigns/${id}`
          );

          const data = await response.json();
          console.log(data, "ress")
          if (response.ok) {
            setCampaignType(data.campaign_type);
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
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/training/${params.campaignId}`
          );
          const data = await response.json();
          if (data.detail === "Training information not found") {
          } else {
            const template = data.template;
            const subjectStart =
              template.indexOf("Subject: ") + "Subject: ".length;
            const subjectEnd = template.indexOf("\n", subjectStart);
            const subject = template.slice(subjectStart, subjectEnd).trim();
            const body = template.slice(subjectEnd).trim();

            setLocalSubject(subject);
            setSubject(subject);
            setLocalBody(body);
            setBody(body);

            setFollowUp(data.follow_up_template_1.body);
            setLocalFollowUp(data.follow_up_template_1.body);
            setFollowUpOne(data.follow_up_template_2.body);
            setLocalFollowUpTwo(data.follow_up_template_2.body);
            handleTextChange(body, setBody);
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);

  const toggleFollowUp = () => {
    setShowAdditionalTextArea(!showAdditionalTextArea);
    setButton1(!button1);
  };

  const toggleFollowUpTwo = () => {
    setShowAdditionalTextAreaTwo(!showAdditionalTextAreaTwo);
  };

  const handleTextChange = (text: string, setText: (value: string) => void) => {
    const variablePattern = /[\[\{]([^\]\}]+)[\]\}]/g;
    let match;
    const newVariables: VariableType[] = [];

    while ((match = variablePattern.exec(text)) !== null) {
      let variableName = match[1].trim();
      variableName = variableName.replace(/['"]/g, "");

      let custom = true;
      if (presetVariables.includes(variableName)) {
        custom = false;
      }

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

  const handleSubjectChange = (text: string) => {
    setLocalSubject(text);
    setSubject(text);
    handleTextChange(`${text}`, setSubject);
  };

  const handleBodyChange = (text: string, cursorPos?: number) => {
    setLocalBody(text);
    setBody(text);
    handleTextChange(`${text}`, setBody);
    if (cursorPos !== undefined) {
      setCursorPosition(cursorPos);
    }
  };

  const handleFollowUpChange = (text: string, cursorPos?: number) => {
    setLocalFollowUp(text);
    setFollowUp(text);
    handleTextChange(`${localFollowUp} ${text}`, setFollowUp);
    if (cursorPos !== undefined) {
      setCursorPosition(cursorPos);
    }
  };
  const handleFollowUpChangeTwo = (text: string, cursorPos?: number) => {
    setLocalFollowUpTwo(text);
    setFollowUpOne(text);
    handleTextChange(`${localFollowUp} ${text}`, setFollowUpOne);
    if (cursorPos !== undefined) {
      setCursorPosition(cursorPos);
    }
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
        localSubject.slice(0, cursorPosition - 1) + // Remove the opening bracket
        variable +
        localSubject.slice(cursorPosition);
      setText = setLocalSubject;
      handleSubjectChange(newText);
    } else if (focusedField === "body") {
      newText =
        localBody.slice(0, cursorPosition - 1) + // Remove the opening bracket
        variable +
        localBody.slice(cursorPosition);
      setText = setLocalBody;
      handleBodyChange(newText, cursorPosition - 1 + variable.length);
    } else if (focusedField === "followUp") {
      newText =
        localFollowUp.slice(0, cursorPosition - 1) + // Remove the opening bracket
        variable +
        localFollowUp.slice(cursorPosition);
      setText = setLocalFollowUp;
      handleFollowUpChange(newText);
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
            if (presetVariables.includes(variable)) {
              custom = false;
            }
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

  // const handleAutoGenerateTemplate = async () => {
  //   try {
  //     setTemplateIsLoading(true);
  //     const response = await getAutogenerateTrainingTemplate(params.campaignId);
  //     const followup = await getAutogenerateFollowup(params.campaignId);

  //     console.log(response); // For debugging
  //     console.log("followup", followup);
  //     const newSubject = `${response.subject}`;
  //     const newBody = `${response.body} ${response.closing || ""}`;
  //     const newFollowUp = followup;
  //     console.log("reached here");
  //     setLocalSubject(newSubject);
  //     setLocalBody(newBody);
  //     setLocalFollowUp(`${newFollowUp.subject}\n\n ${newFollowUp.body}`);
  //     setShowAdditionalTextArea(false); //updaated
  //     console.log("setup here here");

  //     setSubject(newSubject);
  //     setBody(newBody);
  //     setFollowUp(newFollowUp);
  //     console.log("response from the variables" + response);
  //     mapFields(response);
  //     setTemplateIsLoading(false);
  //     console.log("end here");
  //   } catch (error: any) {
  //     console.error("Failed to fetch training data:", error);
  //     toast.error(error.message);
  //     setTemplateIsLoading(false);
  //     handleTextChange;
  //   }
  // };

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
    const activeElementRef = textareaRef.current || followUpRef.current;
    if (!activeElementRef) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "[" || event.key === "{") {
        const cursorPos = activeElementRef.selectionStart;
        setCursorPosition(cursorPos);
        setTimeout(() => {
          setVariableDropdownIsOpen(true);
          updateDropdownPosition(cursorPos);
        }, 0);
      }
    };

    activeElementRef.addEventListener("keydown", handleKeyDown);

    return () => {
      activeElementRef.removeEventListener("keydown", handleKeyDown);
    };
  }, [localBody, localSubject, localFollowUp]);

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

  console.log("localbodyy ==  " + localBody);
  console.log("body " + body);
  return (
    <ResizablePanelGroup direction="horizontal" className="">
      <ResizablePanel defaultSize={75}>
        <div className="flex justify-center px-6 py-4">
          <Avatar className="flex h-8 w-8 items-center justify-center space-y-0 border bg-white mr-2">
            <AvatarFallback> {user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-col w-full">
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Write an enticing subject"
                  className="flex-1"
                  value={localSubject}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleSubjectChange(e.target.value);
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
            <div className="relative">
              <Textarea
                placeholder="Write a message"
                value={localBody}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  handleBodyChange(e.target.value, e.target.selectionStart);
                }}
                className="mt-2 w-full h-[200px]"
                ref={textareaRef}
                onFocus={() => setFocusedField("body")}
              />
              <span className="text-xs text-gray-500">
                *use variables like: [variable_name] or {`{variable_name}`}
              </span>
              {variableDropdownIsOpen && (
                <div
                  className="absolute z-10 inline-block text-left mt-1"
                  ref={dropdownRef}
                  style={{
                    top: dropdownPosition ? `${dropdownPosition.top}px` : "0",
                    left: dropdownPosition ? `${dropdownPosition.left}px` : "0",
                  }}
                >
                  <ScrollArea className="w-56 h-[200px] rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                      onClick={() => setVariableDropdownIsOpen(false)}
                    >
                      {presetVariables.map((option) => (
                        <button
                          key={option}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDropdownSelect(option);
                          }}
                          className="text-white block px-4 py-2 text-sm w-full text-left hover"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {showAdditionalTextArea && (
              <div className="relative">
                <button
                  className="absolute top-2 right-2 bg-transparent text-xl font-semibold leading-none focus:outline-none"
                  onClick={toggleFollowUp}
                >
                  &times;
                </button>
                <Textarea
                  placeholder="Write a follow-up"
                  value={localFollowUp}
                  ref={followUpRef}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    handleFollowUpChange(
                      e.target.value,
                      e.target.selectionStart
                    );
                  }}
                  className="mt-2 w-full h-[200px]"
                  onFocus={() => setFocusedField("followUp")}
                />
              </div>
            )}

            {showAdditionalTextAreaTwo && (
              <div className="relative">
                <button
                  className="absolute top-2 right-2 bg-transparent text-xl font-semibold leading-none focus:outline-none"
                  onClick={toggleFollowUpTwo}
                >
                  &times;
                </button>
                <Textarea
                  placeholder="Write a follow-up Two"
                  value={localFollowUpTwo}
                  ref={followUpRef}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    handleFollowUpChangeTwo(
                      e.target.value,
                      e.target.selectionStart
                    );
                  }}
                  className="mt-2 w-full h-[200px]"
                  onFocus={() => setFocusedField("followUp")}
                />
              </div>
            )}
            <div className="mt-4 flex flex-row gap-4">
              {campaignType && campaignType !== "Nurturing" && (
                <>
                  {!showAdditionalTextArea && (
                    <Button variant="outline" onClick={toggleFollowUp}>
                      <Plus className="h-3 w-3 text-gray-400" />
                      Add follow-up
                    </Button>
                  )}{" "}
                  {!button1 && !showAdditionalTextAreaTwo && (
                    <Button variant="outline" onClick={toggleFollowUpTwo}>
                      <Plus className="h-3 w-3 text-gray-400" />
                      Add follow-up
                    </Button>
                  )}
                </>
              )}
              <Button
                variant={"outline"}
                onClick={() => {
                  setExamplePopup(!examplePopup);
                }}
              >
                <span className="ml-2">Example Email</span>
              </Button>
            </div>
            {examplePopup && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
                <div className="w-1/2 h-4/5 overflow-y-scroll flex flex-col space-y-3 p-6 bg-black border rounded-lg">
                  <div className="flex justify-between items-center sticky -top-6 py-4 bg-black z-10">
                    <div className="text-xl font-semibold text-white">
                      Example sequence
                    </div>
                    <div>
                      <X
                        className="cursor-pointer"
                        onClick={() => {
                          setExamplePopup(!examplePopup);
                        }}
                      />
                    </div>
                  </div>
                  <div className="font-semibold text-white">
                    Reference Template
                  </div>
                  <div className="font-semibold text-base text-white">
                    Subject:{" "}
                    <span className="font-normal text-white/40">
                      Connecting with{" "}
                      <b className="text-white/60">
                        {"{"}recievers company{"} "}
                      </b>
                      founders
                    </span>
                  </div>
                  <div className="flex space-x-5 py-4">
                    <div className="w-3 h-full bg-white/20"></div>
                    <div className="text-white/40 space-y-2 text-sm">
                      <div>
                        Hi{" "}
                        <b className="text-white/60">
                          {"{"}lead name{"}"}
                        </b>
                        ,
                      </div>
                      <div>
                        I came across{" "}
                        <b className="text-white/60">
                          {"{"}company name{"} "}
                        </b>
                        and saw that you’re selling{" "}
                        <b className="text-white/60">
                          {"{"}
                          company offering{"} "}
                        </b>
                        . I’d like to introduce you to AgentProd, an AI sales
                        automation platform that can help scale your sales
                        efficiently.
                      </div>
                      <div>
                        I’m the co-founder of AgentProd. We’re helping some of
                        the fastest growing startups in{" "}
                        <b className="text-white/60">
                          {" "}
                          {"{"}company location
                          {"} "}
                        </b>
                        to automate their sales processes with our GPT-based
                        platform.{" "}
                        <b className="text-white/60">
                          {"{"} if sender location is same as company location
                          say "We should meet and discuss about your product
                          sales and it's growth in person" other wise say
                          nothing {"}"}.
                        </b>
                        We’re currently in private beta, but I thought you might
                        be interested in giving AgentProd a try.{" "}
                        <b className="text-white/60">
                          {"{"} if is funded company say "It's great to see that
                          you are a funded company!" other wise say "It's great
                          to see your interest and efforts!"{"} "}
                        </b>
                        I’m happy to prioritize you.
                      </div>
                      <div>Cheers,</div>
                      <div>
                        <b className="text-white/60">
                          {"{"}sender name{"}"}
                        </b>
                      </div>
                      <div>
                        <b className="text-white/60">
                          {"{"}phone no{"}"}
                        </b>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    Follow-up Template 1
                  </div>
                  <div className="flex space-x-5 py-4">
                    <div className="w-3 h-full bg-white/20"></div>
                    <div className="text-white/40 space-y-2 text-sm">
                      Hi{" "}
                      <b className="text-white/60">
                        {"{"}lead name{"}"}
                      </b>
                      , just bumping this up since I haven’t heard back from you
                      yet. Other companies using our platform have already seen
                      a significant increase in their sales. I’d be happy to
                      jump on a call and discuss how AgentProd can benefit your
                      company.
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    Follow-up Template 2
                  </div>
                  <div className="flex space-x-5 py-4">
                    <div className="w-3 h-full bg-white/20"></div>
                    <div className="text-white/40 space-y-4 text-sm">
                      Hi{" "}
                      <b className="text-white/60">
                        {"{"}lead name{"}"}
                      </b>
                      , since I haven’t heard back from you yet, I assume our
                      platform may not be relevant to you at this point. If
                      there’s someone else in your team who might be the right
                      point of contact, please connect me. Sorry if I bothered
                      you, and I wish you all the best!
                    </div>
                  </div>
                  <hr />
                  <div className="font-semibold text-xl text-white">
                    Reference Email
                  </div>
                  <div className="font-semibold text-base text-white">
                    Subject:{" "}
                    <span className="font-normal text-white/40">
                      Connecting with GenAi founders
                    </span>
                  </div>
                  <div className="flex space-x-5 py-4">
                    <div className="w-3 h-full bg-white/20"></div>
                    <div className="text-white/40 space-y-2 text-sm">
                      <div>
                        Hi Alex, I came across Koxa and saw that you’re selling
                        an accounting-to-banking API. I’d like to introduce you
                        to AgentProd, an AI sales automation platform that can
                        help scale your sales efficiently.
                      </div>
                      <div>
                        I’m the co-founder of AgentProd. We’re helping some of
                        the fastest growing startups in Silicon Valley to
                        automate their sales processes with our GPT-based
                        platform. We should meet and discuss about your product
                        sales and it's growth in person. We’re currently in
                        private beta, but I thought you might be interested in
                        giving AgentProd a try. It's great to see that you are a
                        funded company! I’m happy to prioritize you.
                      </div>
                      <div>
                        Cheers, <div>Muskaan</div>
                        <div>+1-555-555-5555</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    Follow-up 1
                  </div>
                  <div className="flex space-x-5 py-4">
                    <div className="w-3 h-full bg-white/20"></div>
                    <div className="text-white/40 space-y-4 text-sm">
                      Hi Alex, just bumping this up since I haven’t heard back
                      from you yet. Other API-first companies like Svix have
                      already seen a significant increase in their sales through
                      us. I’d be happy to jump on a call and discuss how
                      AgentProd can benefit your company.
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    Follow-up 2
                  </div>
                  <div className="flex space-x-5 py-4">
                    <div className="w-3 h-full bg-white/20"></div>
                    <div className="text-white/40 space-y-4 text-sm">
                      Hi Alex, since I haven’t heard back from you yet, I assume
                      automating sales with AI is not relevant to you at this
                      point. If there’s someone else in your team who might be
                      the right point of contact, please connect me. Sorry if I
                      bothered you, and wish you all the best!
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <FieldList />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
