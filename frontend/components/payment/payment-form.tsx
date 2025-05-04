"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { 
  useCurrentWallet,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useIotaClient
} from "@iota/dapp-kit";
import { Transaction } from "@iota/iota-sdk/transactions";
import { PACKAGE_ID } from "@/lib/iota/client";

// Schema for the payment form
const paymentFormSchema = z.object({
  paymentType: z.enum(["one_time", "recurring"]),
  recipientAddress: z.string().min(32, {
    message: "Recipient address must be a valid IOTA address",
  }),
  amount: z.coerce
    .number()
    .positive({
      message: "Amount must be a positive number",
    })
    .min(1, {
      message: "Amount must be at least 1",
    }),
  scheduledDate: z.string().optional(),
  description: z.string().optional(),
  // For recurring payments
  interval: z.string().optional(),
  numberOfPayments: z.coerce.number().optional(),
});

// Type for the form values
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// Default form values
const defaultValues: Partial<PaymentFormValues> = {
  paymentType: "one_time",
};

export function PaymentForm() {
  const { toast } = useToast();
  const { isConnected } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const iotaClient = useIotaClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);

  // Form setup
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  // Get form values
  const paymentType = form.watch("paymentType");

  // Function to create payment
  async function onSubmit(data: PaymentFormValues) {
    if (!isConnected || !currentAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a payment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert amount to microIOTA
      const amountInMicroIOTA = BigInt(Math.floor(data.amount * 1_000_000));
      
      // Create a new transaction
      const tx = new Transaction();
      
      if (data.paymentType === "one_time") {
        // For one-time payment
        if (!data.scheduledDate) {
          toast({
            title: "Missing scheduled date",
            description: "Scheduled date is required for one-time payments",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Convert date to timestamp
        const scheduledTimestamp = new Date(data.scheduledDate).getTime();
        
        // Check if date is valid
        if (scheduledTimestamp <= Date.now()) {
          toast({
            title: "Invalid scheduled date",
            description: "Scheduled date must be in the future",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Split coins for the transaction with proper typing
        const [paymentCoin] = tx.splitCoins(tx.gas, [amountInMicroIOTA]);
        
        // Create one-time payment
        tx.moveCall({
          target: `${PACKAGE_ID}::payment::create_one_time_payment`,
          arguments: [
            tx.pure.address(data.recipientAddress),
            tx.pure.u64(amountInMicroIOTA),
            tx.pure.u64(BigInt(scheduledTimestamp)),
            tx.pure.string(data.description || ""),
            paymentCoin
          ],
          typeArguments: [`${PACKAGE_ID}::payment::PAYMENT`],
        });
      } else {
        // For recurring payment
        if (!data.interval || !data.numberOfPayments) {
          toast({
            title: "Missing recurring payment details",
            description: "Interval and number of payments are required for recurring payments",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Get interval in milliseconds
        let intervalMs = 0;
        switch (data.interval) {
          case "daily":
            intervalMs = 24 * 60 * 60 * 1000; // 1 day
            break;
          case "weekly":
            intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
            break;
          case "monthly":
            intervalMs = 30 * 24 * 60 * 60 * 1000; // 30 days (approx)
            break;
          case "quarterly":
            intervalMs = 90 * 24 * 60 * 60 * 1000; // 90 days (approx)
            break;
          default:
            toast({
              title: "Invalid interval",
              description: "Please select a valid payment interval",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        
        // First payment starts now
        const startTimestamp = Date.now();
        
        // Calculate total amount needed
        const totalAmount = amountInMicroIOTA * BigInt(data.numberOfPayments);
        
        // Split coins for the transaction with proper typing
        const [paymentCoin] = tx.splitCoins(tx.gas, [totalAmount]);
        
        // Create recurring payment
        tx.moveCall({
          target: `${PACKAGE_ID}::payment::create_recurring_payment`,
          arguments: [
            tx.pure.address(data.recipientAddress),
            tx.pure.u64(amountInMicroIOTA),
            tx.pure.u64(BigInt(startTimestamp)),
            tx.pure.u64(BigInt(intervalMs)),
            tx.pure.u64(BigInt(data.numberOfPayments)),
            tx.pure.string(data.description || ""),
            paymentCoin
          ],
          typeArguments: [`${PACKAGE_ID}::payment::PAYMENT`],
        });
      }

      console.log("Transaction created:", tx);
      
      // Sign and execute the transaction
      signAndExecuteTransaction(
        { 
          transaction: tx,
          options: {
            showEffects: true,
            showEvents: true
          }
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction result:", result);
            // Wait for transaction to be processed
            await iotaClient.waitForTransaction({ digest: result.digest });
            setTxDigest(result.digest);
            
            toast({
              title: paymentType === "one_time" ? "Payment scheduled" : "Recurring payment scheduled",
              description: paymentType === "one_time" 
                ? "Your one-time payment has been successfully scheduled"
                : `Your payment of ${data.amount} IOTA will recur ${data.numberOfPayments} times at ${data.interval} intervals`,
            });
            
            // Reset the form
            form.reset(defaultValues);
          },
          onError: (error) => {
            console.error("Transaction error:", error);
            toast({
              title: "Transaction failed",
              description: `Error: ${error.message || "Unknown error"}`,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Error creating payment",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? `Error: ${(error as Error).message}` 
          : "There was an error creating your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-6 rounded-lg border bg-background p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Schedule Payment</h3>
        <p className="text-sm text-muted-foreground">
          Create one-time or recurring payments to any address
        </p>
      </div>
      
      {txDigest && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
          <p className="text-green-800">Transaction successful!</p>
          <p className="text-xs text-green-600 truncate">Digest: {txDigest}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="paymentType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Payment Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    disabled={isSubmitting}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="one_time" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        One-Time Payment
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="recurring" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Recurring Payment
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  {paymentType === "one_time"
                    ? "Schedule a single payment at a future date"
                    : "Set up automatic recurring payments"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipientAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x..."
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The IOTA address that will receive the payment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (IOTA)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.0"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The amount of IOTA to send {paymentType === "recurring" && "per payment"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {paymentType === "one_time" ? (
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    When the payment should be processed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Interval</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often the payment should recur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfPayments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Payments</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Total number of payments to make
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Payment for..."
                    className="resize-none"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Add a note about this payment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isConnected}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling Payment...
              </>
            ) : (
              `Schedule ${paymentType === "one_time" ? "Payment" : "Recurring Payments"}`
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
