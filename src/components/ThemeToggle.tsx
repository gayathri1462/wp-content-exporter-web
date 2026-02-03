"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-xl glass bg-background/50 hover:bg-background/80 transition-all border border-border/50 text-foreground group active:scale-95"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun size={20} className="group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
