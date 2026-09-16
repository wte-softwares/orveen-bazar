"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNavigation } from "./MobileNavigation";
import { WhatsAppButton } from "./WhatsAppButton";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main id="main-content" className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <TopBar />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <MobileNavigation />
      <WhatsAppButton />
    </>
  );
}
