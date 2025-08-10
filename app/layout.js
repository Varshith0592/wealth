import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] })



export const metadata = {
  title: "Wealth Platform",
  description: "Personal Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className}`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header */}
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster richColors />
            {/* Footer */}
            <footer className="bg-muted py-12">
              <p className="text-muted-foreground text-sm text-center">
                © 2025 Wealth Platform. Made by Varshith
              </p>
            </footer>


          </ThemeProvider>


        </body>
      </html>
    </ClerkProvider>
  );
}
