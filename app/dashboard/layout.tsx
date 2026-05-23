// import Sidebar from "@/components/nav/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex">
//       <Sidebar />

//       <div className="flex-1 p-6">{children}</div>
//     </div>
//   );
// }

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
      {/* sidebar */}
      <Sidebar />

      {/* content */}
      <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <div className="h-full overflow-hidden p-6">{children}</div>
      </main>
    </div>
  );
}
