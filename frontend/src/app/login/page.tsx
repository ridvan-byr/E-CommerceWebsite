"use client";

import LoginBrandingAside from "./LoginBrandingAside";
import LoginFormPanel from "./LoginFormPanel";
import { useLoginPage } from "./useLoginPage";

export default function LoginPage() {
  const vm = useLoginPage();

  return (
    <div className="min-h-screen flex bg-white">
      <LoginBrandingAside />
      <LoginFormPanel vm={vm} />
    </div>
  );
}
