/* eslint-disable no-console */
import Cookies from "js-cookie";

const token = Cookies.get('Authorization');
export const hubspotLogin = (userid: string) => {
  window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}v2/hubspot/login/${userid}`,{
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  };
};

export const salesforceLogin = (userid: string) => {
  window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}v2/salesforce/login/${userid}`,{
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  };
};

export const slackLogin = () => {
  const slackAuthUrl =
    "https://slack.com/oauth/v2/authorize?client_id=5903515250213.7537369989141&scope=app_mentions:read,channels:history,chat:write,commands,files:read,groups:read,im:history,im:read,mpim:read,users.profile:read,users:read&user_scope=chat:write";

  window.open(slackAuthUrl, "_blank", "noopener,noreferrer");
};
