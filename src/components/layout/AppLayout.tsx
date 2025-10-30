import type { PropsWithChildren } from "react";
import SidebarNav from "./SidebarNav";
import TopNav from "./TopNav";
import MobileNav from "./MobileNav";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--nh-surface)] text-[var(--nh-text-primary)]">
      <TopNav />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 pb-24 pt-8">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
