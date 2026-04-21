"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/currentUser";

/**
 * Admin layout içinde çalışır.
 * Kullanıcı yüklendikten sonra KVKK onayı yoksa /kvkk-consent'e yönlendirir.
 * Yükleme sırasında çocukları görünmez yapmaz — sadece yönlendirme yapar.
 */
export default function KvkkGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (profile && !profile.kvkkAccepted) {
      router.replace("/kvkk-consent");
    }
  }, [profile, loading, router]);

  return <>{children}</>;
}
