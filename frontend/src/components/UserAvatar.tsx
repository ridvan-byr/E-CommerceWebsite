"use client";

import { useState } from "react";
import type { UserProfileDto } from "@/lib/api/types";
import { avatarLetter, displayName } from "@/lib/currentUser";

interface UserAvatarProps {
  profile: UserProfileDto | null;
  loading?: boolean;
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Profil avatarı. Fotoğraf varsa onu, yoksa ismin baş harfini gösterir.
 * Fotoğraf yüklenemezse otomatik olarak baş harfe düşer.
 */
export default function UserAvatar({
  profile,
  loading = false,
  size = 36,
  className = "",
  title,
}: UserAvatarProps) {
  const [imgBroken, setImgBroken] = useState(false);

  const hasPhoto = !!profile?.photoUrl && !imgBroken;
  const dim = { width: size, height: size } as React.CSSProperties;
  const tooltip = title ?? (profile ? displayName(profile) : undefined);

  if (loading) {
    return (
      <div
        style={dim}
        className={`rounded-xl bg-slate-200 animate-pulse flex-shrink-0 ${className}`}
        aria-hidden
      />
    );
  }

  if (hasPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile!.photoUrl!}
        alt={profile ? displayName(profile) : "Kullanıcı"}
        title={tooltip}
        referrerPolicy="no-referrer"
        onError={() => setImgBroken(true)}
        style={dim}
        className={`rounded-xl object-cover flex-shrink-0 ring-1 ring-slate-200 ${className}`}
      />
    );
  }

  const letter = profile ? avatarLetter(profile) : "?";
  return (
    <div
      style={dim}
      title={tooltip}
      aria-hidden
      className={`rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md select-none flex-shrink-0 ${className}`}
    >
      {letter}
    </div>
  );
}
