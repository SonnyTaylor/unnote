import { PublicClientApplication, type Configuration, InteractionRequiredAuthError } from "@azure/msal-browser";
import { getSetting, setSetting } from "./settings";

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
// Stored in Tauri Store (falls back to localStorage) instead of plain localStorage
let devToken: string | null = null;

export async function setDevToken(token: string) {
  devToken = token;
  await setSetting("devToken", token);
}

export async function clearDevToken() {
  devToken = null;
  await setSetting("devToken", "");
}

export async function loadDevToken(): Promise<boolean> {
  const stored = await getSetting("devToken");
  if (stored) {
    devToken = stored;
    return true;
  }
  // Migration: check old localStorage key
  const legacy = localStorage.getItem("unnote_dev_token");
  if (legacy) {
    devToken = legacy;
    await setSetting("devToken", legacy);
    localStorage.removeItem("unnote_dev_token");
    return true;
  }
  return false;
}

export async function getAccessToken(): Promise<string | null> {
  // Check in-memory dev token first
  if (devToken) return devToken;

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
