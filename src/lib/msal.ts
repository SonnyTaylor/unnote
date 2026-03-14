import { PublicClientApplication, type Configuration } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: "804045d9-4f59-45f5-bfcb-efdd3672d5e4",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:1420",
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: [
    "User.Read",
    "Notes.Read",
    "Notes.ReadWrite",
    "Group.Read.All",
  ],
};

export async function getAccessToken(): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch {
    // Silent token acquisition failed, need interactive login
    return null;
  }
}
