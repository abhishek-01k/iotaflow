# IOTA Contract Deployment Guide

This guide provides step-by-step instructions for deploying the IoTaFlow contracts to the IOTA blockchain.

## Prerequisites

Before you begin, ensure you have the following:

- IOTA CLI installed on your system
- An IOTA wallet with sufficient tokens for gas
- The IoTaFlow contract code (in the `/contract` directory)

## Step 1: Set Up Environment

First, ensure you're using the correct IOTA network:

```bash
# List available environments
iota client envs

# Switch to the desired network (e.g., testnet)
iota client switch --env testnet
```

## Step 2: Check Gas Balance

Verify that you have sufficient tokens for gas:

```bash
iota client gas
```

If you need tokens for the testnet, you can request them from the faucet:

```bash
iota client faucet
```

## Step 3: Build the Contract

Navigate to the contract directory and build the package:

```bash
cd contract
iota move build
```

This will compile the Move contract code and generate the bytecode required for deployment.

## Step 4: Run Tests (Optional but Recommended)

Run the unit tests to ensure the contract is functioning correctly:

```bash
iota move test
```

All tests should pass before proceeding to deployment.

## Step 5: Verify Bytecode

Verify that the bytecode will pass the metering check:

```bash
iota client verify-bytecode-meter
```

The output should indicate that the module will pass the metering check.

## Step 6: Deploy the Contract

Deploy the contract to the blockchain:

```bash
iota client publish . --gas-budget 20000000
```

Make sure to set an appropriate gas budget. The example uses 20,000,000, but you may need to adjust this based on the contract's complexity.

## Step 7: Record Deployment Information

After successful deployment, the console will display information about the transaction and created objects. It's important to record the following information:

- **Package ID**: This is the unique identifier for your deployed contract package
- **Transaction Digest**: The transaction hash that can be used to look up the deployment on the explorer
- **Module Names**: The names of the modules included in the package (e.g., airdrop, payment, token_lock, vesting)

Example output excerpt:
```
Transaction Digest: 2d77Q7CoBsPMMbksDMPmMTuXr88ABAgQzudERSRHz1h5
...
Published Objects:
  ┌──
  │ PackageID: 0xe2990fecf7f783c1c31f300468e32e7632cb49e01f2b5dce73bdb6607bbcf7cb
  │ Version: 1
  │ Digest: 5e7g2fY8r5zLSm7Q8AF3C4jFvSVDBDUvzCXr39YMp3AZ
  │ Modules: airdrop, payment, token_lock, vesting
  └──
```

## Step 8: Update Frontend Configuration

Update your frontend configuration with the Package ID:

1. Open `/frontend/lib/iota.ts`
2. Find the `IOTAFLOW_PACKAGE_ID` constant
3. Replace the value with your new Package ID:

```typescript
private readonly IOTAFLOW_PACKAGE_ID = "0xe2990fecf7f783c1c31f300468e32e7632cb49e01f2b5dce73bdb6607bbcf7cb";
```

## Step 9: Verify Deployment

Verify that your contract is accessible by interacting with it through the IOTA CLI:

```bash
# Example: Call a read-only function on the airdrop module
iota client call --function <your-package-id>::airdrop::some_view_function --args [...] --gas-budget 10000000
```

## Step 10: Create a Deployment Documentation

Create a deployment document in your project's documentation directory (`/docs`) that includes:

- The Package ID
- Transaction Digest
- Deployed module names
- Deployment date and IOTA network
- Any relevant notes about the deployment

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: If you encounter an "insufficient gas" error, try increasing the gas budget in your publish command.

2. **Bytecode Metering Failure**: If your contract fails bytecode metering, review your code for inefficient constructs or overly complex functions.

3. **Dependency Issues**: Ensure that all dependencies in your `Move.toml` file are correctly specified and available.

### Verifying Transaction Status

You can verify the status of your transaction by searching for the transaction digest on the IOTA Explorer:

- Testnet Explorer: [https://explorer.testnet.iota.org](https://explorer.testnet.iota.org)
- Mainnet Explorer: [https://explorer.iota.org](https://explorer.iota.org)

## Upgrading Contracts

If you need to upgrade your contracts in the future, you'll need to:

1. Make your changes to the contract code
2. Build and test as before
3. Deploy the updated version using the same steps above
4. Update your frontend to point to the new Package ID

Note that data stored in the previous contract version will not be automatically migrated. Depending on your upgrade strategy, you may need to implement migration logic. 