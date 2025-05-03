"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Icons } from "./icons";
import { Loader2 } from "lucide-react";

export function WalletConnect() {
  const { 
    connecting, 
    connected, 
    connectWallet, 
    disconnectWallet, 
    currentAccount, 
    walletBalance 
  } = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDisconnect = () => {
    setIsDropdownOpen(false);
    disconnectWallet();
  };

  if (!isClient) {
    return null;
  }

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (connected && currentAccount) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-border bg-background hover:bg-muted"
          onClick={toggleDropdown}
        >
          <span className="text-xs font-medium text-foreground">
            {shortenAddress(currentAccount)}
          </span>
          <Icons.chevronDown className="h-4 w-4" />
        </Button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md bg-popover p-2 shadow-lg">
            <div className="space-y-2 rounded-md p-2">
              <p className="text-xs font-medium text-muted-foreground">
                Connected Account
              </p>
              <p className="break-all text-xs text-foreground">
                {currentAccount}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Balance:
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {walletBalance !== null
                    ? `${Number(
                        (walletBalance / 1_000_000).toFixed(6)
                      ).toLocaleString()} IOTA`
                    : "Loading..."}
                </span>
              </div>
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-xs text-destructive hover:text-destructive"
                onClick={handleDisconnect}
              >
                <Icons.logout className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      variant="default"
      disabled={connecting}
      className="bg-primary hover:bg-primary/90"
    >
      {connecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Icons.wallet className="mr-2 h-4 w-4" />
          Connect
        </>
      )}
    </Button>
  );
} 