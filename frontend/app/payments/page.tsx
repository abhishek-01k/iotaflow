"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {  useCurrentWallet } from "@iota/dapp-kit";
import { IotaWallet } from "@/lib/iota";
import { Loader2, Calendar, RefreshCw, Clock, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data structure for payments
type Payment = {
  id: string;
  recipientAddress: string;
  amount: number;
  scheduledDate: string;
  status: "scheduled" | "completed" | "cancelled";
  paymentType: "one_time" | "recurring";
  description?: string;
  interval?: string;
  remainingPayments?: number;
};

export default function PaymentsPage() {
  const { isConnected : connected } = useCurrentWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Fetch payments when the wallet is connected
  useEffect(() => {
    if (connected) {
      fetchPayments();
    } else {
      setPayments([]);
      setIsLoading(false);
    }
  }, [connected]);

  // Function to fetch payments from the contract
  async function fetchPayments() {
    try {
      setIsLoading(true);
      
      // TODO: Replace this mock data with actual contract call when API is ready
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPayments: Payment[] = [
        {
          id: "0x1234567890abcdef1234567890abcdef",
          recipientAddress: "0xd69b6a10dcdf0d63e0ea6382c5c81516104f5b7b81d3d7a98a3724a8982db237",
          amount: 100,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          status: "scheduled",
          paymentType: "one_time",
          description: "Monthly subscription payment"
        },
        {
          id: "0xabcdef1234567890abcdef1234567890",
          recipientAddress: "0xd69b6a10dcdf0d63e0ea6382c5c81516104f5b7b81d3d7a98a3724a8982db237",
          amount: 50,
          scheduledDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
          status: "completed",
          paymentType: "one_time",
          description: "One-time service fee"
        },
        {
          id: "0x7890abcdef1234567890abcdef123456",
          recipientAddress: "0xd69b6a10dcdf0d63e0ea6382c5c81516104f5b7b81d3d7a98a3724a8982db237",
          amount: 25,
          scheduledDate: new Date().toISOString(), // today
          status: "scheduled",
          paymentType: "recurring",
          description: "Weekly team payment",
          interval: "weekly",
          remainingPayments: 12
        }
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Function to cancel a payment
  async function cancelPayment(paymentId: string) {
    try {
      // Mock cancellation for now
      // In real implementation, call contract to cancel payment
      setPayments(payments.map(payment => 
        payment.id === paymentId ? { ...payment, status: "cancelled" } : payment
      ));
    } catch (error) {
      console.error("Error cancelling payment:", error);
    }
  }

  // Helper to format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your scheduled payments
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={fetchPayments} 
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
            Connect your IOTA wallet to view and manage your payments.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" asChild>
            <Link href="/payments/create">
              <Calendar className="h-4 w-4" />
              Schedule Payment
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
          {payments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No payments found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {connected 
                    ? "You haven't scheduled any payments yet. Create your first payment to get started."
                    : "Connect your wallet to view your scheduled payments."}
                </p>
                {connected && (
                  <Button className="mt-4" asChild>
                    <Link href="/payments/create">Schedule Payment</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <Card key={payment.id} className={payment.status === "cancelled" ? "opacity-70" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {payment.description || `Payment to ${formatAddress(payment.recipientAddress)}`}
                          {payment.paymentType === "recurring" && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              Recurring
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={
                              payment.status === "scheduled" 
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : payment.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {payment.id}
                        </CardDescription>
                      </div>
                      <div className="text-lg font-bold">
                        {payment.amount} IOTA
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Recipient</div>
                        <div className="font-mono text-sm truncate">{payment.recipientAddress}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {payment.paymentType === "recurring" ? "Next Payment" : "Payment Date"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(payment.scheduledDate).toLocaleString()}
                        </div>
                      </div>
                      
                      {payment.paymentType === "recurring" && payment.interval && payment.remainingPayments !== undefined && (
                        <>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Interval</div>
                            <div className="capitalize">{payment.interval}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Remaining Payments</div>
                            <div>{payment.remainingPayments}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {payment.status === "scheduled" && (
                      <Button 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/10 gap-2" 
                        onClick={() => cancelPayment(payment.id)}
                      >
                        <Ban className="h-4 w-4" /> Cancel Payment
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
