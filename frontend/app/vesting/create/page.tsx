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

export default function CreateVestingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { connected, connectWallet } = useWallet();
  
  // Linear vesting state
  const [linearAmount, setLinearAmount] = useState<string>("");
  const [linearRecipient, setLinearRecipient] = useState<string>("");
  const [linearStartDate, setLinearStartDate] = useState<Date | undefined>(undefined);
  const [linearEndDate, setLinearEndDate] = useState<Date | undefined>(undefined);
  
  // Cliff vesting state
  const [cliffAmount, setCliffAmount] = useState<string>("");
  const [cliffRecipient, setCliffRecipient] = useState<string>("");
  const [cliffStartDate, setCliffStartDate] = useState<Date | undefined>(undefined);
  const [cliffDate, setCliffDate] = useState<Date | undefined>(undefined);
  const [cliffEndDate, setCliffEndDate] = useState<Date | undefined>(undefined);
  
  // Loading state
  const [isCreating, setIsCreating] = useState(false);

  // Handle linear vesting creation
  const handleCreateLinearVesting = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a vesting schedule",
        variant: "destructive",
      });
      return;
    }

    if (!linearAmount || !linearRecipient || !linearStartDate || !linearEndDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startTimestamp = linearStartDate.getTime();
    const endTimestamp = linearEndDate.getTime();

    if (startTimestamp >= endTimestamp) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      // Call contract function here
      // const tx = await wallet.createLinearVesting(...);
      
      toast({
        title: "Vesting schedule created",
        description: "Your linear vesting schedule has been created successfully",
      });
      router.push("/vesting");
    } catch (error) {
      console.error("Error creating vesting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create vesting schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle cliff vesting creation
  const handleCreateCliffVesting = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a vesting schedule",
        variant: "destructive",
      });
      return;
    }

    if (!cliffAmount || !cliffRecipient || !cliffStartDate || !cliffDate || !cliffEndDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startTimestamp = cliffStartDate.getTime();
    const cliffTimestamp = cliffDate.getTime();
    const endTimestamp = cliffEndDate.getTime();

    if (startTimestamp >= cliffTimestamp || cliffTimestamp >= endTimestamp) {
      toast({
        title: "Invalid dates",
        description: "Start date must be before cliff date, and cliff date must be before end date",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      // Call contract function here
      // const tx = await wallet.createCliffVesting(...);
      
      toast({
        title: "Vesting schedule created",
        description: "Your cliff vesting schedule has been created successfully",
      });
      router.push("/vesting");
    } catch (error) {
      console.error("Error creating vesting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create vesting schedule. Please try again.",
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
              You need to connect your wallet to create a vesting schedule
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
      <h1 className="text-3xl font-bold mb-6">Create Vesting Schedule</h1>
      
      <Tabs defaultValue="linear" className="max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="linear">Linear Vesting</TabsTrigger>
          <TabsTrigger value="cliff">Cliff Vesting</TabsTrigger>
        </TabsList>
        
        {/* Linear Vesting Tab */}
        <TabsContent value="linear">
          <Card>
            <CardHeader>
              <CardTitle>Create Linear Vesting</CardTitle>
              <CardDescription>
                Linear vesting releases tokens gradually over time from start to end date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linearAmount">Amount</Label>
                <Input
                  id="linearAmount"
                  type="number"
                  placeholder="Enter amount to vest"
                  value={linearAmount}
                  onChange={(e) => setLinearAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linearRecipient">Recipient Address</Label>
                <Input
                  id="linearRecipient"
                  placeholder="Enter recipient address"
                  value={linearRecipient}
                  onChange={(e) => setLinearRecipient(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linearStartDate">Start Date</Label>
                  <Input
                    id="linearStartDate"
                    type="date"
                    value={linearStartDate ? format(linearStartDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setLinearStartDate(new Date(e.target.value));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linearEndDate">End Date</Label>
                  <Input
                    id="linearEndDate"
                    type="date"
                    value={linearEndDate ? format(linearEndDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setLinearEndDate(new Date(e.target.value));
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateLinearVesting} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Linear Vesting"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Cliff Vesting Tab */}
        <TabsContent value="cliff">
          <Card>
            <CardHeader>
              <CardTitle>Create Cliff Vesting</CardTitle>
              <CardDescription>
                Cliff vesting holds tokens until the cliff date, then releases gradually until the end date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliffAmount">Amount</Label>
                <Input
                  id="cliffAmount"
                  type="number"
                  placeholder="Enter amount to vest"
                  value={cliffAmount}
                  onChange={(e) => setCliffAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cliffRecipient">Recipient Address</Label>
                <Input
                  id="cliffRecipient"
                  placeholder="Enter recipient address"
                  value={cliffRecipient}
                  onChange={(e) => setCliffRecipient(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliffStartDate">Start Date</Label>
                  <Input
                    id="cliffStartDate"
                    type="date"
                    value={cliffStartDate ? format(cliffStartDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCliffStartDate(new Date(e.target.value));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cliffDate">Cliff Date</Label>
                  <Input
                    id="cliffDate"
                    type="date"
                    value={cliffDate ? format(cliffDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCliffDate(new Date(e.target.value));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cliffEndDate">End Date</Label>
                  <Input
                    id="cliffEndDate"
                    type="date"
                    value={cliffEndDate ? format(cliffEndDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCliffEndDate(new Date(e.target.value));
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateCliffVesting} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Cliff Vesting"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
