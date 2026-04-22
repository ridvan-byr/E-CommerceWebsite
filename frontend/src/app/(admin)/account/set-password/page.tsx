"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Eski rota: hesap ayarlarına yönlendirir. */
export default function SetPasswordRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings#guvenlik");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-slate-500 text-sm">
      Ayarlara yönlendiriliyorsunuz…
    </div>
  );
}
