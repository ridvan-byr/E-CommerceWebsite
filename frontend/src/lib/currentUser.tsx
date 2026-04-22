"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchCurrentUser } from "@/lib/api/authApi";
import {
  ApiRequestError,
  getStoredUserProfile,
  setStoredUserProfile,
  USER_PROFILE_CHANGED_EVENT,
  USER_PROFILE_STORAGE_KEY,
} from "@/lib/api/client";
import type { UserProfileDto } from "@/lib/api/types";

/** Odak / görünürlükte sunucu oturumunu doğrularken gereksiz /me spam’ini sınırla. */
const SESSION_VERIFY_THROTTLE_MS = 30_000;

function readProfileFromStorage(): UserProfileDto | null {
  try {
    const raw = getStoredUserProfile();
    if (raw == null || typeof raw !== "object") return null;
    return raw as UserProfileDto;
  } catch {
    return null;
  }
}

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
  const lastServerVerifyAt = useRef(0);
  const meRequestInFlight = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(readProfileFromStorage());
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeOrLogoutOn401 = useCallback(async () => {
    if (typeof window === "undefined" || meRequestInFlight.current) return;
    if (!getStoredUserProfile()) return;
    meRequestInFlight.current = true;
    try {
      const fresh = await fetchCurrentUser();
      setProfile(fresh);
      setStoredUserProfile(fresh);
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        await load();
      }
    } finally {
      meRequestInFlight.current = false;
    }
  }, [load]);

  const runServerSessionVerify = useCallback(
    async (force: boolean) => {
      if (typeof window === "undefined") return;
      if (!getStoredUserProfile()) return;
      if (!force && Date.now() - lastServerVerifyAt.current < SESSION_VERIFY_THROTTLE_MS) return;
      lastServerVerifyAt.current = Date.now();
      await fetchMeOrLogoutOn401();
    },
    [fetchMeOrLogoutOn401],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // localStorage’da profil varken cookie uçmuş olabilir; sunucu ile eşle (401 → mevcut temizlik)
  useEffect(() => {
    if (loading) return;
    if (!profile) return;
    void runServerSessionVerify(true);
  }, [loading, profile?.userId, runServerSessionVerify]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!getStoredUserProfile()) return;
      void runServerSessionVerify(false);
    };
    const onWinFocus = () => {
      if (!getStoredUserProfile()) return;
      void runServerSessionVerify(false);
    };
    window.addEventListener("focus", onWinFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onWinFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [runServerSessionVerify]);

  // Profil aynı sekmede/uygulamada değişince veya diğer sekmede localStorage
  // değişince state’i tazele (SessionGuard anında reaksiyon verebilsin).
  useEffect(() => {
    const sync = () => {
      try {
        setProfile(readProfileFromStorage());
      } catch {
        setProfile(null);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_PROFILE_STORAGE_KEY || e.key === null) sync();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    window.addEventListener("focus", sync);
    window.addEventListener("storage", onStorage);
    window.addEventListener(USER_PROFILE_CHANGED_EVENT, sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(USER_PROFILE_CHANGED_EVENT, sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
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
