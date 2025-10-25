import type { PropsWithChildren } from "react";
import SidebarNav from "./SidebarNav";
import TopNav from "./TopNav";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <SidebarNav />
      <div className="flex flex-1 flex-col lg:pl-72">
        <TopNav />
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-8 lg:px-10 xl:px-12">{children}</main>
      </div>
    </div>
  );
}

