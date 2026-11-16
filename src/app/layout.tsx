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
  title: "إدارة مهام الجوزاء",
  description: "نظام إدارة مهام فائق السرعة والبساطة لفريق منصة الجوزاء",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      {/* 
        خلفية خارجية تبرز الإطار المحيط: مسافة 5 بكسل من حواف الشاشة وحواف دائرية للموقع كاملاً 
      */}
      <body className={`${ibmPlexArabic.className} min-h-screen bg-[#eaedf3] text-[#18181c] p-[5px] box-border antialiased`}>
        <div className="min-h-[calc(100vh-10px)] rounded-[22px] bg-[#f8fafd] border border-[#d6dde8] overflow-x-hidden flex flex-col shadow-xs">
          {children}
        </div>
      </body>
    </html>
  );
}
