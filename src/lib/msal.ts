import { PublicClientApplication, type Configuration, InteractionRequiredAuthError } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    // TODO: Switch to UnNote app ID (804045d9-4f59-45f5-bfcb-efdd3672d5e4) once admin consent is granted
    clientId: "de8bc8b5-d9f9-48b1-a8ad-b748da725064",
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
    "Notes.ReadWrite.All",
    "Group.Read.All",
  ],
};

// Dev mode: allow manually setting a token from Graph Explorer
let devToken: string | null = null;

export function setDevToken(token: string) {
  devToken = token;
  localStorage.setItem("unnote_dev_token", token);
}

export function clearDevToken() {
  devToken = null;
  localStorage.removeItem("unnote_dev_token");
}

export function hasDevToken(): boolean {
  return !!(devToken || localStorage.getItem("unnote_dev_token"));
}

export async function getAccessToken(): Promise<string | null> {
  // Check dev token first
  if (devToken) return devToken;
  const stored = localStorage.getItem("unnote_dev_token");
  if (stored) {
    devToken = stored;
    return stored;
  }

  // MSAL flow
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch (error) {
    // If silent renewal fails (token expired, etc.), try interactive
    if (error instanceof InteractionRequiredAuthError) {
      try {
        await msalInstance.acquireTokenRedirect({
          ...loginRequest,
          account: accounts[0],
        });
        // acquireTokenRedirect doesn't return directly — page will reload
      } catch {
        // Interactive auth failed
      }
      return null;
    }
    return null;
  }
}
