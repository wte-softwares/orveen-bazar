"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminTheme } from "@/lib/theme/AdminThemeProvider";

/** Admin-only dark/light toggle — see lib/theme/AdminThemeProvider.tsx for why this never touches `<html>`. */
export function ThemeToggle() {
  const { theme, setTheme } = useAdminTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
