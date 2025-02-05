/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HubSpotIcon,
  LinkedInIcon,
  LoadingCircle,
  SalesForceIcon,
  SlackIcon,
  ZapierIcon,
} from "@/app/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "../../../../public/bw-logo.png";
import { ArrowLeftRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
// import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { hubspotLogin, salesforceLogin, slackLogin } from ".";
import axiosInstance from "@/utils/axiosInstance";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArkoseCaptchaIntegration } from "./ArkoseCaptchaIntegration";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/context/auth-provider";

const FormSchema = z.object({
  type: z.enum(["all", "engaged"], {
    required_error: "You need to select a notification type.",
  }),
});

interface EmailData {
  id: number;
  mailbox: string;
  // Add other fields if needed
}

export default function Page() {
  const [isHubspotMailboxOpen, setIsHubspotMailboxOpen] = React.useState(false);
  const [isConnectedToHubspot, setIsConnectedToHubspot] = React.useState(false);
  const [isLinkedInMailboxOpen, setIsLinkedInMailboxOpen] = React.useState(false);
  const [linkedInEmail, setLinkedInEmail] = React.useState('');
  const [linkedInPassword, setLinkedInPassword] = React.useState('');
  const [isSalesforceMailboxOpen, setIsSalesforceMailboxOpen] =
    React.useState(false);
  const [isConnectedToSalesforce, setIsConnectedToSalesforce] =
    React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [selectedHubspotLeadType, setSelectedHubspotLeadType] =
    React.useState("all");
  const { user } = useAuth();
  const [linkedInName, setLinkedInName] = React.useState('');
  const [linkedInDesignation, setLinkedInDesignation] = React.useState('');
  const [linkedInCountry, setLinkedInCountry] = React.useState('');
  const [linkedInUrl, setLinkedInUrl] = React.useState('');
  const [linkedInStep, setLinkedInStep] = React.useState(1);
  const [captchaToken, setCaptchaToken] = React.useState('');
  const [captchaPublicKey, setCaptchaPublicKey] = React.useState('');
  const [captchaData, setCaptchaData] = React.useState('');
  const [captchaAccountId, setCaptchaAccountId] = React.useState('');
  const [isCaptchaSolved, setIsCaptchaSolved] = React.useState(false);
  const [showCaptchaButton, setShowCaptchaButton] = React.useState(true);
  const [captchaLoaded, setCaptchaLoaded] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');
  const [connectedAccounts, setConnectedAccounts] = React.useState('');
  const [emails, setEmails] = React.useState<EmailData[]>([]);
  const [selectedEmail, setSelectedEmail] = React.useState('');
  const [selectedAccountType, setSelectedAccountType] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const updateHubspotLeadType = async () => {
    setLoading(true);
    const payload = {
      user_id: user?.id,
    };
    console.log("Payload:", payload);
    try {
      const response = await axiosInstance.post("v2/hubspot/export", payload);
      console.log("HubSpot Lead Type Updated:", response.data);
      setLoading(false);
      toast.success("HubSpot lead type updated successfully");
      setIsHubspotMailboxOpen(false);
    } catch (error) {
      console.error("Failed to update HubSpot lead type:", error);
      throw error;
    }
  };

  const updateSaleforceLeadType = async () => {
    setLoading(true);
    const payload = {
      user_id: user?.id,
    };
    console.log("Payload:", payload);
    try {
      const response = await axiosInstance.post(
        "v2/salesforce/export",
        payload
      );
      console.log("Salesforce Lead Type Updated:", response.data);
      setLoading(false);
      toast.success("Salesforce lead type updated successfully");
      setIsSalesforceMailboxOpen(false);
    } catch (error) {
      console.error("Failed to update Salesforce lead type:", error);
      throw error;
    }
  };

  // closing dialogbox
  const handleCloseHubspotMailbox = () => setIsHubspotMailboxOpen(false);
  const handleCloseSalesforceMailbox = () => setIsSalesforceMailboxOpen(false);
  // closing dialogbox

  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      const response = await axiosInstance.get(`v2/linkedin/active-account/`);
      setConnectedAccounts(response.data.total_count);
    };
    fetchConnectedAccounts();
  }, []);

  React.useEffect(() => {
    const fetchHubSpotStatus = async (): Promise<any> => {
      try {
        const response = await axiosInstance.post(`v2/hubspot/status/`, {
          user_id: user?.id,
          platform: "hubspot",
        });
        setIsConnectedToHubspot(response.data.message);
      } catch (error) {
        console.error("Failed to fetch HubSpot status:", error);
        throw error;
      }
    };

    const fetchSalesforceStatus = async (): Promise<any> => {
      try {
        const response = await axiosInstance.post(`v2/hubspot/status/`, {
          user_id: user?.id,
          platform: "salesforce",
        });
        setIsConnectedToSalesforce(response.data.message);
      } catch (error) {
        console.error("Failed to fetch salesforce status:", error);
        throw error;
      }
    };

    fetchSalesforceStatus();
    fetchHubSpotStatus();
  }, []);

  const handleHubspotConnect = async () => {
    if (isConnectedToHubspot) {
      setIsHubspotMailboxOpen(true);
    } else {
      hubspotLogin(user?.id);
    }
  };

  const handleSalesforceConnect = async () => {
    if (isConnectedToSalesforce) {
      setIsSalesforceMailboxOpen(true);
    } else {
      salesforceLogin(user?.id);
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const fetchConnectedAccounts = async () => {
    const response = await axiosInstance.get(`v2/linkedin/active-account/`);
    setConnectedAccounts(response.data.total_count);
  };

  const handleLinkedInConnect = async () => {
    setIsLoading(true);
    try {
      const payload = {
        user_id: user?.id,
        linkedin_url: linkedInUrl,
        username: linkedInEmail,
        password: linkedInPassword,
        name: linkedInName,
        designation: linkedInDesignation,
        country: linkedInCountry,
        email: selectedEmail,
        account_type: selectedAccountType
      };

      const response = await axiosInstance.post('/v2/linkedin/login', payload);

      if (response.status === 200) {
        if (response.data.object === "AccountCreated") {
          // Account created directly without CAPTCHA
          toast.success("LinkedIn account connected successfully!");
          setIsLinkedInMailboxOpen(false);
          // Reset the LinkedIn connection state
          setLinkedInStep(1);
          setLinkedInUrl('');
          setLinkedInEmail('');
          setLinkedInPassword('');
          setLinkedInName('')
          setLinkedInDesignation('')
          setLinkedInCountry('')
          // Fetch updated account count
          await fetchConnectedAccounts();
        } else {
          // CAPTCHA required
          const checkpointData = response.data;
          setCaptchaPublicKey(checkpointData.checkpoint.public_key);
          setCaptchaData(checkpointData.checkpoint.data);
          setCaptchaAccountId(checkpointData.account_id);

          toast.success("LinkedIn credentials submitted successfully. Please complete the CAPTCHA verification.");
          setLinkedInStep(2);
          loadCaptcha();
        }
      } else {
        toast.error("Failed to connect LinkedIn account. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting LinkedIn account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCaptcha = () => {
    const captcha = new ArkoseCaptchaIntegration(captchaPublicKey, captchaData);

    captcha.onLoaded = () => {
      console.log("CAPTCHA loaded successfully");
      setCaptchaLoaded(true);
      setShowCaptchaButton(false);
    };

    captcha.onSuccess = (token) => {
      console.log("CAPTCHA resolved successfully", { token });
      setCaptchaToken(token);
      setIsCaptchaSolved(true);
      captcha.unload();
    };

    captcha.onError = () => {
      console.log("CAPTCHA resolution failed");
      toast.error("CAPTCHA verification failed. Please try again.");
      setIsCaptchaSolved(false);
      setShowCaptchaButton(true);
    };

    captcha.load("linkedin-captcha-container");
  };

  const handleSolveCaptcha = async () => {
    setIsLoading(true);
    try {
      const payload = {
        code: captchaToken,
        account_id: captchaAccountId,
        username: linkedInEmail,
        linkedin_url: linkedInUrl,
        user_id: user?.id,
        country: linkedInCountry,
        name: linkedInName,
        email: selectedEmail,
        designation: linkedInDesignation,
        account_type: selectedAccountType
      };

      const response = await axiosInstance.post('/v2/linkedin/solve', payload);

      if (response.status === 200 && response.data.object === "AccountCreated") {
        toast.success("LinkedIn account connected successfully!");
        setIsLinkedInMailboxOpen(false);
        setLinkedInStep(1);
        await fetchConnectedAccounts();
      } else if (response.data.type === "errors/invalid_credentials") {
        toast.error("Invalid LinkedIn credentials. Please try again.");
        setLinkedInStep(1);
        setLinkedInUrl('');
        setLinkedInEmail('');
        setLinkedInPassword('');
        setLinkedInName('')
        setLinkedInDesignation('')
        setLinkedInCountry('')
        setCaptchaToken('');
        setCaptchaPublicKey('');
        setCaptchaData('');
        setCaptchaAccountId('');
      } else {
        setLinkedInStep(3);
      }
    } catch (error) {
      console.error("Error verifying CAPTCHA:", error);
      toast.error("An error occurred while verifying the CAPTCHA. Please try again.");
      setIsCaptchaSolved(false);
      loadCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    setIsLoading(true);
    try {
      const payload = {
        code: otpValue,
        account_id: captchaAccountId,
        username: linkedInEmail,
        linkedin_url: linkedInUrl,
        user_id: user?.id,
        country: linkedInCountry,
        name: linkedInName,
        email: selectedEmail,
        designation: linkedInDesignation,
        account_type: selectedAccountType
      };

      const response = await axiosInstance.post('/v2/linkedin/solve', payload);

      if (response.status === 200 && response.data.object === "AccountCreated") {
        toast.success("LinkedIn account connected successfully!");
        setIsLinkedInMailboxOpen(false);
        setLinkedInStep(1);
        setOtpValue('');
        await fetchConnectedAccounts();
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("An error occurred while verifying the OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axiosInstance.get('v2/settings/emails');
        setEmails(response.data.emails);

      } catch (error) {
        console.error('Failed to fetch emails:', error);
        toast.error('Failed to load email addresses');
      }
    };

    fetchEmails();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Slack Card Started Here */}
      <Card>
        <CardHeader className="flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <SlackIcon />
            <Button
              className={`text-sm border rounded-lg text-center p-2 cursor-not-allowed`}
              variant={"outline"}
              onClick={() => {
                slackLogin();
              }}
              disabled={true}
            >
              Coming Soon
            </Button>
          </div>
          <Dialog>
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex flex-col gap-4 mb-1">
                    <div className="flex justify-center items-center flex-row gap-3">
                      <Image src={logo} alt="logo" width={40} height={40} />
                      <ArrowLeftRight />
                      <HubSpotIcon />
                    </div>
                    Export AgentProd Leads to HubSpot
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Description about the action being performed
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <Form {...form}>
                <form className="w-2/3 space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          <p className="text-base text-gray-400">
                            Configure Leads
                          </p>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="all"
                                  className="h-6 w-6 focus:bg-black focus:text-white"
                                />
                              </FormControl>
                              <FormLabel className="font-bold">
                                <div>
                                  <h1 className="text-lg">Export All Leads</h1>
                                  <p className="font-normal text-gray-400">
                                    We will stream every lead that is enrolled
                                    from your AgentProd account
                                  </p>
                                </div>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="engaged"
                                  className="h-6 w-6 focus:bg-black focus:text-white"
                                />
                              </FormControl>
                              <FormLabel className="font-bold">
                                <div>
                                  <h1 className="text-lg">
                                    Export Engaged Leads
                                  </h1>
                                  <p className="font-normal text-gray-400">
                                    We will stream every lead that have
                                    responsed to your outbound workflows
                                  </p>
                                </div>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <Separator />
              <div className="flex flex-row gap-4">
                <p className="font-semibold">
                  Avoid outreach to leads that is already in your CRM?{" "}
                </p>
                <Switch />
              </div>
              <DialogFooter>
                <Button
                  variant={"outline"}
                  className="mt-3"
                  onClick={handleCloseHubspotMailbox}
                >
                  Cancel
                </Button>
                <Button className="mt-3" type="submit">
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* {service.isConnected ? (
            <Button variant={"outline"} className="text-sm">
              Disconnect
            </Button>
          ) : (
            <Button variant={"outline"} className="text-sm">
              Connect
            </Button>
          )} */}
        </CardHeader>
        <CardContent className="space-y-2 mt-2">
          <CardTitle>Slack</CardTitle>
          <CardDescription>
            Used to interact with the AgentProd and receive notifications.
          </CardDescription>
        </CardContent>
      </Card>
      {/*------------------ Slack Card Ended Here------------------- */}

      {/* Hubspot Card Started Here */}

      <Card>
        <CardHeader className="flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <HubSpotIcon />
            <Button
              className={`text-sm border rounded-lg text-center p-2 cursor-not-allowed`}
              variant={"outline"}
              onClick={() => {
                slackLogin();
              }}
              disabled={true}
            >
              Coming Soon
            </Button>
          </div>
          <Dialog
            open={isHubspotMailboxOpen}
            onOpenChange={setIsHubspotMailboxOpen}
          >
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex flex-col gap-4 mb-1">
                    <div className="flex justify-center items-center flex-row gap-3">
                      <Image src={logo} alt="logo" width={40} height={40} />
                      <ArrowLeftRight />
                      <HubSpotIcon />
                    </div>
                    Export AgentProd Leads to HubSpot
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Description about the action being performed
                </DialogDescription>
              </DialogHeader>
              <Separator />

              <div>
                <div className="w-full space-y-6">
                  <div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-base text-gray-400">
                          Configure Leads
                        </p>
                      </div>
                      <div>
                        <RadioGroup
                          value={selectedHubspotLeadType}
                          onValueChange={setSelectedHubspotLeadType}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <div>
                              <RadioGroupItem value="all" className="h-6 w-6" />
                            </div>
                            <div className="font-bold">
                              <div>
                                <h1 className="text-lg">Export All Leads</h1>
                                <p className="font-normal text-gray-400">
                                  We will stream every lead that is enrolled
                                  from your AgentProd account
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <div>
                              <RadioGroupItem
                                value="engaged"
                                className="h-6 w-6"
                              />
                            </div>
                            <div className="font-bold">
                              <div>
                                <h1 className="text-lg">
                                  Export Engaged Leads
                                </h1>
                                <p className="font-normal text-gray-400">
                                  We will stream every lead that have responsed
                                  to your outbound workflows
                                </p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex flex-row gap-4">
                <p className="font-semibold">
                  Avoid outreach to leads that is already in your CRM?{" "}
                </p>
                <Switch />
              </div>
              <DialogFooter>
                <Button
                  variant={"outline"}
                  className="mt-3"
                  onClick={handleCloseHubspotMailbox}
                >
                  Cancel
                </Button>
                <Button
                  className="mt-3"
                  type="submit"
                  onClick={() => {
                    if (!isConnectedToHubspot) {
                      handleHubspotConnect();
                      setTimeout(() => updateHubspotLeadType(), 100000);
                    } else {
                      updateHubspotLeadType();
                    }
                  }}
                >
                  {loading ? (
                    <LoadingCircle />
                  ) : isConnectedToHubspot ? (
                    "Update"
                  ) : (
                    "Login"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* {service.isConnected ? (
            <Button variant={"outline"} className="text-sm">
              Disconnect
            </Button>
          ) : (
            <Button variant={"outline"} className="text-sm">
              Connect
            </Button>
          )} */}
        </CardHeader>
        <CardContent className="space-y-2 mt-2">
          <CardTitle>Hubspot</CardTitle>
          <CardDescription>
            Used to interact with the AgentProd and receive notifications.
          </CardDescription>
        </CardContent>
      </Card>

      {/*------------------ Hubspot Card Ended Here------------------- */}

      {/* LinkedIn Card Started Here */}
      <Card>
        <CardHeader className="flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <LinkedInIcon />
            <div
              className={`text-sm border rounded-lg text-center p-2 cursor-pointer `}
              onClick={() => {
                setIsLinkedInMailboxOpen(true);
              }}
            >
              Connect
            </div>
            <Dialog open={isLinkedInMailboxOpen} onOpenChange={setIsLinkedInMailboxOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <div className="flex flex-col gap-4 mb-1">
                      <div className="flex justify-center items-center flex-row gap-3">
                        <Image src={logo} alt="logo" width={40} height={40} />
                        <ArrowLeftRight />
                        <LinkedInIcon />
                      </div>
                      Connect LinkedIn Account
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    {linkedInStep === 1 ? "Enter your LinkedIn credentials" :
                      linkedInStep === 2 ? "Complete CAPTCHA verification" :
                        "Enter verification code"}
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                {linkedInStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin-name">Name</Label>
                      <Input
                        id="linkedin-name"
                        placeholder="John Doe"
                        value={linkedInName}
                        onChange={(e) => setLinkedInName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-row gap-4">


                      <div className="space-y-2 w-1/2">
                        <Label htmlFor="linkedin-designation">Designation</Label>
                        <Input
                          id="linkedin-designation"
                          placeholder="CEO"
                          value={linkedInDesignation}
                          onChange={(e) => setLinkedInDesignation(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 w-1/2">
                        <Label htmlFor="linkedin-country">Country</Label>
                        <Input
                          id="linkedin-country"
                          placeholder="United States"
                          value={linkedInCountry}
                          onChange={(e) => setLinkedInCountry(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-select">Select Email</Label>
                      <select
                        id="email-select"
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select an email</option>
                        {emails.map((email) => (
                          <option key={email?.id as number} value={email?.mailbox}>
                            {email?.mailbox}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-500">Note: Connect an email mailbox and select it  here in case of multichannel outreach, for linkedin outreach you dont have to connect an mailbox</div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedin-url"
                        placeholder="https://www.linkedin.com/in/yourprofile/"
                        value={linkedInUrl}
                        onChange={(e) => setLinkedInUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-select">Select Account Type</Label>
                      <select
                        id="account-type"
                        value={selectedAccountType}
                        onChange={(e) => setSelectedAccountType(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select an LinkedIn Account Type</option>
                        <option value="normal">Normal Account</option>
                        <option value="premium">Premium Account</option>
                        <option value="recruiter">Recruiter Account</option>
                        <option value="sales_navigator">Sales Navigator Account</option>

                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin-email">LinkedIn Email</Label>
                      <Input
                        id="linkedin-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={linkedInEmail}
                        onChange={(e) => setLinkedInEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin-password">LinkedIn Password</Label>
                      <Input
                        id="linkedin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={linkedInPassword}
                        onChange={(e) => setLinkedInPassword(e.target.value)}
                      />
                    </div>


                  </div>
                )}
                {linkedInStep === 2 && (
                  <div className="space-y-4">
                    {showCaptchaButton && (
                      <Button onClick={loadCaptcha} disabled={isLoading}>
                        Show CAPTCHA
                      </Button>
                    )}
                    <div id="linkedin-captcha-container" className="min-h-[450px]"></div>
                    {captchaLoaded && captchaToken && (
                      <Button onClick={handleSolveCaptcha} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <LoadingCircle />
                            Verifying...
                          </>
                        ) : (
                          "Verify CAPTCHA"
                        )}
                      </Button>
                    )}
                  </div>
                )}
                {linkedInStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Please enter the verification code sent to your Email Address
                      </p>
                    </div>
                    <div className="flex items-center justify-center min-h-[100px]">
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
                      >
                        <InputOTPGroup className="">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleOTPVerification}
                      disabled={otpValue.length !== 6 || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingCircle />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLinkedInMailboxOpen(false)} disabled={isLoading}>
                    {linkedInStep === 3 ? "Close" : "Cancel"}
                  </Button>
                  {linkedInStep === 1 && (
                    <Button onClick={handleLinkedInConnect} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <LoadingCircle />
                          Connecting...
                        </>
                      ) : (
                        "Next"
                      )}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 mt-2">
          <CardTitle>LinkedIn</CardTitle>
          <CardDescription>
            Used to interact with the AgentProd and receive notifications.
            <div className="font-semibold mt-2 dark:text-white text-black">Accounts Connected: {connectedAccounts}</div>
          </CardDescription>
        </CardContent>
      </Card>
      {/*------------------ LinkedIn Card Ended Here------------------- */}

      {/* SalesForce Card Started Here */}
      <Card>
        <CardHeader className="flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <SalesForceIcon />
            <Button
              className={`text-sm border rounded-lg text-center p-2 cursor-not-allowed`}
              variant={"outline"}
              onClick={() => {
                slackLogin();
              }}
              disabled={true}
            >
              Coming Soon
            </Button>
          </div>
          <Dialog
            open={isSalesforceMailboxOpen}
            onOpenChange={setIsSalesforceMailboxOpen}
          >
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex flex-col gap-4 mb-1">
                    <div className="flex justify-center items-center flex-row gap-3">
                      <Image src={logo} alt="logo" width={40} height={40} />
                      <ArrowLeftRight />
                      <SalesForceIcon />
                    </div>
                    Export AgentProd Leads to Salesforce
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Description about the action being performed
                </DialogDescription>
              </DialogHeader>
              <Separator />

              <div>
                <div className="w-full space-y-6">
                  <div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-base text-gray-400">
                          Configure Leads
                        </p>
                      </div>
                      <div>
                        <RadioGroup
                          value={selectedHubspotLeadType}
                          onValueChange={setSelectedHubspotLeadType}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <div>
                              <RadioGroupItem value="all" className="h-6 w-6" />
                            </div>
                            <div className="font-bold">
                              <div>
                                <h1 className="text-lg">Export All Leads</h1>
                                <p className="font-normal text-gray-400">
                                  We will stream every lead that is enrolled
                                  from your AgentProd account
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <div>
                              <RadioGroupItem
                                value="engaged"
                                className="h-6 w-6"
                              />
                            </div>
                            <div className="font-bold">
                              <div>
                                <h1 className="text-lg">
                                  Export Engaged Leads
                                </h1>
                                <p className="font-normal text-gray-400">
                                  We will stream every lead that have responsed
                                  to your outbound workflows
                                </p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex flex-row gap-4">
                <p className="font-semibold">
                  Avoid outreach to leads that is already in your CRM?{" "}
                </p>
                <Switch />
              </div>
              <DialogFooter>
                <Button
                  variant={"outline"}
                  className="mt-3"
                  onClick={handleCloseSalesforceMailbox}
                >
                  Cancel
                </Button>
                <Button
                  className="mt-3"
                  type="submit"
                  onClick={() => updateSaleforceLeadType()}
                >
                  {loading ? <LoadingCircle /> : "Update"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2 mt-2">
          <CardTitle>Salesforce</CardTitle>
          <CardDescription>
            Used to interact with the AgentProd and receive notifications.
          </CardDescription>
        </CardContent>
      </Card>

      {/*------------------ SalesForce Card Ended Here------------------- */}

      {/* Zapier Card Started Here */}

      <Card>
        <CardHeader className="flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <ZapierIcon />
            <Button
              className={`text-sm border rounded-lg text-center p-2 cursor-not-allowed`}
              variant={"outline"}
              onClick={() => {
                slackLogin();
              }}
              disabled={true}
            >
              Coming Soon
            </Button>
          </div>
          <Dialog>
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex flex-col gap-4 mb-1">
                    <div className="flex justify-center items-center flex-row gap-3">
                      <Image src={logo} alt="logo" width={40} height={40} />
                      <ArrowLeftRight />
                      <HubSpotIcon />
                    </div>
                    Export AgentProd Leads to HubSpot
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Description about the action being performed
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <Form {...form}>
                <form
                  // onSubmit={form.handleSubmit(onSubmit)}
                  className="w-2/3 space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          <p className="text-base text-gray-400">
                            Configure Leads
                          </p>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="all"
                                  className="h-6 w-6 focus:bg-black focus:text-white"
                                />
                              </FormControl>
                              <FormLabel className="font-bold">
                                <div>
                                  <h1 className="text-lg">Export All Leads</h1>
                                  <p className="font-normal text-gray-400">
                                    We will stream every lead that is enrolled
                                    from your AgentProd account
                                  </p>
                                </div>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="engaged"
                                  className="h-6 w-6 focus:bg-black focus:text-white"
                                />
                              </FormControl>
                              <FormLabel className="font-bold">
                                <div>
                                  <h1 className="text-lg">
                                    Export Engaged Leads
                                  </h1>
                                  <p className="font-normal text-gray-400">
                                    We will stream every lead that have
                                    responsed to your outbound workflows
                                  </p>
                                </div>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <Separator />
              <div className="flex flex-row gap-4">
                <p className="font-semibold">
                  Avoid outreach to leads that is already in your CRM?{" "}
                </p>
                <Switch />
              </div>
              <DialogFooter>
                <Button
                  variant={"outline"}
                  className="mt-3"
                  onClick={handleCloseHubspotMailbox}
                >
                  Cancel
                </Button>
                <Button className="mt-3" type="submit">
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* {service.isConnected ? (
            <Button variant={"outline"} className="text-sm">
              Disconnect
            </Button>
          ) : (
            <Button variant={"outline"} className="text-sm">
              Connect
            </Button>
          )} */}
        </CardHeader>
        <CardContent className="space-y-2 mt-2">
          <CardTitle>Zapier</CardTitle>
          <CardDescription>
            Used to interact with the AgentProd and receive notifications.
          </CardDescription>
        </CardContent>
      </Card>
    </div >
  );
}
