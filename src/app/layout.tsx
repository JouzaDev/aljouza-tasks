import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة الجوزاء | نظام إدارة المهام والأهداف",
  description: "نظام إدارة مهام فائق السرعة والبساطة لفريق منصة الجوزاء",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <body className={`${ibmPlexArabic.className} min-h-screen bg-[#fcfbfe] text-[#1e112a] antialiased`}>
        {children}
      </body>
    </html>
  );
}
