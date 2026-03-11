import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopAdmin — E-Ticaret Yönetim Paneli",
  description: "Next.js ve .NET Core ile geliştirilmiş e-ticaret yönetim paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
