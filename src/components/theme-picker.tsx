import { THEMES, type Theme } from "@/lib/themes";
import { useAppStore } from "@/stores/app-store";
import { Check, Sun, Moon, Monitor } from "lucide-react";

const MODE_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

function ThemePreview({ theme, isDark }: { theme: Theme; isDark: boolean }) {
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  return (
    <div
      className="flex gap-1.5 rounded-lg p-2.5"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="h-5 w-5 rounded-full shadow-sm"
        style={{ backgroundColor: colors.primary }}
      />
      <div
        className="h-5 w-5 rounded-full shadow-sm"
        style={{ backgroundColor: colors.accent }}
      />
      <div
        className="h-5 w-5 rounded-full shadow-sm"
        style={{ backgroundColor: colors.secondary }}
      />
      <div
        className="h-5 w-3 rounded-full shadow-sm"
        style={{ backgroundColor: colors["sidebar-background"] }}
      />
    </div>
  );
}

export function ThemePicker() {
  const { currentTheme, themeMode, setTheme, setThemeMode, animationsEnabled, setAnimationsEnabled } = useAppStore();
  const previewDark = themeMode === "dark" || (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div>
        <p className="mb-2.5 text-[13px] font-medium text-foreground">Mode</p>
        <div className="flex rounded-xl border border-border/50 bg-white/20 dark:bg-white/5 p-1">
          {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setThemeMode(value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium ${
                themeMode === value
                  ? "bg-white dark:bg-white/15 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Animations toggle */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-foreground">Animations</p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">Smooth transitions and motion effects</p>
          </div>
          <button
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              animationsEnabled ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                animationsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Theme grid */}
      <div>
        <p className="mb-2.5 text-[13px] font-medium text-foreground">Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`relative rounded-xl border-2 p-3 text-left ${
                  isActive
                    ? "border-primary bg-primary/8 shadow-sm shadow-primary/10"
                    : "border-border/40 hover:border-primary/30 hover:bg-white/20 dark:hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <ThemePreview theme={theme} isDark={previewDark} />
                <p className="mt-2 text-[13px] font-medium text-foreground">
                  {theme.name}
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
