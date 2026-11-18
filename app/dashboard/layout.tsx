"use client";

import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("@/components/nav/Sidebar"), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-0 overflow-auto">
        <div className="min-h-full p-6">{children}</div>
      </main>
    </div>
  );
}
