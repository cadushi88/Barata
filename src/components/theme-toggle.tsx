import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";

const cycle: Theme[] = ["system", "light", "dark"];
const icon = { system: Monitor, light: Sun, dark: Moon };
const label = { system: "System theme", light: "Light theme", dark: "Dark theme" };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = icon[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(cycle[(cycle.indexOf(theme) + 1) % cycle.length])}
      title={`${label[theme]} · click to change`}
      aria-label={`Theme: ${label[theme]}. Click to switch.`}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
    >
      <Icon size={19} strokeWidth={1.8} />
    </button>
  );
}
