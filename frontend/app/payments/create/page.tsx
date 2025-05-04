"use client";

import React from "react";
import { PaymentForm } from "@/components/payment/payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectButton } from "@iota/dapp-kit";

export default function CreatePaymentPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Schedule Payment</h1>
          <p className="text-muted-foreground mt-1">
            Create one-time or recurring payments to any address
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <PaymentForm />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About Payments</CardTitle>
              <CardDescription>How IOTA payments work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">One-Time Payments</h3>
                <p className="text-muted-foreground mt-1">
                  Schedule a single payment to be executed at a future date.
                  This is ideal for bill payments, subscriptions, or delayed transfers.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Recurring Payments</h3>
                <p className="text-muted-foreground mt-1">
                  Set up automatic recurring payments at specified intervals.
                  Perfect for regular expenses, subscriptions, or periodic transfers.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Payment Execution</h3>
                <p className="text-muted-foreground mt-1">
                  Payments are executed on-chain automatically at the scheduled time.
                  The smart contract handles the transfer without any further action needed.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Gas Fees</h3>
                <p className="text-muted-foreground mt-1">
                  A small amount of IOTA is required for gas fees to process the payment.
                  For recurring payments, gas is pre-paid for all scheduled transactions.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Cancellation</h3>
                <p className="text-muted-foreground mt-1">
                  Scheduled payments can be cancelled before they are executed.
                  Visit the Payments tab to manage your scheduled payments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
