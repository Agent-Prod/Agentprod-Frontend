"use client";
import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Info, Plus, Sparkles, Trash } from "lucide-react";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

function Qualification() {
  const router = useRouter();

  const [criteria, setCriteria] = useState<any>([]);
  const params = useParams<{ campaignId: string }>();
  const [type, setType] = useState<"create" | "edit">("create");
  const [qua_id, setQua_Id] = useState<any>("");
  useEffect(() => {
    const fetchCampaign = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/qualifications/${params.campaignId}`
          );
          const data = await response.json();
          if (data.detail === "Qualification not found") {
            setType("create");
          } else {
            setCriteria(data.details);
            setType("edit");
            setQua_Id(data.id);
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
        }
      }
    };

    fetchCampaign();
  }, [params.campaignId]);
  const addCriteria = () => {
    setCriteria([
      ...criteria,
      { question: "", type: "yes/no", answer: "yes" },
    ]);
  };

  const updateCriteria = (index: number, updatedCriterion: any) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index] = updatedCriterion;
    setCriteria(updatedCriteria);
  };

  async function submitButton() {
    try {
      if (type === "create") {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}v2/qualifications/`,
          { campaign_id: params.campaignId, details: criteria }
        );
        toast.success("Qualification added successfully");
      } else if (type === "edit") {
        await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URL}v2/qualifications/${qua_id}`,
          { details: criteria }
        );
        toast.success("Qualification updated successfully");
      }
      router.push(`/dashboard/campaign/${params.campaignId}`);
    } catch (error) {
      toast.error("Error submitting qualification");
      console.error("Error submitting qualification:", error);
    }
  }

  return (
    <div>
      <Card className="text-xl flex justify-between py-4 items-center px-5">
        <div className="pl-10 ">Qualification</div>
        <Button onClick={submitButton}>
          {type === "create" ? "Start Qualification" : "Edit Qualification"}
        </Button>
      </Card>
      <div className="mt-10 ml-14">
        <Card className=" py-2 dark:text-white/50 light:text-black/20 max-w-4xl">
          <div className="pl-4 flex items-center">
            <Info className="mr-3" width={20} height={20} />
            Contact and company are enriched
          </div>
        </Card>

        {criteria.map((criterion: any, index: number) => (
          <TextInput
            key={index}
            criterion={criterion}
            onUpdate={(updatedCriterion: any) =>
              updateCriteria(index, updatedCriterion)
            }
            // onDelete={() => deleteCriterion(index)}
          />
        ))}

        <div className="my-3">
          <Button
            className="bg-transparent hover:bg-black hover:text-white text-black dark:text-white border dark:border-white dark:hover:bg-white dark:hover:text-black"
            onClick={addCriteria}
          >
            <Plus width={17} height={17} className="mr-2" /> Add qualification
            criteria
          </Button>
        </div>
      </div>
    </div>
  );
}

function TextInput({ criterion, onUpdate }: any) {
  const [localCriterion, setLocalCriterion] = useState({
    ...criterion,
    answer: criterion.answer || "yes"
  });

  const handleUpdate = () => {
    onUpdate(localCriterion);
  };

  return (
    <div className="my-5 flex items-center max-w-4xl">
      <span className="font-semibold">AND</span>
      <div className="relative ml-4 flex items-center dark:bg-[#1F1F1F] rounded w-full">
        <Sparkles
          className="absolute left-4 text-gray-400"
          width={19}
          height={19}
        />

        <Dialog>
          <DialogTrigger className="w-full">
            <Input
              className="pl-10 bg-transparent w-full dark:text-white/70 placeholder:dark:text-white/20 cursor-default "
              placeholder={`Filter Question: Ask a yes-no question, such as "Is this company remote work friendly?"`}
              value={localCriterion.question}
              onChange={(e) =>
                setLocalCriterion({
                  ...localCriterion,
                  question: e.target.value,
                })
              }
            />
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-start">
                Qualification question
              </DialogTitle>
              <DialogDescription className="">
                <div className="mt-4">
                  <Input
                    className="bg-transparent w-full dark:text-white/70 placeholder:dark:text-white/20"
                    value={localCriterion.question}
                    placeholder={`Ask a qualification question`}
                    onChange={(e) =>
                      setLocalCriterion({
                        ...localCriterion,
                        question: e.target.value,
                      })
                    }
                  />

                  <div className="text-start mt-6">
                    What type of Qualification Question is this
                  </div>

                  <RadioGroup
                    className="my-3"
                    value={localCriterion.type || "yes/no"}
                    defaultValue="yes/no"
                    onValueChange={(value) =>
                      setLocalCriterion({ 
                        ...localCriterion, 
                        type: value,
                        answer: value === "research" ? null : localCriterion.answer 
                      })
                    }
                  >
                    <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes/no" id="option-one" />
                      <Label htmlFor="option-one">Decision Based (Yes/No)</Label>
                    </div>
                    <div className="ml-6 dark:text-white/40 text-start">
                        Ask a yes-no question to qualify a lead to add them to the
                        campaign
                      </div>
                      {localCriterion.type === "yes/no" && (
                        <div className="ml-6 -mt-5">
                      <div className="text-start mt-6">
                        Add to Campaign if answer is..
                      </div>

                      <RadioGroup
                        className="my-3"
                        value={localCriterion.answer || "yes"}
                        defaultValue="yes"
                        onValueChange={(value) =>
                          setLocalCriterion({ ...localCriterion, answer: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="option-one" />
                          <Label htmlFor="option-one">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="option-two" />
                          <Label htmlFor="option-two">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  </Card>
                  <Card className="p-4">

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="research" id="option-two" />
                      <Label htmlFor="option-two">Research</Label>
                    </div>
                    <div className="ml-6 dark:text-white/40 text-start">
                      Ask a research based question to know more about the lead
                    </div>
                  </Card>
                  </RadioGroup>


                  <DialogClose asChild>
                    <Button className="my-1 mt-6" onClick={handleUpdate}>
                      Save qualification
                    </Button>
                  </DialogClose>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {/* <Trash className="ml-3 cursor-pointer" onClick={onDelete} /> */}
    </div>
  );
}

export default Qualification;
