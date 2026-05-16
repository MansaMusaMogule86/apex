"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { CommandTheme } from "@/components/command-center/types";

type ShellState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  mobileRailOpen: boolean;
  setMobileRailOpen: (value: boolean) => void;
  theme: CommandTheme;
  setTheme: (value: CommandTheme) => void;
};

const ShellContext = createContext<ShellState | null>(null);

const STORAGE_KEY = "apex-command-theme";

export function CommandCenterShellProvider({ children }: PropsWithChildren) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [theme, setTheme] = useState<CommandTheme>("obsidian");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "obsidian" || stored === "carbon" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      mobileRailOpen,
      setMobileRailOpen,
      theme,
      setTheme,
    }),
    [sidebarCollapsed, mobileSidebarOpen, mobileRailOpen, theme],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useCommandCenterShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useCommandCenterShell must be used within CommandCenterShellProvider");
  }

  return context;
}
