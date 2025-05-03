"use client";
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@iota/dapp-kit";
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <nav className="hidden flex-1 items-center justify-end space-x-4 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="https://docs.iotaflow.io"
                target="_blank"
                rel="noreferrer"
              >
                Docs
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="https://github.com/iotaflow/iotaflow"
                target="_blank"
                rel="noreferrer"
              >
                <Icons.gitHub className="h-4 w-4 mr-1" />
                GitHub
              </Link>
            </Button>
          </nav>
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
