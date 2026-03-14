import { useState } from "react";
import { msalInstance, loginRequest, setDevToken } from "@/lib/msal";
import { useAppStore } from "@/stores/app-store";
import { LogIn, Loader2, Terminal } from "lucide-react";

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDevInput, setShowDevInput] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const { setAuth } = useAppStore();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await msalInstance.loginRedirect(loginRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDevToken = () => {
    if (!tokenInput.trim()) return;
    setDevToken(tokenInput.trim());
    setAuth(true, "Dev Mode");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 max-w-sm text-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/unnote.svg" alt="UnNote" className="h-20 w-20" />
          <h1 className="text-4xl font-bold text-foreground">UnNote</h1>
          <p className="text-muted-foreground text-lg">
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

        {/* Dev token input for bypassing admin consent */}
        <div className="mt-4 w-full">
          <button
            onClick={() => setShowDevInput(!showDevInput)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <Terminal className="h-3 w-3" />
            Dev: Use Graph Explorer token
          </button>

          {showDevInput && (
            <div className="mt-3 space-y-2">
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste access token from Graph Explorer..."
                className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleDevToken}
                disabled={!tokenInput.trim()}
                className="w-full rounded-md bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Connect with token
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
