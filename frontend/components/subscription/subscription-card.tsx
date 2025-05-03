import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIotaAmount } from "@/lib/iota/client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: bigint;
  period: number; // in days
  features: string[];
  isPopular?: boolean;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  onSubscribe: (planId: string) => void;
  isConnected: boolean;
}

export function SubscriptionCard({ plan, onSubscribe, isConnected }: SubscriptionCardProps) {
  const { id, name, description, price, period, features, isPopular } = plan;
  
  const formatPeriod = (periodInDays: number) => {
    if (periodInDays === 30) return 'Monthly';
    if (periodInDays === 90) return 'Quarterly';
    if (periodInDays === 365) return 'Yearly';
    return `${periodInDays} days`;
  };
  
  return (
    <Card className={`w-full max-w-sm ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {isPopular && <Badge className="bg-primary">Popular</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-3xl font-bold">{formatIotaAmount(price)}</div>
            <p className="text-muted-foreground">{formatPeriod(period)}</p>
          </div>
          
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onSubscribe(id)}
          disabled={!isConnected}
        >
          {isConnected ? 'Subscribe Now' : 'Connect Wallet to Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
} 