"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { IotaWallet } from "@/lib/iota";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

// Type for vesting schedule
interface VestingSchedule {
  id: string;
  creator: string;
  recipient: string;
  totalAmount: number;
  releasedAmount: number;
  startTimestamp: number;
  endTimestamp: number;
  cliffTimestamp: number;
  vestingType: number; // 0 for linear, 1 for cliff
  status: number; // 0 for active, 1 for cancelled, 2 for completed
}

export function VestingList() {
  const { connected, currentAccount } = useWallet();
  const { toast } = useToast();
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (connected && currentAccount) {
      fetchVestingSchedules();
    } else {
      setVestingSchedules([]);
      setLoading(false);
    }
  }, [connected, currentAccount]);

  async function fetchVestingSchedules() {
    try {
      setLoading(true);
      
      // Call contract to get user's vesting schedules
      const response = await IotaWallet.executeContract(
        "0x4200000000000000000000000000000000000002", // IoTaFlow vesting contract address
        "get_user_vesting_schedules",
        [],
        0
      );
      
      // Format and set vesting schedules
      const formattedSchedules = response.map((schedule: any) => ({
        id: schedule.id,
        creator: schedule.creator,
        recipient: schedule.recipient,
        totalAmount: Number(schedule.total_amount),
        releasedAmount: Number(schedule.released_amount),
        startTimestamp: Number(schedule.start_timestamp),
        endTimestamp: Number(schedule.end_timestamp),
        cliffTimestamp: Number(schedule.cliff_timestamp),
        vestingType: Number(schedule.vesting_type),
        status: Number(schedule.status),
      }));
      
      setVestingSchedules(formattedSchedules);
    } catch (error) {
      console.error("Error fetching vesting schedules:", error);
      toast({
        title: "Error fetching vesting schedules",
        description: "There was an error loading your vesting schedules.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(vestingId: string) {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim vested tokens",
        variant: "destructive",
      });
      return;
    }

    try {
      setClaimLoading({ ...claimLoading, [vestingId]: true });
      
      // Call contract to claim tokens
      await IotaWallet.executeContract(
        "0x4200000000000000000000000000000000000002", // IoTaFlow vesting contract address
        "claim",
        [vestingId],
        0
      );
      
      toast({
        title: "Tokens claimed",
        description: "Your vested tokens have been successfully claimed",
      });
      
      // Refresh the list
      await fetchVestingSchedules();
    } catch (error) {
      console.error("Error claiming tokens:", error);
      toast({
        title: "Error claiming tokens",
        description: "There was an error claiming your tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaimLoading({ ...claimLoading, [vestingId]: false });
    }
  }

  // Format date from timestamp
  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Calculate progress percentage
  function calculateProgress(startTime: number, endTime: number) {
    const currentTime = Date.now();
    if (currentTime <= startTime) return 0;
    if (currentTime >= endTime) return 100;
    
    const totalDuration = endTime - startTime;
    const elapsed = currentTime - startTime;
    return Math.round((elapsed / totalDuration) * 100);
  }

  // Format IOTA amount (from microIOTA to IOTA)
  function formatAmount(amount: number) {
    return (amount / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }

  // Get status text
  function getStatusText(status: number) {
    switch (status) {
      case 0: return "Active";
      case 1: return "Cancelled";
      case 2: return "Completed";
      default: return "Unknown";
    }
  }

  // Get vesting type text
  function getVestingTypeText(type: number) {
    return type === 0 ? "Linear" : "Cliff";
  }

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vesting Schedules</CardTitle>
          <CardDescription>
            Connect your wallet to view your vesting schedules
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vestingSchedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Vesting Schedules</CardTitle>
          <CardDescription>
            You don&apos;t have any vesting schedules yet
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={fetchVestingSchedules}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Vesting Schedules</h3>
        <Button variant="outline" size="sm" onClick={fetchVestingSchedules}>
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Amount (IOTA)</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vestingSchedules.map((vesting) => (
              <TableRow key={vesting.id}>
                <TableCell className="font-medium">
                  {`${vesting.recipient.substring(0, 6)}...${vesting.recipient.substring(
                    vesting.recipient.length - 4
                  )}`}
                </TableCell>
                <TableCell>
                  {formatAmount(vesting.totalAmount)} IOTA
                  <div className="text-xs text-muted-foreground">
                    {formatAmount(vesting.releasedAmount)} released
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex flex-col space-y-1">
                    <Progress
                      value={calculateProgress(vesting.startTimestamp, vesting.endTimestamp)}
                      className="h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {calculateProgress(vesting.startTimestamp, vesting.endTimestamp)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <div>Start: {formatDate(vesting.startTimestamp)}</div>
                    {vesting.vestingType === 1 && (
                      <div>Cliff: {formatDate(vesting.cliffTimestamp)}</div>
                    )}
                    <div>End: {formatDate(vesting.endTimestamp)}</div>
                  </div>
                </TableCell>
                <TableCell>{getVestingTypeText(vesting.vestingType)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      vesting.status === 0
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : vesting.status === 1
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {getStatusText(vesting.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleClaim(vesting.id)}
                    size="sm"
                    disabled={
                      vesting.status !== 0 ||
                      vesting.totalAmount === vesting.releasedAmount ||
                      claimLoading[vesting.id]
                    }
                  >
                    {claimLoading[vesting.id] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Claim"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 