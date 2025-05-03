"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2Icon, PlusIcon } from "lucide-react";
import { createSplitPayment } from "@/lib/iota/client";

interface Recipient {
  address: string;
  share: number;
}

interface PaymentSplitterFormProps {
  walletAddress: string | null;
  kioskId: string | null;
  onSuccess?: () => void;
}

export function PaymentSplitterForm({ walletAddress, kioskId, onSuccess }: PaymentSplitterFormProps) {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', share: 50 },
    { address: '', share: 50 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAddRecipient = () => {
    // Calculate remaining share percentage
    const currentTotal = recipients.reduce((total, recipient) => total + recipient.share, 0);
    const remainingShare = 100 - currentTotal;
    
    // Add a new recipient with equal distribution of remaining share
    setRecipients([...recipients, { address: '', share: Math.max(remainingShare, 0) }]);
  };
  
  const handleRemoveRecipient = (index: number) => {
    if (recipients.length <= 2) {
      return; // Maintain at least 2 recipients
    }
    
    const newRecipients = [...recipients];
    const removedShare = newRecipients[index].share;
    newRecipients.splice(index, 1);
    
    // Redistribute the removed share
    const sharePerRecipient = removedShare / newRecipients.length;
    newRecipients.forEach(recipient => {
      recipient.share += sharePerRecipient;
    });
    
    // Fix any rounding errors
    const totalAfterRedistribution = newRecipients.reduce((total, recipient) => total + recipient.share, 0);
    if (totalAfterRedistribution !== 100) {
      newRecipients[0].share += (100 - totalAfterRedistribution);
    }
    
    setRecipients(newRecipients);
  };
  
  const handleRecipientAddressChange = (index: number, address: string) => {
    const newRecipients = [...recipients];
    newRecipients[index].address = address;
    setRecipients(newRecipients);
  };
  
  const handleRecipientShareChange = (index: number, share: number) => {
    if (isNaN(share) || share < 0) {
      return;
    }
    
    const newRecipients = [...recipients];
    const oldShare = newRecipients[index].share;
    const difference = share - oldShare;
    
    // Update the current recipient's share
    newRecipients[index].share = share;
    
    // Adjust other recipients' shares proportionally
    const otherRecipients = newRecipients.filter((_, i) => i !== index);
    const totalOtherShares = otherRecipients.reduce((total, r) => total + r.share, 0);
    
    if (totalOtherShares > 0) {
      otherRecipients.forEach((_, i) => {
        const otherIndex = newRecipients.findIndex((r) => r === otherRecipients[i]);
        const proportion = newRecipients[otherIndex].share / totalOtherShares;
        newRecipients[otherIndex].share -= difference * proportion;
      });
    }
    
    // Fix any rounding errors
    const totalAfterAdjustment = newRecipients.reduce((total, r) => total + r.share, 0);
    if (Math.abs(totalAfterAdjustment - 100) > 0.1) {
      const otherIndex = newRecipients.findIndex((_, i) => i !== index);
      if (otherIndex >= 0) {
        newRecipients[otherIndex].share += (100 - totalAfterAdjustment);
      }
    }
    
    setRecipients(newRecipients);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!kioskId) {
      setError('No Kiosk ID available. Please create a Kiosk first.');
      return;
    }
    
    if (!name.trim()) {
      setError('Please enter a name for this payment splitter');
      return;
    }
    
    if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    const invalidRecipients = recipients.some(r => !r.address.trim() || r.share <= 0);
    if (invalidRecipients) {
      setError('All recipients must have an address and a share percentage');
      return;
    }
    
    const totalShare = recipients.reduce((total, r) => total + r.share, 0);
    if (Math.abs(totalShare - 100) > 0.1) {
      setError('Share percentages must add up to 100%');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert to BigInt for IOTA
      const amountInIota = BigInt(Math.floor(parseFloat(totalAmount) * 1000000)); // Convert to IOTA units
      
      // Create split payment
      await createSplitPayment(
        kioskId,
        walletAddress,
        recipients,
        amountInIota,
        {
          name,
          payment_type: 'split',
          created_at: new Date().toISOString(),
        }
      );
      
      // Reset form
      setName('');
      setTotalAmount('');
      setRecipients([
        { address: '', share: 50 },
        { address: '', share: 50 },
      ]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating split payment:', err);
      setError('Failed to create split payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate total percentage for validation feedback
  const totalPercentage = recipients.reduce((total, recipient) => total + recipient.share, 0);
  const isValidTotal = Math.abs(totalPercentage - 100) < 0.1;
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Revenue Sharing Plan</CardTitle>
        <CardDescription>
          Distribute funds automatically among team members based on defined shares
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Team Revenue Split"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Total Amount (in IOTA)</Label>
              <Input 
                id="amount"
                type="number"
                min="0"
                step="0.000001"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Enter total amount"
                className="mt-1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Team Members</Label>
                <span className={`text-sm ${isValidTotal ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPercentage.toFixed(1)}% allocated {isValidTotal ? '✓' : ''}
                </span>
              </div>
              
              {recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input 
                      value={recipient.address}
                      onChange={(e) => handleRecipientAddressChange(index, e.target.value)}
                      placeholder="Recipient address"
                      className="mt-1"
                    />
                  </div>
                  <div className="w-24">
                    <Input 
                      type="number"
                      min="0"
                      max="100"
                      value={recipient.share}
                      onChange={(e) => handleRecipientShareChange(index, parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div className="pt-1">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveRecipient(index)}
                      disabled={recipients.length <= 2 || isSubmitting}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRecipient}
                disabled={isSubmitting}
                className="mt-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Add Recipient
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <CardFooter className="flex justify-end px-0 pt-2">
            <Button
              type="submit"
              disabled={!walletAddress || !kioskId || isSubmitting || !isValidTotal}
            >
              {isSubmitting ? 'Creating...' : 'Create Split Payment'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
} 