import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const initializeOnboardingGuide = () => {
    const driverObj = driver({
        showProgress: true,
        steps: [
            {
                element: '#chat-with-sally',
                popover: {
                    title: 'Onboard yourself',
                    description: 'Start chatting with Sally to setup your account',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#settings',
                popover: {
                    title: 'Connect your linkedin and mailboxes',
                    description: 'Connect your linkedin in integration tab and your mailboxes in mailboxes tab',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#campaign',
                popover: {
                    title: 'Create your first campaign',
                    description: 'Build your first campaign by selecting the product and adding the details',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#inbox-nav',
                popover: {
                    title: 'Inbox',
                    description: 'View the drafts and actions taken on your campaign via our unified inbox for emails and linkedin',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#total-emails-sent',
                popover: {
                    title: 'Campaign outreach overview',
                    description: 'View the all important metrics and actions required for your campaign',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#sending-volume-chart',
                popover: {
                    title: 'Daily Report',
                    description: 'View the daily statistics of the outreach being done from your account',
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#campaign-performance',
                popover: {
                    title: 'Email Campaign Performance',
                    description: 'Checkout how your Email campaigns are performing',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#linkedin-campaigns',
                popover: {
                    title: 'LinkedIn Campaign Performance',
                    description: 'Checkout how your LinkedIn campaigns are performing',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '.cc-157aw',
                popover: {
                    title: 'Need Help?',
                    description: 'Talk to us if you need help with anything, we reply super-promptly',
                    side: "left",
                    align: 'start'
                }
            }
        ],
        // Optional configuration
        animate: true,
        // opacity: 0.7,
        allowClose: true,
        // overlayClickNext: false,
        doneBtnText: 'Done',
        // closeBtnText: 'Skip',
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
    });

    return driverObj;
}; 