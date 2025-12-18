import { Inter } from "next/font/google";
import "./globals.css";
import HeaderServer from "@/components/header-server";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import LayoutVisibilityClient from "@/components/layout-visibility-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Insightivia",
  description: "Smarter spending starts with Insightivia",
};

export default function RootLayout({ children }) {
  const footer = (
    <footer className="bg-blue-50 py-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm border-t">
        <p>© {new Date().getFullYear()} Insightivia. All rights reserved.</p>
      </div>
    </footer>
  );

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* Header & Footer rendered by server layout */}
          <HeaderServer />
          <main className="min-h-screen">
            {/* This client wrapper just hides them for /cha-ching */}
            <LayoutVisibilityClient footer={footer}>{children}</LayoutVisibilityClient>
          </main>
          {footer}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
