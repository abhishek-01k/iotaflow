"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// export const metadata: Metadata = {
//   title: "IoTaFlow - Token Management Platform for IOTA",
//   description: "Secure, programmable token distribution and management platform for the IOTA blockchain",
// };

export default function Home() {
  // Content for the sticky scroll feature section
  const features = [
    {
      title: "Subscription Management Made Easy",
      description:
        "Create and manage subscription plans with flexible pricing and durations. Set up recurring payments that automatically process at specified intervals.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/subscription-preview.png" 
            width={400} 
            height={300} 
            alt="Subscription Management" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
    {
      title: "Split Payments with Precision",
      description:
        "Distribute funds among multiple recipients automatically based on predefined shares. Perfect for revenue sharing, royalty payments, and team distributions.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-950/50 dark:to-emerald-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/payment-split-preview.png" 
            width={400} 
            height={300} 
            alt="Payment Splitting" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
    {
      title: "Complete Analytics Dashboard",
      description:
        "Track payments, subscriptions, and revenue with intuitive analytics. Gain insights into your payment streams and optimize your financial operations.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/analytics-preview.png" 
            width={400} 
            height={300} 
            alt="Analytics Dashboard" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
    {
      title: "Secure Blockchain Transactions",
      description:
        "Built on IOTA's secure and feeless blockchain technology. Every transaction is fully traceable and immutable, providing complete transparency.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950/50 dark:to-rose-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/security-preview.png" 
            width={400} 
            height={300} 
            alt="Blockchain Security" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
  ];

  // Card content for the "Use Cases" section
  const useCards = [
    {
      title: "Content Creators",
      description: "Automate revenue sharing between creators, platforms, and collaborators.",
      icon: "👨‍🎨",
    },
    {
      title: "SaaS Businesses",
      description: "Set up subscription plans with flexible pricing and automatic billing.",
      icon: "💻",
    },
    {
      title: "Freelancers",
      description: "Split project payments among team members with predefined shares.",
      icon: "👩‍💻",
    },
    {
      title: "Digital Services",
      description: "Implement pay-as-you-go models with transparent payment processing.",
      icon: "🛠",
    },
    {
      title: "NFT Marketplaces",
      description: "Manage royalty distributions for NFT sales and resales.",
      icon: "🖼",
    },
    {
      title: "DAOs & Communities",
      description: "Distribute funds among community members based on contribution.",
      icon: "🤝",
    },
  ];
  
  return (
    <main className="container mx-auto px-4 py-16">
      <section className="mx-auto max-w-5xl space-y-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-primary">IOTA</span> Token Management Platform
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Streamlined token distribution, vesting, and management built for the IOTA blockchain
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/vesting">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://docs.iotaflow.io" target="_blank" rel="noopener noreferrer">
              Documentation
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Token Vesting</CardTitle>
              <CardDescription>Transparent token distribution over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Create customizable vesting schedules with linear or cliff vesting options. 
                Ensure transparency and build trust with investors and stakeholders.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/vesting">Create Schedule</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Locks</CardTitle>
              <CardDescription>Secure token locking mechanisms</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Lock tokens for a specific period with customizable release options. 
                Perfect for liquidity pools, team tokens, and protocol treasuries.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/locks">Lock Tokens</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automated Payments</CardTitle>
              <CardDescription>Recurring payment infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Set up automated recurring payments for team members, service providers, 
                or other stakeholders with flexible schedule options.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/payments">Setup Payments</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Airdrops</CardTitle>
              <CardDescription>Efficient token distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Distribute tokens to multiple recipients at once with options 
                for instant or vested airdrops to engage your community.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/airdrops">Create Airdrop</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Complete token visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Track all your token operations in one place with detailed analytics
                and insights about vesting, locks, payments, and airdrops.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IOTA Integration</CardTitle>
              <CardDescription>Native blockchain support</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Built specifically for the IOTA blockchain with native integration for
                low fees, high scalability, and improved security.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="https://docs.iota.org" target="_blank" rel="noopener noreferrer">
                  Learn About IOTA
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-4xl rounded-xl bg-muted p-8">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Set up your first vesting schedule, token lock, or payment in minutes
          </p>
          <Button size="lg" asChild>
            <Link href="/vesting">Launch App</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
