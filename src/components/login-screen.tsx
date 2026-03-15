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
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background gradient orbs for depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, hsl(271 72% 50%) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, hsl(271 72% 60%) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm text-center px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img src="/unnote.svg" alt="UnNote" className="h-20 w-20 relative z-10" />
            {/* Glow behind logo */}
            <div
              className="absolute inset-0 blur-2xl opacity-30 scale-150"
              style={{ background: "hsl(271 72% 50%)" }}
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">UnNote</h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            A better OneNote experience, everywhere.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="surface-glass surface-sheen flex items-center gap-2.5 rounded-xl border border-primary/20 px-7 py-3.5 text-[15px] font-medium text-foreground hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="h-5 w-5 text-primary" />
          )}
          Sign in with Microsoft
        </button>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Dev token input for bypassing admin consent */}
        <div className="w-full">
          <button
            onClick={() => setShowDevInput(!showDevInput)}
            className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground mx-auto"
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
                className="surface-glass w-full h-20 rounded-lg border border-border/60 px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
              />
              <button
                onClick={handleDevToken}
                disabled={!tokenInput.trim()}
                className="w-full rounded-lg bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-primary/15 disabled:opacity-50"
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
