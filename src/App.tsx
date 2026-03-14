import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { msalInstance } from "@/lib/msal";
import { useAppStore } from "@/stores/app-store";
import { Sidebar } from "@/components/sidebar";
import { PageViewer } from "@/components/page-viewer";
import { LoginScreen } from "@/components/login-screen";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const { isAuthenticated, setAuth } = useAppStore();

  useEffect(() => {
    msalInstance.initialize().then(() => {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setAuth(true, accounts[0].name ?? accounts[0].username);
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
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <PageViewer />
      </div>
    </QueryClientProvider>
  );
}
