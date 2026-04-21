"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser } from "@/lib/api/authApi";
import { getStoredAccessToken } from "@/lib/api/client";
import type { UserProfileDto } from "@/lib/api/types";

interface CurrentUserContextValue {
  profile: UserProfileDto | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  profile: null,
  loading: true,
  refresh: async () => {},
});

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!getStoredAccessToken()) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const p = await fetchCurrentUser();
      setProfile(p);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CurrentUserContext.Provider value={{ profile, loading, refresh: load }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  return useContext(CurrentUserContext);
}

export function displayName(p: UserProfileDto): string {
  const parts = [p.name?.trim(), p.surname?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : p.email;
}

export function avatarLetter(p: UserProfileDto): string {
  const n = p.name?.trim();
  if (n) return n[0].toLocaleUpperCase("tr-TR");
  const s = p.surname?.trim();
  if (s) return s[0].toLocaleUpperCase("tr-TR");
  const e = p.email?.trim();
  if (e) return e[0].toUpperCase();
  return "?";
}
