"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";

export default function CreateLockPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { connected, connectWallet } = useWallet();
  
  // Fixed lock state
  const [fixedAmount, setFixedAmount] = useState<string>("");
  const [fixedUnlockDate, setFixedUnlockDate] = useState<Date | undefined>(undefined);
  
  // Gradual lock state
  const [gradualAmount, setGradualAmount] = useState<string>("");
  const [gradualUnlockDate, setGradualUnlockDate] = useState<Date | undefined>(undefined);
  
  // Loading state
  const [isCreating, setIsCreating] = useState(false);

  // Handle fixed lock creation
  const handleCreateFixedLock = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a token lock",
        variant: "destructive",
      });
      return;
    }

    if (!fixedAmount || !fixedUnlockDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const unlockTimestamp = fixedUnlockDate.getTime();
    const currentTime = Date.now();

    if (unlockTimestamp <= currentTime) {
      toast({
        title: "Invalid date",
        description: "Unlock date must be in the future",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      // Call contract function here
      // const tx = await wallet.createFixedLock(...);
      
      toast({
        title: "Token lock created",
        description: "Your fixed token lock has been created successfully",
      });
      router.push("/locks");
    } catch (error) {
      console.error("Error creating token lock:", error);
      toast({
        title: "Error",
        description: "Failed to create token lock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle gradual lock creation
  const handleCreateGradualLock = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a token lock",
        variant: "destructive",
      });
      return;
    }

    if (!gradualAmount || !gradualUnlockDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const unlockTimestamp = gradualUnlockDate.getTime();
    const currentTime = Date.now();

    if (unlockTimestamp <= currentTime) {
      toast({
        title: "Invalid date",
        description: "Unlock date must be in the future",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      // Call contract function here
      // const tx = await wallet.createGradualLock(...);
      
      toast({
        title: "Token lock created",
        description: "Your gradual token lock has been created successfully",
      });
      router.push("/locks");
    } catch (error) {
      console.error("Error creating token lock:", error);
      toast({
        title: "Error",
        description: "Failed to create token lock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              You need to connect your wallet to create a token lock
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Token Lock</h1>
      
      <Tabs defaultValue="fixed" className="max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed">Fixed Lock</TabsTrigger>
          <TabsTrigger value="gradual">Gradual Lock</TabsTrigger>
        </TabsList>
        
        {/* Fixed Lock Tab */}
        <TabsContent value="fixed">
          <Card>
            <CardHeader>
              <CardTitle>Create Fixed Lock</CardTitle>
              <CardDescription>
                Lock tokens until a specific date, after which they can be fully unlocked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fixedAmount">Amount</Label>
                <Input
                  id="fixedAmount"
                  type="number"
                  placeholder="Enter amount to lock"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fixedUnlockDate">Unlock Date</Label>
                <Input
                  id="fixedUnlockDate"
                  type="date"
                  value={fixedUnlockDate ? format(fixedUnlockDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFixedUnlockDate(new Date(e.target.value));
                    }
                  }}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateFixedLock} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Fixed Lock"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Gradual Lock Tab */}
        <TabsContent value="gradual">
          <Card>
            <CardHeader>
              <CardTitle>Create Gradual Lock</CardTitle>
              <CardDescription>
                Lock tokens that will gradually unlock over time until the specified end date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gradualAmount">Amount</Label>
                <Input
                  id="gradualAmount"
                  type="number"
                  placeholder="Enter amount to lock"
                  value={gradualAmount}
                  onChange={(e) => setGradualAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gradualUnlockDate">Unlock End Date</Label>
                <Input
                  id="gradualUnlockDate"
                  type="date"
                  value={gradualUnlockDate ? format(gradualUnlockDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setGradualUnlockDate(new Date(e.target.value));
                    }
                  }}
                />
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Gradual locks begin unlocking immediately. Tokens will unlock linearly over time until the specified end date.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateGradualLock} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Gradual Lock"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
