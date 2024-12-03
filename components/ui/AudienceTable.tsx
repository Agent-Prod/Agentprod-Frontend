import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, SetStateAction } from "react";
import { Contact, Lead, useLeads } from "@/context/lead-user";
import { Checkbox } from "./checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { NameAction } from "../tables/user-tables/name-action";
import { useLeadSheetSidebar } from "@/context/lead-sheet-sidebar";

function AudienceTable() {
  const { leads, setLeads } = useLeads();
  const { toggleSidebar, setItemId } = useLeadSheetSidebar();

  const [deselectedLeads, setDeselectedLeads] = useState<any[]>([]);
  const [activeLeadId, setActiveLeadId] = useState(null);

  const handleCheckboxChange = (lead: Lead | Contact) => {
    if (deselectedLeads.some(deselectedLead => deselectedLead.id === lead.id)) {
      // Re-select the lead
      setDeselectedLeads(deselectedLeads.filter(deselectedLead => deselectedLead.id !== lead.id));
      setLeads([...leads, lead] as Lead[] | Contact[]);
    } else {
      // Deselect the lead
      setDeselectedLeads([...deselectedLeads, lead]);
      //@ts-ignore
      setLeads((prevLeads: Lead[] | Contact[]) => prevLeads.filter((l: Lead | Contact) => l.id !== lead.id));
    }
  };

  const allLeads = [...leads, ...deselectedLeads].sort((a, b) => a.id - b.id);

  const handleLeadClick = (leadId: any) => {
    setActiveLeadId(leadId);
    setItemId(leadId);
    toggleSidebar(true);
  };

  return (
    <div className="">
      <div className="h-96 overflow-y-scroll border rounded-lg my-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SELECT</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>COMPANY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="">
                  <Checkbox
                    checked={!deselectedLeads.some(deselectedLead => deselectedLead.id === lead.id)}
                    onCheckedChange={() => handleCheckboxChange(lead)}
                  />
                </TableCell>
                <TableCell
                  className="font-medium flex justify-center items-center cursor-pointer"
                  onClick={() => handleLeadClick(lead.id)}
                >
                  <Avatar>
                    <AvatarImage src={lead.photo_url ?? lead.organization.logo_url} alt={lead.first_name} />
                    <AvatarFallback>{lead.first_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="ml-4">{lead.first_name}</span>
                </TableCell>
                <TableCell>{lead.title}</TableCell>
                <TableCell>
                  {lead.employment_history?.[0]?.organization_name || "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AudienceTable;
