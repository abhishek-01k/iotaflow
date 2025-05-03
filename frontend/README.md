# FluxShare

FluxShare is a decentralized payment automation platform built on IOTA blockchain that solves complex revenue sharing and subscription management challenges for digital businesses and creators.

## The Problem

Digital businesses, content creators, and collaborative teams face significant challenges:

- **Payment Distribution**: Manual splitting of revenue among team members, collaborators, or stakeholders is time-consuming and error-prone
- **Recurring Payments**: Managing subscriptions requires complex infrastructure and introduces high transaction fees
- **Financial Transparency**: Lack of verifiable payment history creates trust issues between parties
- **Payment Delays**: Traditional financial systems introduce delays in distributing funds to collaborators
- **High Fees**: Traditional payment processors charge substantial fees, especially for micro-transactions

## Our Solution

FluxShare leverages IOTA's feeless blockchain to automate multi-party payments and subscription management:

- **Automated Revenue Splitting**: Instantly divide incoming payments among multiple recipients based on predefined shares
- **Transparent Subscription Management**: Create, manage, and track subscription plans with complete transparency
- **Feeless Micro-Transactions**: Process even small payments efficiently without transaction fees
- **Real-Time Distribution**: Collaborators receive their share immediately when payment is received
- **Immutable Payment Records**: All transactions are recorded on the blockchain for transparent verification

## Primary Use Cases

- **Content Creators & Collaborators**: Automatically split revenue from subscriptions or one-time payments between creators, platforms, editors, and other contributors
- **SaaS & Digital Service Providers**: Manage subscription billing and divide revenue among development team, infrastructure providers, and investors
- **DAOs & Community Projects**: Distribute community funds transparently according to contribution or governance decisions
- **Freelance Teams**: Automatically allocate client payments across team members based on predefined work agreements
- **NFT Royalty Management**: Ensure ongoing royalty payments are properly distributed to all stakeholders

## Features

- **Smart Payment Splitting**: Automatically distribute funds among up to 10+ recipients with customizable share percentages
- **Subscription Management**: Create tiered subscription plans with flexible pricing and billing cycles
- **Analytics Dashboard**: Track payment flows, subscription metrics, and revenue distribution in real-time
- **IOTA Blockchain Integration**: Leverage IOTA's secure, feeless transaction infrastructure
- **Programmable Payment Logic**: Create custom rules for different payment scenarios

## Deployed Smart Contracts

Our smart contracts have been successfully deployed to the IOTA blockchain:

| Contract Module | Description | Main Functions |
|-----------------|-------------|---------------|
| `subscription_manager` | Manages subscription creation, payments, and renewal | `create_subscription`, `process_payment`, `renew_subscription` |
| `payment_splitter` | Handles automatic distribution of funds to multiple recipients | `split_payment`, `add_recipient`, `remove_recipient` |
| `subscription_registry` | Tracks active subscriptions and provides analytics | `register_subscription`, `get_transaction_history`, `get_analytics` |

**Deployment Information:**
- **Package ID**: `0x059feebf7bbde97146ab5b2eca6c16602674e23593cfc0732c5350cfd0b68de2`
- **Network**: IOTA Testnet
- **Deployment Date**: July 2024

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- IOTA wallet

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/kamalbuilds/fluxshare.git
   cd fluxshare
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_IOTA_NODE_URL=https://api.shimmer.network
   NEXT_PUBLIC_IOTA_KIOSK_URL=https://kiosk.shimmer.network
   NEXT_PUBLIC_CONTRACT_PACKAGE_ID=0x059feebf7bbde97146ab5b2eca6c16602674e23593cfc0732c5350cfd0b68de2
   ```

4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
/
├── app/                     # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── dashboard/           # Dashboard pages
│   ├── subscription/        # Subscription management
│   └── payments/            # Payment tracking
├── components/              # UI components
│   ├── ui/                  # Base UI components
│   ├── subscription/        # Subscription-related components
│   ├── payment/             # Payment-related components
│   └── dashboard/           # Dashboard components
├── contract/                # Smart contract code
│   ├── subscription/        # Subscription contract
│   ├── payment-splitter/    # Payment splitting contract
│   └── registry/            # Subscription registry
├── lib/                     # Utilities and helpers
│   ├── iota/                # IOTA SDK integration
│   └── utils/               # General utilities
└── public/                  # Static assets
```

## Interacting with Smart Contracts

### Creating a Subscription

```typescript
import { createSubscription } from '@/lib/iota/client';

// Create a new subscription plan
const subscription = await createSubscription({
  name: "Premium Plan",
  description: "Access to all premium features",
  price: BigInt(5000000), // 5 MIOTA
  duration: 30, // days
  ownerAddress: walletAddress
});
```

### Processing a Split Payment

```typescript
import { createSplitPayment } from '@/lib/iota/client';

// Define recipients and their shares
const recipients = [
  { address: "iota1abc...", share: 50 }, // 50%
  { address: "iota1def...", share: 30 }, // 30%
  { address: "iota1ghi...", share: 20 }  // 20%
];

// Process the payment split
const transactions = await createSplitPayment(
  kioskId,
  payerAddress, 
  recipients,
  BigInt(10000000), // 10 MIOTA
  { paymentId: "payment-123", description: "Monthly revenue" }
);
```

### Viewing Transaction History

```typescript
import { getTransactionHistory } from '@/lib/iota/client';

// Get transaction history for a subscription
const history = await getTransactionHistory(kioskId);
```

## Why IOTA Blockchain?

FluxShare leverages IOTA blockchain's unique advantages:

- **Zero Transaction Fees**: Makes micro-transactions and frequent payments economically viable
- **Fast Confirmations**: Near-instant payments ensure recipients get paid quickly
- **Scalability**: Handles high volumes of transactions without congestion
- **Energy Efficiency**: Uses significantly less energy than traditional blockchain networks
- **Secure and Immutable**: Provides tamper-proof records of all payment distributions

## Testing with Testnet Tokens

To test FluxShare on the IOTA Testnet:

1. Create an IOTA wallet using a compatible wallet provider
2. Request testnet tokens from the [IOTA Testnet Faucet](https://faucet.testnet.iota.cafe)
3. Connect your wallet to FluxShare using the "Connect Wallet" button
4. Create test subscriptions and payment splits to explore the functionality

## Development Roadmap

| Phase | Milestone | Timeline |
|-------|-----------|----------|
| 1 | Smart Contract Deployment ✅ | July 2024 |
| 2 | Frontend MVP with Basic Functionality | August 2024 |
| 3 | Advanced Analytics & Reporting | September 2024 |
| 4 | Mobile App Development | Q4 2024 |
| 5 | Mainnet Launch | Q1 2025 |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Kamal Nayan - [@kamalbuilds](https://twitter.com/kamalbuilds) - hello@kamalbuilds.dev

Project Link: [https://github.com/kamalbuilds/fluxshare](https://github.com/kamalbuilds/fluxshare)
