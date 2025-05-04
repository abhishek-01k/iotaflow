// Export all IOTA-related functionality
import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { PACKAGE_ID, initIotaClient } from './client';

// Define contract module names from the deployed package
export const CONTRACT_MODULES = {
  AIRDROP: 'airdrop',
  PAYMENT: 'payment',
  TOKEN_LOCK: 'token_lock',
  VESTING: 'vesting'
};

// Define contract function names for each module
export const CONTRACT_FUNCTIONS = {
  // Airdrop module functions
  AIRDROP: {
    CREATE_INSTANT_AIRDROP: 'create_instant_airdrop',
    CREATE_VESTED_AIRDROP: 'create_vested_airdrop',
    CLAIM_AIRDROP: 'claim_airdrop',
    GET_AIRDROPS: 'get_airdrops'
  },
  // Payment module functions
  PAYMENT: {
    CREATE_ONE_TIME_PAYMENT: 'create_one_time_payment',
    CREATE_RECURRING_PAYMENT: 'create_recurring_payment',
    CANCEL_PAYMENT: 'cancel_payment',
    GET_PAYMENTS: 'get_payments'
  },
  // Token lock module functions
  TOKEN_LOCK: {
    CREATE_FIXED_LOCK: 'create_fixed_lock',
    CREATE_GRADUAL_LOCK: 'create_gradual_lock',
    UNLOCK_TOKENS: 'unlock_tokens',
    GET_LOCKS: 'get_locks'
  },
  // Vesting module functions
  VESTING: {
    CREATE_LINEAR_VESTING: 'create_linear_vesting',
    CREATE_CLIFF_VESTING: 'create_cliff_vesting',
    CLAIM_VESTED_TOKENS: 'claim_vested_tokens',
    GET_VESTING_SCHEDULES: 'get_vesting_schedules'
  }
};

// Helper function to create a contract call transaction
export const createContractCallTransaction = async (
  module: string,
  functionName: string,
  args: any[],
  amount: bigint = BigInt(0)
): Promise<Transaction> => {
  // Create a new transaction
  const tx = new Transaction();
  
  // If amount is greater than 0, split coins for the transaction
  if (amount > BigInt(0)) {
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    
    // Call the contract function with the specified module and function name
    tx.moveCall({
      target: `${PACKAGE_ID}::${module}::${functionName}`,
      arguments: [...args],
    });
  } else {
    // Call the contract function without transferring coins
    tx.moveCall({
      target: `${PACKAGE_ID}::${module}::${functionName}`,
      arguments: [...args],
    });
  }
  
  return tx;
};

// Contract interaction functions

// Airdrop module functions
export const createInstantAirdrop = async (
  amount: bigint,
  recipients: string[],
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.AIRDROP,
    CONTRACT_FUNCTIONS.AIRDROP.CREATE_INSTANT_AIRDROP,
    [recipients],
    amount
  );
};

export const createVestedAirdrop = async (
  amount: bigint,
  recipients: string[],
  startTimestamp: bigint,
  endTimestamp: bigint,
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.AIRDROP,
    CONTRACT_FUNCTIONS.AIRDROP.CREATE_VESTED_AIRDROP,
    [recipients, startTimestamp, endTimestamp],
    amount
  );
};

// Payment module functions
export const createOneTimePayment = async (
  amount: bigint,
  recipient: string,
  paymentDate: bigint,
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.PAYMENT,
    CONTRACT_FUNCTIONS.PAYMENT.CREATE_ONE_TIME_PAYMENT,
    [recipient, paymentDate],
    amount
  );
};

export const createRecurringPayment = async (
  amount: bigint,
  recipient: string,
  startDate: bigint,
  interval: bigint,
  count: number,
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.PAYMENT,
    CONTRACT_FUNCTIONS.PAYMENT.CREATE_RECURRING_PAYMENT,
    [recipient, startDate, interval, count],
    amount
  );
};

// Token lock module functions
export const createFixedLock = async (
  amount: bigint,
  unlockDate: bigint,
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.TOKEN_LOCK,
    CONTRACT_FUNCTIONS.TOKEN_LOCK.CREATE_FIXED_LOCK,
    [unlockDate],
    amount
  );
};

export const createGradualLock = async (
  amount: bigint,
  startDate: bigint,
  endDate: bigint,
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.TOKEN_LOCK,
    CONTRACT_FUNCTIONS.TOKEN_LOCK.CREATE_GRADUAL_LOCK,
    [startDate, endDate],
    amount
  );
};

// Vesting module functions
export const createLinearVesting = async (
  amount: bigint,
  recipient: string,
  startDate: bigint,
  endDate: bigint,
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.VESTING,
    CONTRACT_FUNCTIONS.VESTING.CREATE_LINEAR_VESTING,
    [recipient, startDate, endDate],
    amount
  );
};

export const createCliffVesting = async (
  amount: bigint,
  recipient: string,
  cliffDate: bigint,
  endDate: bigint,
  client?: IotaClient
): Promise<Transaction> => {
  return createContractCallTransaction(
    CONTRACT_MODULES.VESTING,
    CONTRACT_FUNCTIONS.VESTING.CREATE_CLIFF_VESTING,
    [recipient, cliffDate, endDate],
    amount
  );
};

// Export client initialization function
export { initIotaClient, PACKAGE_ID };