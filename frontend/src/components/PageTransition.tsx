"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // key={pathname} → rota değişince div yeniden mount olur → animasyon tetiklenir.
  return (
    <div key={pathname} className="page-slide-up">
      {children}
    </div>
  );
}
