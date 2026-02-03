"use client";
import React from "react";
import { useTheme } from "next-themes";
import Button from "@/components/ui/Button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="text-sm"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </Button>
    </div>
  );
}
