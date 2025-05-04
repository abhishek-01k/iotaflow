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

// Schema for the vesting form
const vestingFormSchema = z.object({
  recipientAddress: z.string().min(1, {
    message: "Recipient address is required",
  }),
  amount: z.coerce
    .number()
    .positive({
      message: "Amount must be a positive number",
    })
    .min(1, {
      message: "Amount must be at least 1",
    }),
  vestingType: z.enum(["linear", "cliff"]),
  startDate: z.string().min(1, {
    message: "Start date is required",
  }),
  endDate: z.string().min(1, {
    message: "End date is required",
  }),
  cliffDate: z.string().optional(),
});

// Type for the form values
type VestingFormValues = z.infer<typeof vestingFormSchema>;

// Default form values
const defaultValues: Partial<VestingFormValues> = {
  vestingType: "linear",
};

export function VestingForm() {
  const { toast } = useToast();
  const { isConnected } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const iotaClient = useIotaClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);

  // Form setup
  const form = useForm<VestingFormValues>({
    resolver: zodResolver(vestingFormSchema),
    defaultValues,
  });

  // Get form values
  const vestingType = form.watch("vestingType");

  // Function to create vesting schedule
  async function onSubmit(data: VestingFormValues) {
    if (!isConnected || !currentAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a vesting schedule",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert dates to timestamps
      const startTimestamp = new Date(data.startDate).getTime();
      const endTimestamp = new Date(data.endDate).getTime();
      
      // Check if dates are valid
      if (startTimestamp >= endTimestamp) {
        toast({
          title: "Invalid date range",
          description: "End date must be after start date",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Convert amount to microIOTA (1 IOTA = 1_000_000 microIOTA)
      const amountInMicroIOTA = BigInt(Math.floor(data.amount * 1_000_000));

      // Create a new transaction
      const tx = new Transaction();

      // Special modification: we need to first create a primary coin
      // then transfer it to the contract with the right type
      
      // First, split coins from gas for payment
      const [primaryCoin] = tx.splitCoins(tx.gas, [amountInMicroIOTA]);
      
      // Call the contract based on vesting type
      if (data.vestingType === "linear") {
        tx.moveCall({
          target: `${PACKAGE_ID}::vesting::create_linear_vesting`,
          arguments: [
            tx.pure.address(data.recipientAddress),
            tx.pure.u64(amountInMicroIOTA),
            tx.pure.u64(BigInt(startTimestamp)),
            tx.pure.u64(BigInt(endTimestamp)),
            primaryCoin,
          ],
          typeArguments: [`${PACKAGE_ID}::vesting::VESTING`],
        });
      } else {
        // Cliff vesting
        const cliffTimestamp = new Date(data.cliffDate || "").getTime();
        
        // Validate cliff date
        if (!data.cliffDate || cliffTimestamp <= startTimestamp || cliffTimestamp >= endTimestamp) {
          toast({
            title: "Invalid cliff date",
            description: "Cliff date must be between start date and end date",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        tx.moveCall({
          target: `${PACKAGE_ID}::vesting::create_cliff_vesting`,
          arguments: [
            tx.pure.address(data.recipientAddress),
            tx.pure.u64(amountInMicroIOTA),
            tx.pure.u64(BigInt(startTimestamp)),
            tx.pure.u64(BigInt(endTimestamp)),
            tx.pure.u64(BigInt(cliffTimestamp)),
            primaryCoin,
          ],
          typeArguments: [`${PACKAGE_ID}::vesting::VESTING`],
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
              title: "Vesting schedule created",
              description: "Your vesting schedule has been successfully created",
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
      console.error("Error creating vesting schedule:", error);
      toast({
        title: "Error creating vesting schedule",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? `Error: ${(error as Error).message}` 
          : "There was an error creating your vesting schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-6 rounded-lg border bg-background p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Create Vesting Schedule</h3>
        <p className="text-sm text-muted-foreground">
          Lock and distribute tokens gradually over time
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
                  The wallet address that will receive the vested tokens
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
                  The total amount of IOTA to vest
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vestingType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Vesting Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    disabled={isSubmitting}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="linear" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Linear Vesting
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="cliff" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Cliff Vesting
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  {vestingType === "linear"
                    ? "Tokens will be released gradually from start to end"
                    : "Tokens will be locked until cliff date, then gradually released"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {vestingType === "cliff" && (
            <FormField
              control={form.control}
              name="cliffDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliff Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    No tokens will be released until this date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isConnected}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Vesting Schedule"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}