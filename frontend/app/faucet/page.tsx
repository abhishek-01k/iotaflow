"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FaucetPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<{ before: number | null; after: number | null }>({
    before: null,
    after: null,
  });
  const { toast } = useToast();

  const requestTokens = async () => {
    if (!address || !address.startsWith("0x")) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid IOTA address starting with 0x",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get balance before faucet request
      const beforeResponse = await fetch(`/api/balance?address=${address}`);
      const beforeData = await beforeResponse.json();
      
      if (beforeData.error) {
        throw new Error(beforeData.error);
      }
      
      setBalance(prev => ({ ...prev, before: beforeData.balance }));

      // Make faucet request
      const faucetResponse = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const faucetData = await faucetResponse.json();
      
      if (faucetData.error) {
        throw new Error(faucetData.error);
      }

      // Get balance after faucet request
      setTimeout(async () => {
        const afterResponse = await fetch(`/api/balance?address=${address}`);
        const afterData = await afterResponse.json();
        
        if (afterData.error) {
          throw new Error(afterData.error);
        }
        
        setBalance(prev => ({ ...prev, after: afterData.balance }));
        
        toast({
          title: "Success!",
          description: `Tokens sent successfully. Your balance increased from ${beforeData.balance} to ${afterData.balance} IOTA.`,
        });
        
        setLoading(false);
      }, 5000); // Wait 5 seconds for transaction to process
    } catch (error) {
      console.error("Error requesting tokens:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request tokens. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">IOTA Faucet</CardTitle>
            <CardDescription>Request test IOTA tokens for development purposes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">IOTA Address</Label>
                <Input
                  id="address"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              {(balance.before !== null || balance.after !== null) && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Balance Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Before</p>
                      <p className="font-mono">{balance.before !== null ? `${balance.before} IOTA` : "Loading..."}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">After</p>
                      <p className="font-mono">{balance.after !== null ? `${balance.after} IOTA` : "Waiting..."}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={requestTokens} 
              disabled={loading || !address} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting Tokens...
                </>
              ) : (
                <>
                  Request Tokens
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 