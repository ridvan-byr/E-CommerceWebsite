"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/lib/currentUser";
import { firebaseSignOut, logoutSession } from "@/lib/api/authApi";

/**
 * Yönetim paneli: localStorage’da user profili yoksa (veya uçtuysa) HttpOnly
 * oturumu da sonlandırıp /login’e yönlendirir. Profil, cookie’den ayrı tutulduğu
 * için bu senkron zorunlu.
 */
export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useCurrentUser();
  const router = useRouter();
  const kickStarted = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (profile) {
      kickStarted.current = false;
      return;
    }
    if (kickStarted.current) return;
    kickStarted.current = true;
    (async () => {
      try {
        await logoutSession();
      } catch {
        /* */
      }
      try {
        await firebaseSignOut();
      } catch {
        /* */
      }
      router.replace("/login");
    })();
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden />
        <span className="sr-only">Oturum sonlandırılıyor</span>
      </div>
    );
  }

  return <>{children}</>;
}
