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

// Type for token lock
interface TokenLock {
  id: string;
  owner: string;
  lockAmount: number;
  unlockedAmount: number;
  lockTimestamp: number;
  unlockTimestamp: number;
  lockType: number; // 0 for fixed, 1 for gradual
  status: number; // 0 for locked, 1 for unlocked, 2 for partially unlocked
}

export function LockList() {
  const { connected, currentAccount } = useWallet();
  const { toast } = useToast();
  const [tokenLocks, setTokenLocks] = useState<TokenLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockLoading, setUnlockLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (connected && currentAccount) {
      fetchTokenLocks();
    } else {
      setTokenLocks([]);
      setLoading(false);
    }
  }, [connected, currentAccount]);

  async function fetchTokenLocks() {
    try {
      setLoading(true);
      
      // Call contract to get user's token locks
      const response = await IotaWallet.executeContract(
        "0x4200000000000000000000000000000000000003", // IoTaFlow token lock contract address
        "get_user_locks",
        [],
        0
      );
      
      // Format and set token locks
      const formattedLocks = response.map((lock: any) => ({
        id: lock.id,
        owner: lock.owner,
        lockAmount: Number(lock.lock_amount),
        unlockedAmount: Number(lock.unlocked_amount),
        lockTimestamp: Number(lock.lock_timestamp),
        unlockTimestamp: Number(lock.unlock_timestamp),
        lockType: Number(lock.lock_type),
        status: Number(lock.status),
      }));
      
      setTokenLocks(formattedLocks);
    } catch (error) {
      console.error("Error fetching token locks:", error);
      toast({
        title: "Error fetching token locks",
        description: "There was an error loading your token locks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(lockId: string) {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to unlock tokens",
        variant: "destructive",
      });
      return;
    }

    try {
      setUnlockLoading({ ...unlockLoading, [lockId]: true });
      
      // Call contract to unlock tokens
      await IotaWallet.executeContract(
        "0x4200000000000000000000000000000000000003", // IoTaFlow token lock contract address
        "unlock",
        [lockId],
        0
      );
      
      toast({
        title: "Tokens unlocked",
        description: "Your tokens have been successfully unlocked",
      });
      
      // Refresh the list
      await fetchTokenLocks();
    } catch (error) {
      console.error("Error unlocking tokens:", error);
      toast({
        title: "Error unlocking tokens",
        description: "There was an error unlocking your tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUnlockLoading({ ...unlockLoading, [lockId]: false });
    }
  }

  // Format date from timestamp
  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Calculate unlock progress percentage
  function calculateProgress(lock: TokenLock) {
    if (lock.status === 1) return 100; // Fully unlocked
    
    if (lock.lockType === 0) { // Fixed unlock
      return lock.status === 1 ? 100 : 0;
    } else { // Gradual unlock
      const currentTime = Date.now();
      const totalPeriod = lock.unlockTimestamp - lock.lockTimestamp;
      const elapsed = currentTime - lock.lockTimestamp;
      
      if (elapsed <= 0) return 0;
      if (elapsed >= totalPeriod) return 100;
      
      return Math.min(100, Math.round((elapsed / totalPeriod) * 100));
    }
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
      case 0: return "Locked";
      case 1: return "Unlocked";
      case 2: return "Partially Unlocked";
      default: return "Unknown";
    }
  }

  // Get lock type text
  function getLockTypeText(type: number) {
    return type === 0 ? "Fixed" : "Gradual";
  }

  // Check if unlock is available
  function canUnlock(lock: TokenLock) {
    if (lock.status === 1) return false; // Already fully unlocked
    
    const currentTime = Date.now();
    
    if (lock.lockType === 0) { // Fixed unlock
      return currentTime >= lock.unlockTimestamp;
    } else { // Gradual unlock
      // For gradual unlock, can unlock if any time has passed since lock
      if (currentTime <= lock.lockTimestamp) return false;
      
      const remainingAmount = lock.lockAmount - lock.unlockedAmount;
      return remainingAmount > 0;
    }
  }

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Locks</CardTitle>
          <CardDescription>
            Connect your wallet to view your token locks
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

  if (tokenLocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Token Locks</CardTitle>
          <CardDescription>
            You don&apos;t have any token locks yet
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={fetchTokenLocks}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Token Locks</h3>
        <Button variant="outline" size="sm" onClick={fetchTokenLocks}>
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount (IOTA)</TableHead>
              <TableHead>Unlock Progress</TableHead>
              <TableHead>Lock Date</TableHead>
              <TableHead>Unlock Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokenLocks.map((lock) => (
              <TableRow key={lock.id}>
                <TableCell>
                  {formatAmount(lock.lockAmount)} IOTA
                  <div className="text-xs text-muted-foreground">
                    {formatAmount(lock.unlockedAmount)} unlocked
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex flex-col space-y-1">
                    <Progress
                      value={calculateProgress(lock)}
                      className="h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {calculateProgress(lock)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(lock.lockTimestamp)}
                </TableCell>
                <TableCell>
                  {formatDate(lock.unlockTimestamp)}
                </TableCell>
                <TableCell>{getLockTypeText(lock.lockType)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      lock.status === 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : lock.status === 1
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {getStatusText(lock.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleUnlock(lock.id)}
                    size="sm"
                    disabled={
                      !canUnlock(lock) ||
                      unlockLoading[lock.id]
                    }
                  >
                    {unlockLoading[lock.id] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Unlock"
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