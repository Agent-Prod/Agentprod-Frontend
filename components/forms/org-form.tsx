// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tag, TagInput } from "@/components/ui/tag/tag-input";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import React, { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// import { toast } from "sonner";
// import axios from "axios";
// import { Organization, useLeads } from "@/context/lead-user";
// import { LoadingCircle } from "@/app/icons";
// import { AudienceTableClient } from "../tables/audience-table/client";
// // import { toast } from "@/components/ui/use-toast";
// import { orgLocations, InputType } from "./formUtils";

// const FormSchema = z.object({
//   q_organization_name: z
//     .object({
//       id: z.string(),
//       text: z.string(),
//     })
//     .optional(),
//   minimun_company_headcount: z
//     .object({
//       id: z.string(),
//       text: z.number(),
//     })
//     .optional(),
//   maximun_company_headcount: z
//     .object({
//       id: z.string(),
//       text: z.number(),
//     })
//     .optional(),
//   per_page: z
//     .object({
//       id: z.string(),
//       text: z.number(),
//     })
//     .optional(),
//   prospected_by_current_team: z
//     .object({
//       id: z.string(),
//       text: z.string(),
//     })
//     .optional(),
//   organization_locations: z
//     .array(
//       z.object({
//         id: z.string(),
//         text: z.string(),
//       })
//     )
//     .optional(),
//   organization_not_locations: z
//     .array(
//       z.object({
//         id: z.string(),
//         text: z.string(),
//       })
//     )
//     .optional(),
//   q_organization_keyword_tags: z
//     .array(
//       z.object({
//         id: z.string(),
//         text: z.string(),
//       })
//     )
//     .optional(),
// });

// const industryKeywords: string[] = [
//   "accounting",
//   "agriculture",
//   "airlines/aviation",
//   "alternative dispute resolution",
//   "alternative medicine",
//   "animation",
//   "apparel & fashion",
//   "architecture & planning",
//   "arts & crafts",
//   "automotive",
//   "aviation & aerospace",
//   "banking",
//   "biotechnology",
//   "broadcast media",
//   "building materials",
//   "business supplies & equipment",
//   "capital markets",
//   "chemicals",
//   "civic & social organization",
//   "civil engineering",
//   "commercial real estate",
//   "computer & network security",
//   "computer games",
//   "computer hardware",
//   "computer networking",
//   "computer software",
//   "construction",
//   "consumer electronics",
//   "consumer goods",
//   "consumer services",
//   "cosmetics",
//   "dairy",
//   "defense & space",
//   "design",
//   "e-learning",
//   "education management",
//   "electrical/electronic manufacturing",
//   "entertainment",
//   "environmental services",
//   "events services",
//   "executive office",
//   "facilities services",
//   "farming",
//   "financial services",
//   "fine art",
//   "fishery",
//   "food & beverages",
//   "food production",
//   "fund-raising",
//   "furniture",
//   "gambling & casinos",
//   "glass, ceramics & concrete",
//   "government administration",
//   "government relations",
//   "graphic design",
//   "health, wellness & fitness",
//   "higher education",
//   "hospital & health care",
//   "hospitality",
//   "human resources",
//   "import & export",
//   "individual & family services",
//   "industrial automation",
//   "information services",
//   "information technology & services",
//   "insurance",
//   "international affairs",
//   "international trade & development",
//   "internet",
//   "investment banking",
//   "investment management",
//   "judiciary",
//   "law enforcement",
//   "law practice",
//   "legal services",
//   "legislative office",
//   "leisure, travel & tourism",
//   "libraries",
//   "logistics & supply chain",
//   "luxury goods & jewelry",
//   "machinery",
//   "management consulting",
//   "maritime",
//   "market research",
//   "marketing & advertising",
//   "mechanical or industrial engineering",
//   "media production",
//   "medical devices",
//   "medical practice",
//   "mental health care",
//   "military",
//   "mining & metals",
//   "motion pictures & film",
//   "museums & institutions",
//   "music",
//   "nanotechnology",
//   "newspapers",
//   "nonprofit organization management",
//   "oil & energy",
//   "online media",
//   "outsourcing/offshoring",
//   "package/freight delivery",
//   "packaging & containers",
//   "paper & forest products",
//   "performing arts",
//   "pharmaceuticals",
//   "philanthropy",
//   "photography",
//   "plastics",
//   "political organization",
//   "primary/secondary education",
//   "printing",
//   "professional training & coaching",
//   "program development",
//   "public policy",
//   "public relations & communications",
//   "public safety",
//   "publishing",
//   "railroad manufacture",
//   "ranching",
//   "real estate",
//   "recreational facilities & services",
//   "religious institutions",
//   "renewables & environment",
//   "research",
//   "restaurants",
//   "retail",
//   "security & investigations",
//   "semiconductors",
//   "shipbuilding",
//   "sporting goods",
//   "sports",
//   "staffing & recruiting",
//   "supermarkets",
//   "telecommunications",
//   "textiles",
//   "think tanks",
//   "tobacco",
//   "translation & localization",
//   "transportation/trucking/railroad",
//   "utilities",
//   "venture capital & private equity",
//   "veterinary",
//   "warehousing",
//   "wholesale",
//   "wine & spirits",
//   "wireless",
//   "writing & editing",
// ];

// export default function OrgFormComponenet(): JSX.Element {
//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//   });

//   const { setLeads } = useLeads();

//   const [tab, setTab] = useState("tab1");
//   const [loading, setLoading] = useState(false);

//   const onTabChange = async (value: any) => {
//     //TODO: only change the value if form is correct
//     console.log(form.formState.isValid);
//     // if (form.formState.isValid) {
//     setTab(value);
//     setLoading(true);

//     // setTab(value);
//     // }
//   };

//   //   const [tags, setTags] = React.useState<Tag[]>([]);

//   const [qOrganizationName, setQOrganizationName] = React.useState<InputType>({
//     id: "",
//     text: "",
//   });

//   const [minimumCompanyHeadcount, setMinimumCompanyHeadcount] =
//     React.useState<InputType>({
//       id: "",
//       text: 0,
//     });

//   const [maximumCompanyHeadcount, setMaximumCompanyHeadcount] =
//     React.useState<InputType>({
//       id: "",
//       text: 0,
//     });

//   const [perPage, setPerPage] = React.useState<InputType>({
//     id: "",
//     text: 0,
//   });

//   const [prospectedByCurrentTeam, setProspectedByCurrentTeam] =
//     React.useState<InputType>({
//       id: "",
//       text: "",
//     });

//   const [organizationLocationsTags, setOrganizationLocationsTags] =
//     React.useState<Tag[]>([]);

//   const [organizationNotLocationsTags, setOrganizationNotLocationsTags] =
//     React.useState<Tag[]>([]);

//   const [qOrganizationKeywordTags, setQOrganizationKeywordTags] =
//     React.useState<Tag[]>([]);

//   const { setValue } = form;

//   interface Data {
//     q_organization_name: { id: string; text: string } | undefined;
//     minimum_company_headcount: { id: string; text: number } | undefined;
//     maximum_company_headcount: { id: string; text: number } | undefined;
//     per_page: { id: string; text: number } | undefined;
//     prospected_by_current_team: { id: string; text: string } | undefined;
//     organization_locations: { id: string; text: string }[] | undefined;
//     organization_not_locations: { id: string; text: string }[] | undefined;
//     q_organization_keyword_tags: { id: string; text: string }[] | undefined;
//   }

//   const prevInputValues = React.useRef<Data | null>(null);

//   async function onSubmit(data: z.infer<typeof FormSchema>) {
//     const formData = {
//       q_organization_name: data.q_organization_name,
//       minimum_company_headcount: data.minimun_company_headcount,
//       maximum_company_headcount: data.maximun_company_headcount,
//       per_page: data.per_page,
//       prospected_by_current_team: data.prospected_by_current_team,
//       organization_locations: data.organization_locations,
//       organization_not_locations: data.organization_not_locations,
//       q_organization_keyword_tags: data.q_organization_keyword_tags,
//     };

//     let shouldCallAPI = false;

//     if (!prevInputValues) shouldCallAPI = true;

//     const pages = formData.per_page?.text
//       ? Math.ceil(formData.per_page?.text / 100)
//       : 1;

//     const body = {
//       ...(pages && { page: pages }), // Only include if pages is truthy
//       ...(formData.per_page?.text && {
//         per_page: formData.per_page.text > 100 ? 100 : formData.per_page.text,
//       }),
//       ...(formData.prospected_by_current_team?.text && {
//         prospected_by_current_team: [
//           formData.prospected_by_current_team.text,
//         ].filter((text) => text),
//       }),
//       ...(formData.q_organization_name?.text && {
//         q_organization_name: formData.q_organization_name.text,
//       }),
//       ...(formData.organization_locations && {
//         organization_locations: formData.organization_locations
//           .map((tag) => tag.text)
//           .filter((text) => text),
//       }),
//       ...(formData.minimum_company_headcount?.text &&
//         formData.maximum_company_headcount?.text && {
//           organization_num_employees_ranges: [
//             `${formData.minimum_company_headcount.text},${formData.maximum_company_headcount.text}`,
//           ],
//         }),
//       ...(formData.organization_not_locations && {
//         organization_not_locations: formData.organization_not_locations
//           .map((tag) => tag.text)
//           .filter((text) => text),
//       }),
//       ...(formData.q_organization_keyword_tags && {
//         q_organization_keyword_tags: formData.q_organization_keyword_tags
//           .map((tag) => tag.text)
//           .filter((text) => text),
//       }),
//     };

//     if (
//       prevInputValues.current?.q_organization_name?.text !==
//         formData.q_organization_name?.text ||
//       prevInputValues.current?.minimum_company_headcount?.text !==
//         formData.minimum_company_headcount?.text ||
//       prevInputValues.current?.maximum_company_headcount?.text !==
//         formData.maximum_company_headcount?.text ||
//       prevInputValues.current?.per_page?.text !== formData.per_page?.text ||
//       prevInputValues.current?.prospected_by_current_team?.text !==
//         formData.prospected_by_current_team?.text
//     ) {
//       shouldCallAPI = true;
//     }

//     if (
//       prevInputValues.current?.organization_locations
//         ?.map((tag) => tag.text)
//         .toString() !== body.organization_locations?.toString() ||
//       prevInputValues.current?.organization_not_locations
//         ?.map((tag) => tag.text)
//         .toString() !== body.organization_not_locations?.toString() ||
//       prevInputValues.current?.q_organization_keyword_tags
//         ?.map((tag) => tag.text)
//         .toString() !== body.q_organization_keyword_tags?.toString()
//     ) {
//       shouldCallAPI = true;
//     }

//     if (shouldCallAPI) {
//       try {
//         console.log("api called");
//         console.log(body);
//         // const response = await axios.post(
//         //   "/api/apollo",
//         //   {
//         //     url: "https://api.apollo.io/api/v1/mixed_companies/search",
//         //     body: body,
//         //   },
//         //   {
//         //     headers: {
//         //       "Content-Type": "application/json",
//         //     },
//         //   }
//         // );

//         const response = await axios.post(
//           "/api/apollo",
//           {
//             url: "http://localhost:3030/apollo/api/company",
//             body: body,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         console.log("DATA: ", JSON.stringify(response.data));
//         if (response.data.result.organizations.length > 0) {
//           response.data.result.organizations.map(
//             (organization: Organization): void => {
//               organization.type = "organization";
//             }
//           );
//           setLeads(response.data.result.organizations as Organization[]);
//         } else {
//           response.data.result.accounts.map(
//             (organization: Organization): void => {
//               organization.type = "organization";
//             }
//           );
//           setLeads(response.data.result.accounts as Organization[]);
//         }
//         //       console.log(form.getValues());
//         toast.success("api called");
//       } catch (err) {
//         console.log("ERR: ", err);
//         toast.error("Error fetching data");
//       } finally {
//         shouldCallAPI = false;
//         setLoading(false);
//       }
//     } else {
//       toast.error("no need to call api");
//       setLoading(false);
//     }
//     // } else {
//     //   toast.error("Please fill out the form correctly");
//     // }

//     prevInputValues.current = formData;

//     // const body = {
//     //   page: 1,
//     //   per_page: 10,
//     //   organization_num_employees_ranges: ["1,100", "1,1000"],
//     //   organization_locations: ["United States"],
//     //   q_organization_keyword_tags: ["sales strategy", "lead"],
//     //   q_organization_name: "Apollo.io",
//     // };
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="space-y-8 flex flex-col items-start"
//       >
//         <Tabs value={tab} onValueChange={onTabChange} className="w-full">
//           <TabsList className="grid grid-cols-2 w-[330px]">
//             <TabsTrigger value="tab1">Edit</TabsTrigger>
//             <TabsTrigger value="tab2" type="submit">
//               Preview
//             </TabsTrigger>
//           </TabsList>
//           <TabsContent value="tab1" className="space-y-4">
//             <Accordion className="flex flex-col" type="single" collapsible>
//               <AccordionItem className="my-2" value="current-employment">
//                 <AccordionTrigger>Company HQ</AccordionTrigger>
//                 <AccordionContent>
//                   <div className="flex w-full justify-between">
//                     <div className="my-3 w-1/2">
//                       <FormField
//                         control={form.control}
//                         name="organization_locations"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-col items-start mx-1 ">
//                             <FormLabel className="text-left">
//                               Company Locations
//                             </FormLabel>
//                             <FormControl>
//                               <TagInput
//                                 {...field}
//                                 dropdown={true}
//                                 dropdownPlaceholder="Enter a location"
//                                 dropdownOptions={orgLocations}
//                                 tags={organizationLocationsTags}
//                                 className="sm:min-w-[450px]"
//                                 setTags={(newTags) => {
//                                   setOrganizationLocationsTags(newTags);
//                                   setValue(
//                                     "organization_locations",
//                                     newTags as [Tag, ...Tag[]]
//                                   );
//                                 }}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               These are the company locations that you&apos;re
//                               interested in.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     <div className="my-4 w-1/2">
//                       <FormField
//                         control={form.control}
//                         name="organization_not_locations"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-col items-start mx-1 ">
//                             <FormLabel className="text-left">
//                               Un-allowed Organization Location
//                             </FormLabel>
//                             <FormControl>
//                               <TagInput
//                                 {...field}
//                                 dropdown={true}
//                                 dropdownPlaceholder="Enter a location"
//                                 dropdownOptions={orgLocations}
//                                 tags={organizationNotLocationsTags}
//                                 className="sm:min-w-[450px]"
//                                 setTags={(newTags) => {
//                                   setOrganizationNotLocationsTags(newTags);
//                                   setValue(
//                                     "organization_not_locations",
//                                     newTags as [Tag, ...Tag[]]
//                                   );
//                                 }}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               These are the un-allowed locations of the
//                               organizations you&apos;re interested in.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                   <div className="flex w-full justify-between">
//                     <div className="my-4 w-1/2">
//                       <FormField
//                         control={form.control}
//                         name="q_organization_keyword_tags"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-col items-start gap-0 mx-1">
//                             <FormLabel className="text-left">
//                               Organization Keyword
//                             </FormLabel>
//                             <FormControl>
//                               <TagInput
//                                 {...field}
//                                 dropdown={true}
//                                 dropdownPlaceholder="Enter a keyword"
//                                 dropdownOptions={industryKeywords}
//                                 tags={qOrganizationKeywordTags}
//                                 className="sm:min-w-[450px]"
//                                 setTags={(newTags) => {
//                                   setQOrganizationKeywordTags(newTags);
//                                   setValue(
//                                     "q_organization_keyword_tags",
//                                     newTags as [Tag, ...Tag[]]
//                                   );
//                                 }}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               These are keywords that the organization that
//                               you&apos;re interested in should be associated
//                               with.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     <div className="my-4 w-1/2">
//                       <FormField
//                         control={form.control}
//                         name="q_organization_name"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-col items-start mx-1">
//                             <FormLabel className="text-left mb-3">
//                               Organization Name
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="Company Name"
//                                 className="sm:min-w-[450px] w-2/3"
//                                 value={qOrganizationName.text}
//                                 onChange={(e) => {
//                                   const newValue = {
//                                     ...qOrganizationName,
//                                     text: e.target.value,
//                                   };
//                                   setQOrganizationName(newValue); // Update local state
//                                   field.onChange(newValue); // Notify React Hook Form of the change
//                                 }}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               The organization that you&apos;re interested in.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                 </AccordionContent>
//               </AccordionItem>
//             </Accordion>
//             <Accordion className="flex flex-col" type="single" collapsible>
//               <AccordionItem value="current-employment">
//                 <AccordionTrigger>Company headcount</AccordionTrigger>
//                 <AccordionContent>
//                   <div className="flex w-full justify-between">
//                     <div className="my-3 w-1/2">
//                       <FormField
//                         control={form.control}
//                         name="minimun_company_headcount"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-col items-start mx-1 my-4">
//                             <FormLabel className="text-left">
//                               Minimum Company Headcount
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="Minimum"
//                                 className="sm:min-w-[450px] w-2/3"
//                                 value={minimumCompanyHeadcount.text}
//                                 onChange={(e) => {
//                                   const numericValue = Number(e.target.value);
//                                   const newValue = {
//                                     ...minimumCompanyHeadcount,
//                                     text: numericValue,
//                                   };
//                                   setMinimumCompanyHeadcount(newValue); // Update local state
//                                   field.onChange(newValue); // Notify React Hook Form of the change
//                                 }}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               This is the minimun headcount of the company that
//                               you&apos;re interested in.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     <div className="my-3 w-1/2">
//                       <FormField
//                         control={form.control}
//                         name="maximun_company_headcount"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-col items-start mx-1 my-4">
//                             <FormLabel className="text-left">
//                               Maximun Company Headcount
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="Maximun"
//                                 className="sm:min-w-[450px] w-2/3"
//                                 value={maximumCompanyHeadcount.text}
//                                 onChange={(e) => {
//                                   const numericValue = Number(e.target.value);
//                                   const newValue = {
//                                     ...maximumCompanyHeadcount,
//                                     text: numericValue,
//                                   };
//                                   setMaximumCompanyHeadcount(newValue); // Update local state
//                                   field.onChange(newValue); // Notify React Hook Form of the change
//                                 }}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               This is maximun headcount of the company that
//                               you&apos;re interested in.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                 </AccordionContent>
//               </AccordionItem>
//             </Accordion>
//             <FormField
//               control={form.control}
//               name="per_page"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col items-start my-4">
//                   <FormLabel className="text-left">
//                     Number of Companies
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Enter number of companies"
//                       className="sm:min-w-[450px]"
//                       value={perPage.text}
//                       onChange={(e) => {
//                         const numericValue = Number(e.target.value);
//                         const newValue = {
//                           ...perPage,
//                           text: numericValue,
//                         };
//                         setPerPage(newValue); // Update local state
//                         field.onChange(newValue); // Notify React Hook Form of the change
//                       }}
//                     />
//                   </FormControl>
//                   <FormDescription>
//                     These are the number of employees that you&apos;re
//                     interested in.
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="prospected_by_current_team"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col items-start my-4">
//                   <FormLabel className="text-left">
//                     Prospected by Current Team
//                   </FormLabel>
//                   <FormControl>
//                     <Select
//                       onValueChange={(value) => {
//                         const newValue = {
//                           ...prospectedByCurrentTeam,
//                           text: value,
//                         };
//                         setProspectedByCurrentTeam(newValue); // Update local state
//                         field.onChange(newValue); // Notify React Hook Form of the change
//                       }}
//                     >
//                       <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Yes/No" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="yes">Yes</SelectItem>
//                         <SelectItem value="no">No</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormDescription>
//                     This is wether the organization that you&apos;re interested
//                     in has been prospected or not.
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </TabsContent>
//           <TabsContent value="tab2">
//             {loading ? <LoadingCircle /> : <AudienceTableClient />}
//             <Button>Create Audience</Button>
//           </TabsContent>
//         </Tabs>
//       </form>
//     </Form>
//   );
// }
