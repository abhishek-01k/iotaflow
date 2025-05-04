"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  useConnectWallet, useCurrentWallet } from "@iota/dapp-kit";
import { useIotaContract } from "@/hooks/useIotaContract";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ContractInteraction() {
    const { currentWallet, connectionStatus } = useCurrentWallet();
  const { 
    loading, 
    error, 
    transactionId,
    createInstantAirdropTx,
    createOneTimePaymentTx,
    createFixedLockTx,
    createLinearVestingTx,
    CONTRACT_MODULES,
    CONTRACT_FUNCTIONS,
    PACKAGE_ID
  } = useIotaContract();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');

  // Convert IOTA to microIOTA (1 IOTA = 1,000,000 microIOTA)
  const convertToMicroIota = (iotaAmount: string): bigint => {
    try {
      const amount = parseFloat(iotaAmount);
      return BigInt(Math.floor(amount * 1_000_000));
    } catch (e) {
      return BigInt(0);
    }
  };

  // Convert date to timestamp
  const dateToTimestamp = (dateStr: string): bigint => {
    try {
      const date = new Date(dateStr);
      return BigInt(date.getTime());
    } catch (e) {
      return BigInt(Date.now());
    }
  };

  const handleCreateAirdrop = async () => {
    if (!connectionStatus || !recipient || !amount) return;
    
    try {
      const microIotaAmount = convertToMicroIota(amount);
      const recipients = recipient.split(',').map(addr => addr.trim());
      
      await createInstantAirdropTx(microIotaAmount, recipients);
    } catch (error) {
      console.error('Error creating airdrop:', error);
    }
  };

  const handleCreatePayment = async () => {
    if (!connectionStatus || !recipient || !amount || !unlockDate) return;
    
    try {
      const microIotaAmount = convertToMicroIota(amount);
      const paymentDate = dateToTimestamp(unlockDate);
      
      await createOneTimePaymentTx(microIotaAmount, recipient, paymentDate);
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handleCreateLock = async () => {
    if (!connectionStatus || !amount || !unlockDate) return;
    
    try {
      const microIotaAmount = convertToMicroIota(amount);
      const lockDate = dateToTimestamp(unlockDate);
      
      await createFixedLockTx(microIotaAmount, lockDate);
    } catch (error) {
      console.error('Error creating lock:', error);
    }
  };

  const handleCreateVesting = async () => {
    if (!connectionStatus || !recipient || !amount || !unlockDate) return;
    
    try {
      const microIotaAmount = convertToMicroIota(amount);
      const startDate = BigInt(Date.now());
      const endDate = dateToTimestamp(unlockDate);
      
      await createLinearVestingTx(microIotaAmount, recipient, startDate, endDate);
    } catch (error) {
      console.error('Error creating vesting:', error);
    }
  };

  if (!connectionStatus) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Contract Interaction</CardTitle>
          <CardDescription>
            Connect your wallet to interact with the IoTaFlow contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please connect your IOTA wallet to use this feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>IoTaFlow Contract</CardTitle>
        <CardDescription>
          Interact with the deployed IoTaFlow contract
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address(es)</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            For airdrops, separate multiple addresses with commas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (IOTA)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unlockDate">Unlock/End Date</Label>
          <Input
            id="unlockDate"
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
          />
        </div>

        {transactionId && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-xs font-medium">Transaction ID:</p>
            <p className="text-xs break-all">{transactionId}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            <p className="text-xs">{error.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            onClick={handleCreateAirdrop}
            disabled={loading || !recipient || !amount}
            className="w-full"
          >
            {loading ? "Processing..." : "Create Airdrop"}
          </Button>
          <Button
            onClick={handleCreatePayment}
            disabled={loading || !recipient || !amount || !unlockDate}
            className="w-full"
          >
            {loading ? "Processing..." : "Create Payment"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            onClick={handleCreateLock}
            disabled={loading || !amount || !unlockDate}
            className="w-full"
          >
            {loading ? "Processing..." : "Create Lock"}
          </Button>
          <Button
            onClick={handleCreateVesting}
            disabled={loading || !recipient || !amount || !unlockDate}
            className="w-full"
          >
            {loading ? "Processing..." : "Create Vesting"}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Contract ID: {PACKAGE_ID.substring(0, 10)}...{PACKAGE_ID.substring(PACKAGE_ID.length - 8)}
        </div>
      </CardFooter>
    </Card>
  );
}