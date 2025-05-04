"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@iota/dapp-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentWallet } from "@iota/dapp-kit";
import { IotaWallet } from "@/lib/iota";
import { Loader2, Sparkles, RefreshCw, Clock, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data structure for airdrops
type Airdrop = {
  id: string;
  creator: string;
  totalAmount: number;
  distributedAmount: number;
  startTimestamp: number;
  endTimestamp: number;
  airdropType: 'instant' | 'vested';
  status: 'active' | 'closed';
  recipients: number;
  createdAt: number;
};

export default function AirdropsPage() {
  const { isConnected : connected } = useCurrentWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);

  // Fetch airdrops when the wallet is connected
  useEffect(() => {
    if (connected) {
      fetchAirdrops();
    } else {
      setAirdrops([]);
      setIsLoading(false);
    }
  }, [connected]);

  // Function to fetch airdrops from the contract
  async function fetchAirdrops() {
    try {
      setIsLoading(true);
      
      // TODO: Replace this mock data with actual contract call when API is ready
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = Date.now();
      const mockAirdrops: Airdrop[] = [
        {
          id: "0x1234567890abcdef1234567890abcdef",
          creator: "0xd69b6a10dcdf0d63e0ea6382c5c81516104f5b7b81d3d7a98a3724a8982db237",
          totalAmount: 10000,
          distributedAmount: 10000,
          startTimestamp: now - 86400000 * 7, // 7 days ago
          endTimestamp: now - 86400000 * 7, // 7 days ago (instant)
          airdropType: 'instant',
          status: 'closed',
          recipients: 25,
          createdAt: now - 86400000 * 7
        },
        {
          id: "0xabcdef1234567890abcdef1234567890",
          creator: "0xd69b6a10dcdf0d63e0ea6382c5c81516104f5b7b81d3d7a98a3724a8982db237",
          totalAmount: 5000,
          distributedAmount: 2500,
          startTimestamp: now - 86400000 * 3, // 3 days ago
          endTimestamp: now + 86400000 * 27, // 27 days from now
          airdropType: 'vested',
          status: 'active',
          recipients: 10,
          createdAt: now - 86400000 * 3
        },
        {
          id: "0x7890abcdef1234567890abcdef123456",
          creator: "0xd69b6a10dcdf0d63e0ea6382c5c81516104f5b7b81d3d7a98a3724a8982db237",
          totalAmount: 2000,
          distributedAmount: 2000,
          startTimestamp: now - 86400000, // yesterday
          endTimestamp: now - 86400000, // yesterday (instant)
          airdropType: 'instant',
          status: 'closed',
          recipients: 5,
          createdAt: now - 86400000
        }
      ];
      
      setAirdrops(mockAirdrops);
    } catch (error) {
      console.error("Error fetching airdrops:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Function to close an airdrop
  async function closeAirdrop(airdropId: string) {
    try {
      // Mock closure for now
      // In real implementation, call contract to close airdrop
      setAirdrops(airdrops.map(airdrop => 
        airdrop.id === airdropId ? { ...airdrop, status: 'closed' } : airdrop
      ));
    } catch (error) {
      console.error("Error closing airdrop:", error);
    }
  }

  // Helper to format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Airdrops</h1>
          <p className="text-muted-foreground mt-1">
            Manage your token airdrops
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={fetchAirdrops} 
            disabled={isLoading || !connected}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {!connected && (
        <Alert className="mb-6">
          <AlertTitle>Connect your wallet</AlertTitle>
          <AlertDescription>
            Connect your IOTA wallet to view and manage your airdrops.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" asChild>
            <Link href="/airdrops/create">
              <Sparkles className="h-4 w-4" />
              Create Airdrop
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {airdrops.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No airdrops found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {connected 
                    ? "You haven't created any airdrops yet. Create your first airdrop to distribute tokens."
                    : "Connect your wallet to view your airdrops."}
                </p>
                {connected && (
                  <Button className="mt-4" asChild>
                    <Link href="/airdrops/create">Create Airdrop</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {airdrops.map((airdrop) => (
                <Card key={airdrop.id} className={airdrop.status === 'closed' ? "opacity-70" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Airdrop {formatAddress(airdrop.id)}
                          <Badge variant="outline" className={
                            airdrop.airdropType === 'instant'
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          }>
                            {airdrop.airdropType.charAt(0).toUpperCase() + airdrop.airdropType.slice(1)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={
                              airdrop.status === 'active' 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }
                          >
                            {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Created on {formatDate(airdrop.createdAt)}
                        </CardDescription>
                      </div>
                      <div className="text-lg font-bold">
                        {airdrop.totalAmount} IOTA
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Distribution Progress</div>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${(airdrop.distributedAmount / airdrop.totalAmount) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm whitespace-nowrap">
                            {Math.round((airdrop.distributedAmount / airdrop.totalAmount) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Recipients</div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {airdrop.recipients} {airdrop.recipients === 1 ? 'address' : 'addresses'}
                        </div>
                      </div>
                      
                      {airdrop.airdropType === 'vested' && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Vesting Period</div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDate(airdrop.startTimestamp)} - {formatDate(airdrop.endTimestamp)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {airdrop.status === 'active' && (
                      <Button 
                        variant="outline" 
                        className="gap-2" 
                        onClick={() => closeAirdrop(airdrop.id)}
                      >
                        Close Airdrop
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
