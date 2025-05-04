"use client";

import React from "react";
import { AirdropForm } from "@/components/airdrop/airdrop-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectButton } from "@iota/dapp-kit";

export default function CreateAirdropPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Airdrop</h1>
          <p className="text-muted-foreground mt-1">
            Distribute tokens to multiple recipients at once
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <AirdropForm />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About Airdrops</CardTitle>
              <CardDescription>How token airdrops work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">Instant Airdrops</h3>
                <p className="text-muted-foreground mt-1">
                  Tokens are distributed to recipients immediately, in a single transaction.
                  This is ideal for community rewards, giveaways, and user acquisition.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Vested Airdrops</h3>
                <p className="text-muted-foreground mt-1">
                  Tokens are locked and released gradually over time according to a vesting schedule.
                  This is ideal for team allocations, advisor compensation, and investor distributions.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Recipient Format</h3>
                <p className="text-muted-foreground mt-1">
                  Enter one recipient address and amount per line, separated by a comma:
                </p>
                <pre className="bg-muted p-2 rounded-md mt-1 text-xs overflow-x-auto whitespace-pre">
                  0x123...abc, 100{"\n"}
                  0x456...def, 200{"\n"}
                  0x789...ghi, 300{"\n"}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">Gas Fees</h3>
                <p className="text-muted-foreground mt-1">
                  Creating an airdrop requires a small amount of IOTA for gas fees, 
                  plus the total amount of tokens you wish to distribute.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 