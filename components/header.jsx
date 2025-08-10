import Link from "next/link"
import { checkUser } from "@/lib/checkUser"
import HeaderActions from "./headerActions"

export default async function Header() {
  await checkUser() // This server-side function still runs here

  return (
    <div className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo as Text */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity">
          Wealth
        </Link>

        {/* Navigation & Actions are now handled by the client component */}
        <HeaderActions />

      </nav>
    </div>
  )
}