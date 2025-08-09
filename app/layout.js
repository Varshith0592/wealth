import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] })



export const metadata = {
  title: "Wealth Platform",
  description: "Personal Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className}`}
        >
          {/* Header */}
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster richColors/>
          {/* Footer */}
          <footer className="bg-blue-50 py-12">
              <p className="text-gray-600 text-sm text-center ">
                © 2025 Wealth Platform. Made by Varshith
              </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
