export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

const unnoteTheme: Theme = {
  id: "unnote",
  name: "UnNote",
  description: "Default purple theme",
  colors: {
    light: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(0 0% 3.9%)",
      card: "hsl(0 0% 100%)",
      "card-foreground": "hsl(0 0% 3.9%)",
      popover: "hsl(0 0% 100%)",
      "popover-foreground": "hsl(0 0% 3.9%)",
      primary: "hsl(262 83% 58%)",
      "primary-foreground": "hsl(0 0% 98%)",
      secondary: "hsl(0 0% 96.1%)",
      "secondary-foreground": "hsl(0 0% 9%)",
      muted: "hsl(0 0% 96.1%)",
      "muted-foreground": "hsl(0 0% 45.1%)",
      accent: "hsl(0 0% 96.1%)",
      "accent-foreground": "hsl(0 0% 9%)",
      destructive: "hsl(0 84.2% 60.2%)",
      "destructive-foreground": "hsl(0 0% 98%)",
      border: "hsl(0 0% 89.8%)",
      input: "hsl(0 0% 89.8%)",
      ring: "hsl(262 83% 58%)",
      "sidebar-background": "hsl(0 0% 98%)",
      "sidebar-foreground": "hsl(0 0% 3.9%)",
      "sidebar-primary": "hsl(262 83% 58%)",
      "sidebar-primary-foreground": "hsl(0 0% 98%)",
      "sidebar-accent": "hsl(0 0% 96.1%)",
      "sidebar-accent-foreground": "hsl(0 0% 9%)",
      "sidebar-border": "hsl(0 0% 89.8%)",
      "sidebar-ring": "hsl(262 83% 58%)",
    },
    dark: {
      background: "hsl(0 0% 3.9%)",
      foreground: "hsl(0 0% 98%)",
      card: "hsl(0 0% 3.9%)",
      "card-foreground": "hsl(0 0% 98%)",
      popover: "hsl(0 0% 3.9%)",
      "popover-foreground": "hsl(0 0% 98%)",
      primary: "hsl(262 83% 58%)",
      "primary-foreground": "hsl(0 0% 98%)",
      secondary: "hsl(0 0% 14.9%)",
      "secondary-foreground": "hsl(0 0% 98%)",
      muted: "hsl(0 0% 14.9%)",
      "muted-foreground": "hsl(0 0% 63.9%)",
      accent: "hsl(0 0% 14.9%)",
      "accent-foreground": "hsl(0 0% 98%)",
      destructive: "hsl(0 62.8% 30.6%)",
      "destructive-foreground": "hsl(0 0% 98%)",
      border: "hsl(0 0% 14.9%)",
      input: "hsl(0 0% 14.9%)",
      ring: "hsl(262 83% 58%)",
      "sidebar-background": "hsl(0 0% 5%)",
      "sidebar-foreground": "hsl(0 0% 98%)",
      "sidebar-primary": "hsl(262 83% 58%)",
      "sidebar-primary-foreground": "hsl(0 0% 98%)",
      "sidebar-accent": "hsl(0 0% 14.9%)",
      "sidebar-accent-foreground": "hsl(0 0% 98%)",
      "sidebar-border": "hsl(0 0% 14.9%)",
      "sidebar-ring": "hsl(262 83% 58%)",
    },
  },
};

const claudeTheme: Theme = {
  id: "claude",
  name: "Claude",
  description: "Warm brown and orange tones",
  colors: {
    light: {
      background: "oklch(0.9818 0.0054 95.0986)",
      foreground: "oklch(0.3438 0.0269 95.7226)",
      card: "oklch(0.9818 0.0054 95.0986)",
      "card-foreground": "oklch(0.1908 0.0020 106.5859)",
      popover: "oklch(1.0000 0 0)",
      "popover-foreground": "oklch(0.2671 0.0196 98.9390)",
      primary: "oklch(0.6171 0.1375 39.0427)",
      "primary-foreground": "oklch(1.0000 0 0)",
      secondary: "oklch(0.9245 0.0138 92.9892)",
      "secondary-foreground": "oklch(0.4334 0.0177 98.6048)",
      muted: "oklch(0.9341 0.0153 90.2390)",
      "muted-foreground": "oklch(0.6059 0.0075 97.4233)",
      accent: "oklch(0.9245 0.0138 92.9892)",
      "accent-foreground": "oklch(0.2671 0.0196 98.9390)",
      destructive: "oklch(0.1908 0.0020 106.5859)",
      "destructive-foreground": "oklch(1.0000 0 0)",
      border: "oklch(0.8847 0.0069 97.3627)",
      input: "oklch(0.7621 0.0156 98.3528)",
      ring: "oklch(0.6171 0.1375 39.0427)",
      "sidebar-background": "oklch(0.9663 0.0080 98.8792)",
      "sidebar-foreground": "oklch(0.3590 0.0051 106.6524)",
      "sidebar-primary": "oklch(0.6171 0.1375 39.0427)",
      "sidebar-primary-foreground": "oklch(0.9881 0 0)",
      "sidebar-accent": "oklch(0.9245 0.0138 92.9892)",
      "sidebar-accent-foreground": "oklch(0.3250 0 0)",
      "sidebar-border": "oklch(0.9401 0 0)",
      "sidebar-ring": "oklch(0.7731 0 0)",
    },
    dark: {
      background: "oklch(0.2679 0.0036 106.6427)",
      foreground: "oklch(0.8074 0.0142 93.0137)",
      card: "oklch(0.2679 0.0036 106.6427)",
      "card-foreground": "oklch(0.9818 0.0054 95.0986)",
      popover: "oklch(0.3085 0.0035 106.6039)",
      "popover-foreground": "oklch(0.9211 0.0040 106.4781)",
      primary: "oklch(0.6724 0.1308 38.7559)",
      "primary-foreground": "oklch(1.0000 0 0)",
      secondary: "oklch(0.9818 0.0054 95.0986)",
      "secondary-foreground": "oklch(0.3085 0.0035 106.6039)",
      muted: "oklch(0.2213 0.0038 106.7070)",
      "muted-foreground": "oklch(0.7713 0.0169 99.0657)",
      accent: "oklch(0.2130 0.0078 95.4245)",
      "accent-foreground": "oklch(0.9663 0.0080 98.8792)",
      destructive: "oklch(0.6368 0.2078 25.3313)",
      "destructive-foreground": "oklch(1.0000 0 0)",
      border: "oklch(0.3618 0.0101 106.8928)",
      input: "oklch(0.4336 0.0113 100.2195)",
      ring: "oklch(0.6724 0.1308 38.7559)",
      "sidebar-background": "oklch(0.2357 0.0024 67.7077)",
      "sidebar-foreground": "oklch(0.8074 0.0142 93.0137)",
      "sidebar-primary": "oklch(0.3250 0 0)",
      "sidebar-primary-foreground": "oklch(0.9881 0 0)",
      "sidebar-accent": "oklch(0.1680 0.0020 106.6177)",
      "sidebar-accent-foreground": "oklch(0.8074 0.0142 93.0137)",
      "sidebar-border": "oklch(0.9401 0 0)",
      "sidebar-ring": "oklch(0.7731 0 0)",
    },
  },
};

const catppuccinTheme: Theme = {
  id: "catppuccin",
  name: "Catppuccin",
  description: "Pastel purple and blue tones",
  colors: {
    light: {
      background: "oklch(0.9578 0.0058 264.5321)",
      foreground: "oklch(0.4355 0.0430 279.3250)",
      card: "oklch(1.0000 0 0)",
      "card-foreground": "oklch(0.4355 0.0430 279.3250)",
      popover: "oklch(0.8575 0.0145 268.4756)",
      "popover-foreground": "oklch(0.4355 0.0430 279.3250)",
      primary: "oklch(0.5547 0.2503 297.0156)",
      "primary-foreground": "oklch(1.0000 0 0)",
      secondary: "oklch(0.8575 0.0145 268.4756)",
      "secondary-foreground": "oklch(0.4355 0.0430 279.3250)",
      muted: "oklch(0.9060 0.0117 264.5071)",
      "muted-foreground": "oklch(0.5471 0.0343 279.0837)",
      accent: "oklch(0.6820 0.1448 235.3822)",
      "accent-foreground": "oklch(1.0000 0 0)",
      destructive: "oklch(0.5505 0.2155 19.8095)",
      "destructive-foreground": "oklch(1.0000 0 0)",
      border: "oklch(0.8083 0.0174 271.1982)",
      input: "oklch(0.8575 0.0145 268.4756)",
      ring: "oklch(0.5547 0.2503 297.0156)",
      "sidebar-background": "oklch(0.9335 0.0087 264.5206)",
      "sidebar-foreground": "oklch(0.4355 0.0430 279.3250)",
      "sidebar-primary": "oklch(0.5547 0.2503 297.0156)",
      "sidebar-primary-foreground": "oklch(1.0000 0 0)",
      "sidebar-accent": "oklch(0.6820 0.1448 235.3822)",
      "sidebar-accent-foreground": "oklch(1.0000 0 0)",
      "sidebar-border": "oklch(0.8083 0.0174 271.1982)",
      "sidebar-ring": "oklch(0.5547 0.2503 297.0156)",
    },
    dark: {
      background: "oklch(0.2155 0.0254 284.0647)",
      foreground: "oklch(0.8787 0.0426 272.2767)",
      card: "oklch(0.2429 0.0304 283.9110)",
      "card-foreground": "oklch(0.8787 0.0426 272.2767)",
      popover: "oklch(0.4037 0.0320 280.1520)",
      "popover-foreground": "oklch(0.8787 0.0426 272.2767)",
      primary: "oklch(0.7871 0.1187 304.7693)",
      "primary-foreground": "oklch(0.2429 0.0304 283.9110)",
      secondary: "oklch(0.4765 0.0340 278.6430)",
      "secondary-foreground": "oklch(0.8787 0.0426 272.2767)",
      muted: "oklch(0.2973 0.0294 276.2144)",
      "muted-foreground": "oklch(0.7510 0.0396 273.9320)",
      accent: "oklch(0.8467 0.0833 210.2545)",
      "accent-foreground": "oklch(0.2429 0.0304 283.9110)",
      destructive: "oklch(0.7556 0.1297 2.7642)",
      "destructive-foreground": "oklch(0.2429 0.0304 283.9110)",
      border: "oklch(0.3240 0.0319 281.9784)",
      input: "oklch(0.3240 0.0319 281.9784)",
      ring: "oklch(0.7871 0.1187 304.7693)",
      "sidebar-background": "oklch(0.1828 0.0204 284.2039)",
      "sidebar-foreground": "oklch(0.8787 0.0426 272.2767)",
      "sidebar-primary": "oklch(0.7871 0.1187 304.7693)",
      "sidebar-primary-foreground": "oklch(0.2429 0.0304 283.9110)",
      "sidebar-accent": "oklch(0.8467 0.0833 210.2545)",
      "sidebar-accent-foreground": "oklch(0.2429 0.0304 283.9110)",
      "sidebar-border": "oklch(0.4037 0.0320 280.1520)",
      "sidebar-ring": "oklch(0.7871 0.1187 304.7693)",
    },
  },
};

// Nord palette: https://www.nordtheme.com/
const nordTheme: Theme = {
  id: "nord",
  name: "Nord",
  description: "Cool blue-gray arctic tones",
  colors: {
    light: {
      background: "hsl(219 28% 96%)",
      foreground: "hsl(220 16% 22%)",
      card: "hsl(219 28% 98%)",
      "card-foreground": "hsl(220 16% 22%)",
      popover: "hsl(219 28% 98%)",
      "popover-foreground": "hsl(220 16% 22%)",
      primary: "hsl(213 32% 52%)",
      "primary-foreground": "hsl(219 28% 98%)",
      secondary: "hsl(219 28% 88%)",
      "secondary-foreground": "hsl(220 16% 22%)",
      muted: "hsl(219 28% 90%)",
      "muted-foreground": "hsl(220 16% 44%)",
      accent: "hsl(179 25% 65%)",
      "accent-foreground": "hsl(220 16% 22%)",
      destructive: "hsl(354 42% 56%)",
      "destructive-foreground": "hsl(219 28% 98%)",
      border: "hsl(219 28% 83%)",
      input: "hsl(219 28% 83%)",
      ring: "hsl(213 32% 52%)",
      "sidebar-background": "hsl(219 28% 93%)",
      "sidebar-foreground": "hsl(220 16% 22%)",
      "sidebar-primary": "hsl(213 32% 52%)",
      "sidebar-primary-foreground": "hsl(219 28% 98%)",
      "sidebar-accent": "hsl(219 28% 88%)",
      "sidebar-accent-foreground": "hsl(220 16% 22%)",
      "sidebar-border": "hsl(219 28% 83%)",
      "sidebar-ring": "hsl(213 32% 52%)",
    },
    dark: {
      background: "hsl(220 16% 22%)",
      foreground: "hsl(219 28% 88%)",
      card: "hsl(222 16% 28%)",
      "card-foreground": "hsl(219 28% 88%)",
      popover: "hsl(222 16% 28%)",
      "popover-foreground": "hsl(219 28% 88%)",
      primary: "hsl(213 32% 52%)",
      "primary-foreground": "hsl(219 28% 96%)",
      secondary: "hsl(220 17% 32%)",
      "secondary-foreground": "hsl(219 28% 88%)",
      muted: "hsl(220 17% 32%)",
      "muted-foreground": "hsl(219 28% 65%)",
      accent: "hsl(179 25% 65%)",
      "accent-foreground": "hsl(220 16% 22%)",
      destructive: "hsl(354 42% 56%)",
      "destructive-foreground": "hsl(219 28% 96%)",
      border: "hsl(220 17% 32%)",
      input: "hsl(220 17% 32%)",
      ring: "hsl(213 32% 52%)",
      "sidebar-background": "hsl(220 16% 18%)",
      "sidebar-foreground": "hsl(219 28% 88%)",
      "sidebar-primary": "hsl(213 32% 52%)",
      "sidebar-primary-foreground": "hsl(219 28% 96%)",
      "sidebar-accent": "hsl(220 17% 32%)",
      "sidebar-accent-foreground": "hsl(219 28% 88%)",
      "sidebar-border": "hsl(220 17% 32%)",
      "sidebar-ring": "hsl(213 32% 52%)",
    },
  },
};

// Rose Pine palette: https://rosepinetheme.com/
const rosePineTheme: Theme = {
  id: "rose-pine",
  name: "Rose Pine",
  description: "Elegant dark with muted roses",
  colors: {
    light: {
      background: "hsl(32 57% 95%)",
      foreground: "hsl(248 19% 40%)",
      card: "hsl(32 57% 97%)",
      "card-foreground": "hsl(248 19% 40%)",
      popover: "hsl(32 57% 97%)",
      "popover-foreground": "hsl(248 19% 40%)",
      primary: "hsl(2 55% 63%)",
      "primary-foreground": "hsl(32 57% 97%)",
      secondary: "hsl(32 57% 88%)",
      "secondary-foreground": "hsl(248 19% 40%)",
      muted: "hsl(32 57% 90%)",
      "muted-foreground": "hsl(248 12% 57%)",
      accent: "hsl(280 36% 63%)",
      "accent-foreground": "hsl(32 57% 97%)",
      destructive: "hsl(343 35% 55%)",
      "destructive-foreground": "hsl(32 57% 97%)",
      border: "hsl(32 57% 82%)",
      input: "hsl(32 57% 82%)",
      ring: "hsl(2 55% 63%)",
      "sidebar-background": "hsl(32 57% 92%)",
      "sidebar-foreground": "hsl(248 19% 40%)",
      "sidebar-primary": "hsl(2 55% 63%)",
      "sidebar-primary-foreground": "hsl(32 57% 97%)",
      "sidebar-accent": "hsl(32 57% 88%)",
      "sidebar-accent-foreground": "hsl(248 19% 40%)",
      "sidebar-border": "hsl(32 57% 82%)",
      "sidebar-ring": "hsl(2 55% 63%)",
    },
    dark: {
      background: "hsl(249 22% 12%)",
      foreground: "hsl(245 50% 91%)",
      card: "hsl(247 23% 15%)",
      "card-foreground": "hsl(245 50% 91%)",
      popover: "hsl(247 23% 15%)",
      "popover-foreground": "hsl(245 50% 91%)",
      primary: "hsl(2 55% 63%)",
      "primary-foreground": "hsl(245 50% 91%)",
      secondary: "hsl(249 15% 28%)",
      "secondary-foreground": "hsl(245 50% 91%)",
      muted: "hsl(249 15% 22%)",
      "muted-foreground": "hsl(248 15% 61%)",
      accent: "hsl(280 36% 63%)",
      "accent-foreground": "hsl(245 50% 91%)",
      destructive: "hsl(343 35% 55%)",
      "destructive-foreground": "hsl(245 50% 91%)",
      border: "hsl(249 15% 28%)",
      input: "hsl(249 15% 28%)",
      ring: "hsl(2 55% 63%)",
      "sidebar-background": "hsl(249 22% 9%)",
      "sidebar-foreground": "hsl(245 50% 91%)",
      "sidebar-primary": "hsl(2 55% 63%)",
      "sidebar-primary-foreground": "hsl(245 50% 91%)",
      "sidebar-accent": "hsl(249 15% 22%)",
      "sidebar-accent-foreground": "hsl(245 50% 91%)",
      "sidebar-border": "hsl(249 15% 28%)",
      "sidebar-ring": "hsl(2 55% 63%)",
    },
  },
};

export const THEMES: Theme[] = [
  unnoteTheme,
  claudeTheme,
  catppuccinTheme,
  nordTheme,
  rosePineTheme,
];

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

export function getSystemPreference(): "light" | "dark" {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

export function applyTheme(
  themeId: string,
  mode: "light" | "dark" | "system"
) {
  const theme = getThemeById(themeId);
  if (!theme) return;

  const resolvedMode = mode === "system" ? getSystemPreference() : mode;
  const colors = resolvedMode === "dark" ? theme.colors.dark : theme.colors.light;

  // Toggle dark class
  if (resolvedMode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Set each CSS variable on :root
  for (const [key, value] of Object.entries(colors)) {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  }
}
