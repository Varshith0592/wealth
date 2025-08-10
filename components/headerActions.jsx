'use client'

import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { LayoutDashboard, PenBox } from "lucide-react"
import { ModeToggle } from "./mode-toggle"

export default function HeaderActions() {
  return (
    <div className="flex items-center space-x-4">
      <SignedIn>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <LayoutDashboard size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
        </Link>
        <Link href="/transaction/create">
          <Button className="flex items-center gap-2">
            <PenBox size={18} />
            <span className="hidden md:inline">Add Transaction</span>
          </Button>
        </Link>
      </SignedIn>

      <SignedOut>
        <SignInButton forceRedirectUrl="/dashboard" mode="modal">
          <Button variant="outline">Login</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: { height: 40, width: 40 },
            },
          }}
        />
      </SignedIn>

      {/* Mode toggle at the end */}
      <ModeToggle />
    </div>
  )
}