"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCampaignContext,
} from "@/context/campaign-provider";
import {
  getPersonaByUserId,
  createPersona,
  getPersonaByCampaignId,
  editPersona,
} from "./camapign.api";
import { useUserContext } from "@/context/user-context";
import { CompanyProfile } from "@/components/campaign/company-profile";
import { toast } from "sonner";
import { Label } from "../ui/label";
import axiosInstance from "@/utils/axiosInstance";
import { useButtonStatus } from "@/context/button-status";
import { LoadingCircle } from "@/app/icons";

const profileFormSchema = z.object({
  product_offering: z.string(),
  pain_point: z.array(z.string()),
  values: z.array(z.string()),
  customer_success_stories: z.array(z.string()),
  detailed_product_description: z.string(),
  company_features: z.array(z.string()),
});

type OfferingFormValues = z.infer<typeof profileFormSchema>;

export function OfferingForm() {
  const params = useParams<{ campaignId: string }>();
  const { user } = useUserContext();
  const { createOffering, editOffering } = useCampaignContext();
  const [isUploading, setIsUploading] = useState(false);
  const { setPageCompletion } = useButtonStatus();
  const [type, setType] = useState<"create" | "edit">("create");
  const [campaignType, setCampaignType] = useState("");
  const [offeringId, setOfferingId] = useState<string | null>(null);

  const form = useForm<OfferingFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      product_offering: "",
      pain_point: [""],
      values: [""],
      customer_success_stories: [""],
      detailed_product_description: "",
      company_features: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchCampaignAndOffering = async () => {
      const id = params.campaignId;
      if (id) {
        try {
          const campaignResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/campaigns/${id}`
          );
          const campaignData = await campaignResponse.json();

          if (campaignResponse.ok) {
            setCampaignType(campaignData.campaign_type);

            const offeringResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_URL}v2/offerings/${id}`
            );
            const offeringData = await offeringResponse.json();

            if (offeringData.detail === "Offering not found") {
              setType("create");
            } else {
              setType("edit");
              setOfferingId(offeringData.id);
            }

            // Fetch persona data
            const persona = await getPersonaByCampaignId(id);
            if (persona) {
              form.reset({
                product_offering: offeringData.name || "",
                pain_point: persona.pain_point,
                values: persona.values,
                customer_success_stories: persona.customer_success_stories || [
                  "",
                ],
                detailed_product_description:
                  persona.detailed_product_description,
                company_features: persona.company_features || [],
              });
            } else {
              const userPersona = await getPersonaByUserId(user.id);
              if (userPersona) {
                form.reset({
                  product_offering: offeringData.name || "",
                  pain_point: userPersona.pain_point,
                  values: userPersona.values,
                  customer_success_stories:
                    userPersona.customer_success_stories || [""],
                  detailed_product_description:
                    userPersona.detailed_product_description,
                  company_features: userPersona.company_features || [],
                });
              }
            }
          } else {
            toast.error("Failed to fetch campaign data");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("An error occurred while fetching data");
        }
      }
    };

    fetchCampaignAndOffering();
  }, [params.campaignId, user.id, form]);

  const onSubmit = async (data: OfferingFormValues) => {
    let offeringData;

    if (campaignType === "Nurturing") {
      const featuresString = data.company_features.join(", ");
      const combinedString = `${data.product_offering} --- ${featuresString}`;
      offeringData = {
        name: data.product_offering,
        details: combinedString,
      };
    } else {
      offeringData = {
        name: data.product_offering,
        details: data.detailed_product_description,
      };
    }

    const postData = {
      user_id: user?.id,
      campaign_id: params.campaignId,
      pain_point: data.pain_point,
      values: data.values,
      customer_success_stories: data.customer_success_stories,
      detailed_product_description: data.detailed_product_description,
      company_features: data.company_features,
    };

    try {
      if (type === "create") {
        await createPersona(postData);
        await createOffering(offeringData, params.campaignId);
        toast.success("Offering created successfully.");
      } else {
        await editPersona(postData);
        await editOffering(offeringData, offeringId!);
        toast.success("Offering updated successfully.");
      }

      setPageCompletion("offering", true);
      const updatedFormsTracker = {
        schedulingBudget: true,
        offering: true,
        goal: true,
      };
      localStorage.setItem("formsTracker", JSON.stringify(updatedFormsTracker));
    } catch (error) {
      console.error("Error handling offering:", error);
      toast.error("Failed to handle offering.");
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setIsUploading(true);
      const payload = new FormData();
      payload.append("file", selectedFile, selectedFile.name);
      payload.append("campaign_id", params.campaignId);

      try {
        const response = await axiosInstance.post("/v2/upload-pdf/", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 200) {
          toast.success("PDF uploaded successfully.");
        } else {
          toast.error("Failed to upload PDF.");
        }
      } catch (error) {
        console.error("Error uploading PDF:", error);
        toast.error("Error uploading PDF.");
      } finally {
        setIsUploading(false);
      }
    } else {
      toast.error("Please select a PDF file.");
    }
  };

  const handleCompanyProfileChange = (
    newValue: any[],
    fieldName: keyof OfferingFormValues
  ) => {
    const updatedValue = newValue[0].items || [];
    form.setValue(fieldName, updatedValue, { shouldValidate: false });
  };

  const isFormValid = () => {
    const values = form.getValues();

    if (campaignType === "Nurturing") {
      return values.product_offering && values.company_features.length > 0;
    }

    return (
      values.product_offering &&
      values.detailed_product_description &&
      values.pain_point.length > 0 &&
      values.values.length > 0 &&
      values.customer_success_stories.length > 0
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="product_offering"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {campaignType === "Nurturing"
                  ? "Campaign Offering"
                  : "Product Offering"}
              </FormLabel>
              <FormControl>
                <Input placeholder="Product" {...field} />
              </FormControl>
              <FormDescription>This is your product name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {campaignType !== "Nurturing" ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-4">
              Company Profile
            </h1>
            <FormField
              control={form.control}
              name="detailed_product_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="h-40"
                      placeholder="Detailed description of the product"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of your product here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pain_point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pain Points</FormLabel>
                  <FormControl>
                    <CompanyProfile
                      value={[
                        {
                          label: "Pain Points",
                          items: field.value,
                          actionLabel: "Pain Point",
                        },
                      ]}
                      onChange={(newValue) =>
                        handleCompanyProfileChange(newValue, "pain_point")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="values"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Values</FormLabel>
                  <FormControl>
                    <CompanyProfile
                      value={[
                        {
                          label: "Values",
                          items: field.value,
                          actionLabel: "Value",
                        },
                      ]}
                      onChange={(newValue) =>
                        handleCompanyProfileChange(newValue, "values")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_success_stories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Proof</FormLabel>
                  <FormControl>
                    <CompanyProfile
                      value={[
                        {
                          label: "Social Proof",
                          items: field.value,
                          actionLabel: "Success Story",
                        },
                      ]}
                      onChange={(newValue) =>
                        handleCompanyProfileChange(
                          newValue,
                          "customer_success_stories"
                        )
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-10 ">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Add your sales knowledge</Label>
                <div className="flex gap-2 flex-col">
                  <Input
                    id="picture"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />

                  {isUploading && (
                    <div className="flex items-center gap-2">
                      <LoadingCircle />
                      <span className="text-sm text-gray-500">
                        Uploading PDF, please wait...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <FormField
            control={form.control}
            name="company_features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Feature</FormLabel>
                <FormControl>
                  <CompanyProfile
                    value={[
                      {
                        label: "",
                        items: field.value,
                        actionLabel: "Feature",
                      },
                    ]}
                    onChange={(newValue) =>
                      handleCompanyProfileChange(newValue, "company_features")
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col gap-10 ">
          <Button
            type="submit"
            className="cursor-pointer w-32"
            disabled={type === "create" && !isFormValid()}
          >
            {type === "create" ? "Create Offer" : "Update Offer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
