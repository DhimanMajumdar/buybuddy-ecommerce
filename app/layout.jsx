import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/app/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BuyBuddy",
  description: "BuyBuddy is a shopping app that helps you find the best deals on the products you love.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-sky-50 text-gray-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen p-6">{children}</main>
          <Toaster position="top-center"/>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
