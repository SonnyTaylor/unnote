import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { msalInstance } from "@/lib/msal";
import { useAppStore } from "@/stores/app-store";
import { applyTheme } from "@/lib/themes";
import { Sidebar } from "@/components/sidebar";
import { PagePanel } from "@/components/page-panel";
import { PageViewer } from "@/components/page-viewer";
import { LoginScreen } from "@/components/login-screen";
import { ClassManager } from "@/components/class-manager";
import { ResizeHandle } from "@/components/resize-handle";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2 } from "lucide-react";

const SIDEBAR_MIN = 140;
const SIDEBAR_MAX = 420;
const PANEL_MIN = 140;
const PANEL_MAX = 420;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const {
    isAuthenticated,
    setAuth,
    loadSettings,
    themeMode,
    currentTheme,
    sidebarWidth,
    pagePanelWidth,
    setSidebarWidth,
    setPagePanelWidth,
    savePanelWidths,
  } = useAppStore();

  // Re-apply theme when system preference changes (for "system" mode)
  useEffect(() => {
    if (themeMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(currentTheme, "system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode, currentTheme]);

  useEffect(() => {
    msalInstance.initialize().then(async () => {
      // Load persisted settings
      await loadSettings();
      // Handle redirect response after login
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response?.account) {
          setAuth(true, response.account.name ?? response.account.username);
        }
      } catch {
        // Redirect handling failed
      }

      // Check if already logged in (MSAL localStorage cache or dev token)
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setAuth(true, accounts[0].name ?? accounts[0].username);
      } else if (localStorage.getItem("unnote_dev_token")) {
        setAuth(true, "Dev Mode");
      }
      setInitializing(false);
    });
  }, [setAuth]);

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar width={sidebarWidth} />
          <ResizeHandle
            onDelta={(d) =>
              setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, useAppStore.getState().sidebarWidth + d)))
            }
            onEnd={savePanelWidths}
          />
          <ErrorBoundary>
            <PagePanel width={pagePanelWidth} />
          </ErrorBoundary>
          <ResizeHandle
            onDelta={(d) =>
              setPagePanelWidth(Math.max(PANEL_MIN, Math.min(PANEL_MAX, useAppStore.getState().pagePanelWidth + d)))
            }
            onEnd={savePanelWidths}
          />
          <ErrorBoundary>
            <PageViewer />
          </ErrorBoundary>
          <ClassManager />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
