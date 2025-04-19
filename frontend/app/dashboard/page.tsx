"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { IotaWallet } from "@/lib/iota";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function DashboardPage() {
  const { connected } = useWallet();
  const [contractModules, setContractModules] = useState<string[]>([]);
  
  useEffect(() => {
    // Set the contract modules based on the deployed package
    setContractModules(["airdrop", "payment", "token_lock", "vesting"]);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">IoTaFlow Dashboard</h1>
      </div>
      
      {!connected && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Connect your wallet</AlertTitle>
          <AlertDescription>
            Connect your IOTA wallet to interact with the token distribution platform.
          </AlertDescription>
        </Alert>
      )}
      
      {connected && (
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Contract Deployed
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </Badge>
              </CardTitle>
              <CardDescription>
                Package ID: {IotaWallet.getPackageId()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contractModules.map((module) => (
                  <Badge key={module} variant="secondary" className="text-xs">
                    {module}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid gap-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="token-distribution">Token Distribution</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Token Airdrops</CardTitle>
                  <CardDescription>Distribute tokens to multiple recipients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M12 2v7.5"/><path d="M10 4.5l2-2 2 2"/><path d="m17.5 20.5-.32.16a1 1 0 0 1-1.3-.58l-1.85-4.94-2.27 6.06a1 1 0 0 1-1.58.52l-.33-.24"/><path d="m8.57 16.3-.33.95a1 1 0 0 1-1.74.26L6 17"/><path d="M2 14.6a2.5 2.5 0 0 1 4-2M22 14.6a2.5 2.5 0 0 0-4-2"/></svg>
                    </div>
                    <div>
                      <div className="text-4xl font-bold">2</div>
                      <div className="text-sm text-muted-foreground">Airdrop Methods</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/airdrops/create">
                    <Button>Create Airdrop</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Token Vesting</CardTitle>
                  <CardDescription>Create vesting schedules for token releases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400"><rect width="6" height="14" x="4" y="5" rx="2"/><rect width="6" height="10" x="14" y="9" rx="2"/><path d="M22 19h-8"/><path d="M2 19h8"/><path d="M12 5v14"/></svg>
                    </div>
                    <div>
                      <div className="text-4xl font-bold">2</div>
                      <div className="text-sm text-muted-foreground">Vesting Types</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/vesting/create">
                    <Button>Create Vesting</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Token Locks</CardTitle>
                  <CardDescription>Lock tokens with custom unlock schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div>
                      <div className="text-4xl font-bold">2</div>
                      <div className="text-sm text-muted-foreground">Lock Types</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/locks/create">
                    <Button>Create Lock</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest on-chain activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-gray-500">
                    {connected ? "No recent transactions found" : "Connect your wallet to view transactions"}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Refresh</Button>
                  <Link href="/transactions/history">
                    <Button variant="ghost">View All</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Link href="/airdrops/create">
                      <Button className="w-full justify-start" variant="outline">
                        Create Token Airdrop
                      </Button>
                    </Link>
                    <Link href="/vesting/create">
                      <Button className="w-full justify-start" variant="outline">
                        Set Up Vesting Schedule
                      </Button>
                    </Link>
                    <Link href="/locks/create">
                      <Button className="w-full justify-start" variant="outline">
                        Lock Tokens
                      </Button>
                    </Link>
                    <Link href="/payments/send">
                      <Button className="w-full justify-start" variant="outline">
                        Schedule Payment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="token-distribution" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Token Distribution Methods</CardTitle>
                    <CardDescription>Manage your token distribution strategies</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link href="/airdrops/create">
                    <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">Airdrops</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Distribute tokens to multiple recipients at once, with instant or vested schedules.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/vesting/create">
                    <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">Vesting</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Create linear or cliff vesting schedules to gradually release tokens over time.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/locks/create">
                    <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">Token Locks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Lock tokens until specific dates or with gradual unlock mechanisms.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/payments/create">
                    <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">Payments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Schedule one-time or recurring payments with customizable parameters.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Payment Management</CardTitle>
                    <CardDescription>Manage your payment schedules and configurations</CardDescription>
                  </div>
                  <Link href="/payments/create">
                    <Button>Create Payment</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center p-16 text-gray-500">
                  No payment schedules found
                  <p className="mt-2 text-sm">
                    Create a payment schedule to automate token transfers
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Analytics</CardTitle>
                <CardDescription>Track your token distribution activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-16 text-gray-500">
                  {connected 
                    ? "No analytics data available yet. Start using the platform to generate analytics." 
                    : "Connect your wallet to view analytics data"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 