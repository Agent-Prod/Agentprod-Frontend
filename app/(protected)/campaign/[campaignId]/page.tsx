"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const defaultFormsTracker = {
  schedulingBudget: true,
  offering: false,
  goal: false,
  audience: false,
  training: false,
  autoPilot: false,
  qualification: false,
};
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const params = useParams();
  const [isCampaignFound, setIsCampaignFound] = useState<boolean | null>(null);
  const [formsTracker, setFormsTracker] = useState(defaultFormsTracker);

  useEffect(() => {
    // Initialize forms tracker if not present
    if (!localStorage.getItem("formsTracker")) {
      localStorage.setItem("formsTracker", JSON.stringify(defaultFormsTracker));
    }

    const handleStorageChange = (): void => {
      const updatedFormsTracker = JSON.parse(
        localStorage.getItem("formsTracker") || "{}"
      );
      setFormsTracker((prevFormsTracker) => ({
        ...prevFormsTracker,
        ...updatedFormsTracker,
      }));
    };

    // Check forms tracker on component mount
    handleStorageChange();

    window.addEventListener("storage", handleStorageChange);
    return (): void => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [params.campaignId]);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const [
          campaignResponse,
          goalResponse,
          offeringResponse,
          audienceResponse,
          AutopilotResponse,
          qualificationResponse,
        ] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/campaigns/${params.campaignId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/goals/${params.campaignId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/offerings/${params.campaignId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/lead/campaign/${params.campaignId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/autopilot/${params.campaignId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/qualifications/${params.campaignId}`
          ),
        ]);

        const campaignData = await campaignResponse.json();
        const goalData = await goalResponse.json();
        const offeringData = await offeringResponse.json();
        const audienceData = await audienceResponse.json();
        const AutopilotData = await AutopilotResponse.json();
        const qualificationData = await qualificationResponse.json();

        if (
          campaignData.detail === "Campaign not found" &&
          goalData.detail === "Goal not found" &&
          offeringData.detail === "Offering not found" &&
          audienceData.detail === "No Contacts found" &&
          AutopilotData === null &&
          qualificationData.detail === "Qualification not found"
        ) {
          setIsCampaignFound(false);
        } else {
          setIsCampaignFound(true);
          const updatedFormsTracker = {
            schedulingBudget: true,
            offering: campaignData.detail !== "Campaign not found",
            goal: offeringData.detail !== "Offering not found",
            qualification: goalData.detail !== "Goal not found",
            audience: qualificationData.detail !== "Qualification not found",
            autoPilot: audienceData.detail !== "No Contacts found",
            training: AutopilotData !== null,
          };
          localStorage.setItem(
            "formsTracker",
            JSON.stringify(updatedFormsTracker)
          );
          setFormsTracker((prevFormsTracker) => ({
            ...prevFormsTracker,
            ...updatedFormsTracker,
          }));
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setIsCampaignFound(false);
      }
    }

    fetchCampaign();
  }, [params.campaignId]);

  const isSchedulingBudgetDisabled = !formsTracker.schedulingBudget;
  const isOfferingDisabled = !formsTracker.offering;
  const isGoalDisabled = !formsTracker.goal;
  const isAudienceDisabled = !formsTracker.audience;
  const isTrainingDisabled = !formsTracker.training;
  const isAutoPilotDisabled = !formsTracker.autoPilot;
  const qualification = !formsTracker.qualification;

  return (
    <div>
      {isCampaignFound === null ? (
        <div className="flex justify-center flex-col space-y-4">
          <Skeleton className="h-[90px] w-[98%] rounded-xl " />
          <Skeleton className="h-[90px] w-[98%] rounded-xl " />
          <Skeleton className="h-[90px] w-[98%] rounded-xl " />
          <Skeleton className="h-[90px] w-[98%] rounded-xl " />
          <Skeleton className="h-[90px] w-[98%] rounded-xl " />
          <Skeleton className="h-[90px] w-[98%] rounded-xl " />
          <Skeleton className="h-[90px] w-[98%] rounded-xl " />
        </div>
      ) : (
        <>
          <Card className="w-[95%] min-w-[330px] m-2 flex justify-between">
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
              <CardDescription>
                How do you want to schedule this campaign?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex py-0 justify-between">
              <Button
                asChild
                variant={"outline"}
                disabled={isSchedulingBudgetDisabled}
                className=""
              >
                <Link
                  href={
                    isSchedulingBudgetDisabled
                      ? "#"
                      : `${params.campaignId}/scheduling`
                  }
                >
                  {isCampaignFound === false ? "Add" : "Edit"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`w-[95%] min-w-[330px] m-2 flex justify-between ${
              isOfferingDisabled ? "bg-gray-100/10 cursor-not-allowed" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>Offering</CardTitle>
              <CardDescription>
                What are your products and services?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex py-0 justify-between">
              <Button
                asChild
                variant={"outline"}
                disabled={isOfferingDisabled}
                className={
                  isOfferingDisabled ? "text-gray-400 cursor-not-allowed" : ""
                }
              >
                <Link
                  href={
                    isOfferingDisabled ? "#" : `${params.campaignId}/offering`
                  }
                >
                  {isOfferingDisabled === true ? "Add" : "Edit"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`w-[95%] min-w-[330px] m-2 flex justify-between ${
              isGoalDisabled ? "bg-gray-100/10 cursor-not-allowed" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>Goal</CardTitle>
              <CardDescription>
                What do you want to achieve with this campaign?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex py-0 justify-between">
              <Button
                asChild
                variant={"outline"}
                disabled={isGoalDisabled}
                className={
                  isGoalDisabled ? "text-gray-400 cursor-not-allowed" : ""
                }
              >
                <Link href={isGoalDisabled ? "#" : `${params.campaignId}/goal`}>
                  {isGoalDisabled === true ? "Add" : "Edit"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`w-[95%] min-w-[330px] m-2 flex justify-between ${
              qualification ? "bg-gray-100/10 cursor-not-allowed" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>Qualification</CardTitle>
              <CardDescription>
                How do you qualify your prospects
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex py-0 justify-between">
              <Button
                asChild
                variant={"outline"}
                disabled={qualification}
                className={
                  qualification ? "text-gray-400 cursor-not-allowed" : ""
                }
              >
                <Link
                  href={
                    qualification ? "#" : `${params.campaignId}/qualification`
                  }
                >
                  {qualification === true ? "Add" : "Edit"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`w-[95%] min-w-[330px] m-2 flex justify-between ${
              isAudienceDisabled ? "bg-gray-100/10 cursor-not-allowed" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>Audience</CardTitle>
              <CardDescription>Who do you want to reach?</CardDescription>
            </CardHeader>
            <CardFooter className="flex py-0 justify-between">
              <Button
                asChild
                variant={"outline"}
                disabled={isAudienceDisabled}
                className={
                  isAudienceDisabled ? "text-gray-400 cursor-not-allowed" : ""
                }
              >
                <Link
                  href={
                    isAudienceDisabled ? "#" : `${params.campaignId}/audience`
                  }
                >
                  {isAudienceDisabled === true ? "Add" : "Edit"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`w-[95%] min-w-[330px] m-2 flex justify-between ${
              isAutoPilotDisabled ? "bg-gray-100/10 cursor-not-allowed" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>Autopilot</CardTitle>
              <CardDescription>
                How do you want to automate this campaign?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex py-0 justify-between">
              <Button
                asChild
                variant={"outline"}
                disabled={isAutoPilotDisabled}
                className={
                  isAutoPilotDisabled ? "text-gray-400 cursor-not-allowed" : ""
                }
              >
                <Link
                  href={
                    isAutoPilotDisabled ? "#" : `${params.campaignId}/autopilot`
                  }
                >
                  {isAutoPilotDisabled === true ? "Add" : "Edit"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`w-[95%] min-w-[330px] m-2 flex justify-between ${
              isTrainingDisabled ? "bg-gray-100/10 cursor-not-allowed" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>Training</CardTitle>
              <CardDescription>
                What messages do you want to send?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex py-0 justify-between">
              <Button
                asChild
                variant={"outline"}
                disabled={isTrainingDisabled}
                className={
                  isTrainingDisabled ? "text-gray-400 cursor-not-allowed" : ""
                }
              >
                <Link
                  href={
                    isTrainingDisabled ? "#" : `${params.campaignId}/training`
                  }
                >
                  {isTrainingDisabled === true ? "Add" : "Edit"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
