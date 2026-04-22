"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginWithFirebase, loginWithGoogle, resendVerificationEmail } from "@/lib/api/authApi";
import { setStoredUserProfile } from "@/lib/api/client";
import { mapLoginFailure } from "@/lib/auth/loginErrorMapping";

export function useLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const resetLoading = () => {
      setEmailLoading(false);
      setGoogleLoading(false);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") resetLoading();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) resetLoading();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const applyFailure = useCallback((err: unknown, emailFallback: string) => {
    const mapped = mapLoginFailure(err, emailFallback);
    if (mapped.type === "unverified") {
      setUnverifiedEmail(mapped.email);
      return;
    }
    setError(mapped.message);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);
    setResendSent(false);
    if (!email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    const trimmed = email.trim();
    setEmailLoading(true);
    try {
      const result = await loginWithFirebase(trimmed, password);
      setStoredUserProfile(result.user);
      router.push("/dashboard");
    } catch (err) {
      if (mountedRef.current) applyFailure(err, trimmed);
    } finally {
      if (mountedRef.current) setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setUnverifiedEmail(null);
    setResendSent(false);
    setGoogleLoading(true);

    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) setGoogleLoading(false);
    }, 90_000);

    try {
      const result = await loginWithGoogle();
      setStoredUserProfile(result.user);
      router.push("/dashboard");
    } catch (err) {
      if (mountedRef.current) applyFailure(err, email.trim());
    } finally {
      clearTimeout(safetyTimer);
      if (mountedRef.current) setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendLoading) return;
    setResendLoading(true);
    try {
      await resendVerificationEmail(unverifiedEmail);
      setResendSent(true);
    } catch {
      /* güvenli yanıt */
    } finally {
      setResendLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    emailLoading,
    googleLoading,
    error,
    unverifiedEmail,
    resendLoading,
    resendSent,
    handleLogin,
    handleGoogleLogin,
    handleResendVerification,
  };
}

export type LoginPageViewModel = ReturnType<typeof useLoginPage>;
