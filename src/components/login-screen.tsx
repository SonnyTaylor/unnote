import { useState } from "react";
import { msalInstance, loginRequest } from "@/lib/msal";
import { useAppStore } from "@/stores/app-store";
import { LogIn, Loader2 } from "lucide-react";

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAppStore();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await msalInstance.loginPopup(loginRequest);
      if (result.account) {
        setAuth(true, result.account.name ?? result.account.username);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-foreground">UnNote</h1>
          <p className="text-muted-foreground">
            A better OneNote experience, everywhere.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          Sign in with Microsoft
        </button>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}
