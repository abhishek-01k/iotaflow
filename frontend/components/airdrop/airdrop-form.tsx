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
import {  useCurrentWallet } from "@iota/dapp-kit";
import { IotaWallet } from "@/lib/iota";

// Schema for the airdrop form
const airdropFormSchema = z.object({
  totalAmount: z.coerce
    .number()
    .positive({
      message: "Amount must be a positive number",
    })
    .min(1, {
      message: "Amount must be at least 1",
    }),
  airdropType: z.enum(["instant", "vested"]),
  recipients: z.string().min(1, {
    message: "Recipients list is required",
  }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Type for the form values
type AirdropFormValues = z.infer<typeof airdropFormSchema>;

// Default form values
const defaultValues: Partial<AirdropFormValues> = {
  airdropType: "instant",
};

export function AirdropForm() {
  const { toast } = useToast();
  const { isConnected : connected } = useCurrentWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the deployed contract package ID
  const packageId = IotaWallet.getPackageId();

  // Form setup
  const form = useForm<AirdropFormValues>({
    resolver: zodResolver(airdropFormSchema),
    defaultValues,
  });

  // Get form values
  const airdropType = form.watch("airdropType");

  // Function to parse recipients
  function parseRecipients(recipientsText: string): { addresses: string[], amounts: number[] } {
    const lines = recipientsText.trim().split("\n");
    const addresses: string[] = [];
    const amounts: number[] = [];
    
    for (const line of lines) {
      const [address, amountStr] = line.split(",").map(s => s.trim());
      
      if (address && amountStr) {
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          addresses.push(address);
          // Convert to microIOTA
          amounts.push(amount * 1_000_000);
        }
      }
    }
    
    return { addresses, amounts };
  }

  // Function to create airdrop
  async function onSubmit(data: AirdropFormValues) {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an airdrop",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse recipients
      const { addresses, amounts } = parseRecipients(data.recipients);
      
      if (addresses.length === 0) {
        toast({
          title: "Invalid recipients",
          description: "Please provide at least one valid recipient address and amount",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Calculate total amount from recipients
      const totalFromRecipients = amounts.reduce((sum, amount) => sum + amount, 0);
      
      // Convert total amount to microIOTA
      const totalAmountInMicroIOTA = data.totalAmount * 1_000_000;
      
      // Ensure total amount matches sum of recipient amounts
      if (totalAmountInMicroIOTA !== totalFromRecipients) {
        toast({
          title: "Total amount mismatch",
          description: `The total amount (${data.totalAmount} IOTA) doesn't match the sum of recipient amounts (${totalFromRecipients / 1_000_000} IOTA)`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Call the contract based on airdrop type
      if (data.airdropType === "instant") {
        // Create instant airdrop
        const airdropResponse = await IotaWallet.executeContract(
          packageId, // Use the deployed package ID
          "iotaflow::airdrop::create_instant_airdrop", // Use fully qualified function name
          [
            totalAmountInMicroIOTA.toString(),
          ],
          totalAmountInMicroIOTA
        );
        
        // Get airdrop ID from response
        const airdropId = airdropResponse.id;
        
        // Distribute tokens to recipients
        await IotaWallet.executeContract(
          packageId, // Use the deployed package ID
          "iotaflow::airdrop::distribute_instant", // Use fully qualified function name
          [
            airdropId,
            addresses,
            amounts.map(a => a.toString()),
          ],
          0
        );
      } else {
        // Vested airdrop requires start and end dates
        if (!data.startDate || !data.endDate) {
          toast({
            title: "Missing dates",
            description: "Start date and end date are required for vested airdrops",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
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
        
        // Create vested airdrop
        const airdropResponse = await IotaWallet.executeContract(
          packageId, // Use the deployed package ID
          "iotaflow::airdrop::create_vested_airdrop", // Use fully qualified function name
          [
            totalAmountInMicroIOTA.toString(),
            startTimestamp.toString(),
            endTimestamp.toString(),
          ],
          totalAmountInMicroIOTA
        );
        
        // Get airdrop ID from response
        const airdropId = airdropResponse.id;
        
        // Distribute tokens to recipients
        await IotaWallet.executeContract(
          packageId, // Use the deployed package ID
          "iotaflow::airdrop::distribute_vested", // Use fully qualified function name
          [
            airdropId,
            addresses,
            amounts.map(a => a.toString()),
          ],
          0
        );
      }

      toast({
        title: "Airdrop created",
        description: "Your airdrop has been successfully created and distributed",
      });

      // Reset the form
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error creating airdrop:", error);
      toast({
        title: "Error creating airdrop",
        description: "There was an error creating your airdrop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-6 rounded-lg border bg-background p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Create Airdrop</h3>
        <p className="text-sm text-muted-foreground">
          Distribute tokens to multiple recipients at once
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount (IOTA)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.0"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The total amount of IOTA to distribute
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="airdropType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Airdrop Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    disabled={isSubmitting}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="instant" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Instant Airdrop
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="vested" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Vested Airdrop
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  {airdropType === "instant"
                    ? "Tokens will be distributed immediately"
                    : "Tokens will be vested over time"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {airdropType === "vested" && (
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
          )}

          <FormField
            control={form.control}
            name="recipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipients</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="address1, 10
address2, 20
address3, 5"
                    className="font-mono text-sm"
                    rows={8}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Enter one recipient per line in the format: address, amount
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !connected}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Airdrop...
              </>
            ) : (
              "Create Airdrop"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 