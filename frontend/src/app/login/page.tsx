"use client";

import LoginBrandingAside from "./LoginBrandingAside";
import LoginFormPanel from "./LoginFormPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { useLoginPage } from "./useLoginPage";

export default function LoginPage() {
  const vm = useLoginPage();

  return (
    <div className="relative flex min-h-screen bg-white dark:bg-slate-950">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle variant="minimal" />
      </div>
      <LoginBrandingAside />
      <LoginFormPanel vm={vm} />
    </div>
  );
}
