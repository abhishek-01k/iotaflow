# IoTaFlow - Token Distribution Platform for IOTA

IoTaFlow is a decentralized platform built on the IOTA blockchain that provides sophisticated token distribution and management solutions. It enables secure, programmable payment flows with zero fees, instant settlements, and complete transparency.

## Deployed Contract

The IoTaFlow contracts are deployed on the IOTA blockchain with the following package ID:

```
Package ID: 0xe2990fecf7f783c1c31f300468e32e7632cb49e01f2b5dce73bdb6607bbcf7cb
```

This package includes the following modules:
- `airdrop` - For instant and vested token airdrops
- `payment` - For one-time and recurring payments
- `token_lock` - For fixed and gradual token locking
- `vesting` - For linear and cliff vesting schedules

## Features

### Token Vesting
- **Linear Vesting**: Gradually release tokens from start to end date
- **Cliff Vesting**: Lock tokens until a cliff date, then gradually release
- Transparent vesting schedules visible to all parties
- Built-in security controls for creators

### Token Locking
- **Fixed Unlock**: Lock tokens until a specific date
- **Gradual Unlock**: Release tokens gradually over time
- Complete visibility into lock status and unlock schedules

### Airdrops
- **Instant Airdrops**: Distribute tokens to multiple recipients at once
- **Vested Airdrops**: Distribute tokens that vest over time
- Efficient batch distribution to large recipient lists

### Payment Management
- **One-time Payments**: Schedule future payments
- **Recurring Payments**: Set up automated recurring payments
- Flexible payment scheduling and management

## Technology Stack

### Smart Contracts
- Written in IOTA Move language (resource-oriented programming)
- Secure by design with formal verification capabilities
- Optimized for the IOTA blockchain's unique features

### Frontend
- Built with Next.js 14
- React with TypeScript
- Tailwind CSS for styling
- ShadCN UI component library
- IOTA wallet integration

## Getting Started

### Prerequisites
- IOTA wallet with testnet tokens
- Node.js and npm/yarn/bun
- Move CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/iotaflow.git
cd iotaflow

# Install frontend dependencies
cd frontend
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```

Visit `http://localhost:3000` to access the application.

### Building the Smart Contracts

If you want to build and deploy your own version of the contracts:

```bash
# Build the smart contracts
cd contract
iota move build

# Run tests
iota move test

# Deploy to the IOTA testnet
iota client publish .
```

## Smart Contract Architecture

IoTaFlow consists of four main smart contracts:

1. **Vesting Contract**: Manages token vesting schedules with linear and cliff vesting options
2. **Token Lock Contract**: Handles token locking with fixed and gradual unlock mechanisms
3. **Airdrop Contract**: Facilitates token distribution to multiple recipients
4. **Payment Contract**: Enables one-time and recurring payment scheduling

## Usage Examples

### Creating an Airdrop

```move
// Create an instant airdrop
create_instant_airdrop(
    1000000, // Amount in microIOTA
    coin_in,  // Coin object for payment
    ctx       // Transaction context
);

// Create a vested airdrop
create_vested_airdrop(
    1000000,           // Amount in microIOTA
    1682553600000,     // Start timestamp
    1714089600000,     // End timestamp
    coin_in,           // Coin object for payment
    ctx                // Transaction context
);
```

### Using the Frontend

1. Connect your IOTA wallet
2. Navigate to the desired functionality (Airdrops, Vesting, Locks, or Payments)
3. Fill in the required parameters
4. Submit the transaction through your connected wallet

## Development

### Running Tests

```bash
cd contract
iota move test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The IOTA Foundation for providing the blockchain infrastructure
- The Move language team for their excellent documentation

---

Built with ❤️ for the IOTA ecosystem.
