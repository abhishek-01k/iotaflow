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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { IotaWallet } from "@/lib/iota";
import { useCurrentWallet } from "@iota/dapp-kit";

// Schema for the lock form
const lockFormSchema = z.object({
  amount: z.coerce
    .number()
    .positive({
      message: "Amount must be a positive number",
    })
    .min(1, {
      message: "Amount must be at least 1",
    }),
  lockType: z.enum(["fixed", "gradual"]),
  unlockDate: z.string().min(1, {
    message: "Unlock date is required",
  }),
});

// Type for the form values
type LockFormValues = z.infer<typeof lockFormSchema>;

// Default form values
const defaultValues: Partial<LockFormValues> = {
  lockType: "fixed",
};

export function LockForm() {
  const { toast } = useToast();
  const { isConnected } = useCurrentWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<LockFormValues>({
    resolver: zodResolver(lockFormSchema),
    defaultValues,
  });

  // Get form values
  const lockType = form.watch("lockType");

  // Function to create token lock
  async function onSubmit(data: LockFormValues) {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a token lock",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert date to timestamp
      const unlockTimestamp = new Date(data.unlockDate).getTime();
      
      // Current timestamp
      const currentTimestamp = Date.now();
      
      // Check if date is valid
      if (unlockTimestamp <= currentTimestamp) {
        toast({
          title: "Invalid unlock date",
          description: "Unlock date must be in the future",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Convert amount to microIOTA (1 IOTA = 1_000_000 microIOTA)
      const amountInMicroIOTA = data.amount * 1_000_000;

      // Call the contract based on lock type
      if (data.lockType === "fixed") {
        await IotaWallet.executeContract(
          "0x4200000000000000000000000000000000000003", // IoTaFlow token lock contract address
          "create_fixed_lock",
          [
            amountInMicroIOTA.toString(),
            unlockTimestamp.toString(),
          ],
          amountInMicroIOTA
        );
      } else {
        // Gradual unlock
        await IotaWallet.executeContract(
          "0x4200000000000000000000000000000000000003", // IoTaFlow token lock contract address
          "create_gradual_lock",
          [
            amountInMicroIOTA.toString(),
            unlockTimestamp.toString(),
          ],
          amountInMicroIOTA
        );
      }

      toast({
        title: "Token lock created",
        description: "Your tokens have been successfully locked",
      });

      // Reset the form
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error creating token lock:", error);
      toast({
        title: "Error creating token lock",
        description: "There was an error locking your tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-6 rounded-lg border bg-background p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Lock Your Tokens</h3>
        <p className="text-sm text-muted-foreground">
          Securely lock tokens for a specified period of time
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  The total amount of IOTA to lock
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lockType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Lock Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    disabled={isSubmitting}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="fixed" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Fixed Unlock
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="gradual" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Gradual Unlock
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  {lockType === "fixed"
                    ? "Tokens will be unlocked all at once on the unlock date"
                    : "Tokens will be gradually unlocked from now until the unlock date"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unlockDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unlock Date</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  {lockType === "fixed" 
                    ? "Date when tokens will be unlocked" 
                    : "End date for gradual unlocking"}
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
                Locking Tokens...
              </>
            ) : (
              "Lock Tokens"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 