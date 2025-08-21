import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/components/authContext";
import NavbarWrapper from "@/app/components/navbar_wrapper";
import Footer from "./components/footer";
import "../lib/startup"; // โหลด Cron Job ตอนเซิร์ฟเวอร์เริ่ม


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ubon Hooper Club",
  description: "Ubon Basketball Club",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
