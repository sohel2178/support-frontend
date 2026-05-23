import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sultan Support",
  description:
    "A Next JS dashboard for managing Support tickets, users, and devices in a GPS tracking system.",

  icons: {
    icon: "/support.png",
    apple: "/support.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

import "./globals.css";

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body>
//         <AuthProvider>{children}</AuthProvider>
//       </body>
//     </html>
//   );
// }
