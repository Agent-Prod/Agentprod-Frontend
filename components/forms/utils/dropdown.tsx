import { ChevronUp } from "lucide-react";

enum DropdownSection {
    CurrentEmployment = 'currentEmployment',
    RevenueFunding = 'revenueFunding',
    CompanyFunding = 'companyFunding',
    OrgLocations = 'orgLocations',
    Funding = 'funding',
    Headcount = 'headcount',
    JobPostings = 'jobPostings',
    CompanyDomains = 'companyDomains',
    Industry = 'industry',
    Company = 'company',
    SearchSignals = 'searchSignals',
    Technologies = 'technologies',
    BuyingIntent = 'buyingIntent'
}

interface FormDropdownProps {
    section: DropdownSection;
    title: string;
    isOpen: boolean;
    onToggle: (section: DropdownSection) => void;
    children: React.ReactNode;
}

export const FormDropdown: React.FC<FormDropdownProps> = ({
    section,
    title,
    isOpen,
    onToggle,
    children
}) => {
    return (
        <div className="bg-muted px-2 rounded">
            <div
                className="flex justify-between w-full py-3 cursor-pointer"
                onClick={() => onToggle(section)}
            >
                <div className="text-sm">{title}</div>
                <ChevronUp
                    color="#000000"
                    className={`transition-transform duration-200 transform ${isOpen ? 'rotate-0' : 'rotate-180'
                        }`}
                />
            </div>
            <div className={isOpen ? 'block' : 'hidden'}>
                {children}
            </div>
        </div>
    );
};