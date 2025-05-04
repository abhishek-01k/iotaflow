import { useState, useCallback } from 'react';
import { Transaction } from '@iota/iota-sdk/transactions';
import { useCurrentWallet } from '@iota/dapp-kit';
import { IotaWallet } from '@/lib/iota';
import {
  createInstantAirdrop,
  createVestedAirdrop,
  createOneTimePayment,
  createRecurringPayment,
  createFixedLock,
  createGradualLock,
  createLinearVesting,
  createCliffVesting,
  CONTRACT_MODULES,
  CONTRACT_FUNCTIONS,
  PACKAGE_ID
} from '@/lib/iota/index';

interface ContractState {
  loading: boolean;
  error: Error | null;
  transactionId: string | null;
}

export function useIotaContract() {
  const { isConnected : connected } = useCurrentWallet();
  const [state, setState] = useState<ContractState>({
    loading: false,
    error: null,
    transactionId: null,
  });

  // Reset state
  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      transactionId: null,
    });
  }, []);

  // Execute a transaction
  const executeTransaction = useCallback(async (transaction: Transaction) => {
    if (!connected) {
      setState({
        loading: false,
        error: new Error('Wallet not connected'),
        transactionId: null,
      });
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await IotaWallet.executeTransaction(transaction);
      setState({
        loading: false,
        error: null,
        transactionId: result.digest,
      });
      return result;
    } catch (error) {
      console.error('Error executing transaction:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        transactionId: null,
      });
      return null;
    }
  }, [connected]);

  // Airdrop functions
  const createInstantAirdropTx = useCallback(async (
    amount: bigint,
    recipients: string[]
  ) => {
    try {
      const transaction = await createInstantAirdrop(amount, recipients);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating instant airdrop:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating instant airdrop'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  const createVestedAirdropTx = useCallback(async (
    amount: bigint,
    recipients: string[],
    startTimestamp: bigint,
    endTimestamp: bigint
  ) => {
    try {
      const transaction = await createVestedAirdrop(amount, recipients, startTimestamp, endTimestamp);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating vested airdrop:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating vested airdrop'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  // Payment functions
  const createOneTimePaymentTx = useCallback(async (
    amount: bigint,
    recipient: string,
    paymentDate: bigint
  ) => {
    try {
      const transaction = await createOneTimePayment(amount, recipient, paymentDate);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating one-time payment:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating one-time payment'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  const createRecurringPaymentTx = useCallback(async (
    amount: bigint,
    recipient: string,
    startDate: bigint,
    interval: bigint,
    count: number
  ) => {
    try {
      const transaction = await createRecurringPayment(amount, recipient, startDate, interval, count);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating recurring payment:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating recurring payment'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  // Token lock functions
  const createFixedLockTx = useCallback(async (
    amount: bigint,
    unlockDate: bigint
  ) => {
    try {
      const transaction = await createFixedLock(amount, unlockDate);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating fixed lock:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating fixed lock'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  const createGradualLockTx = useCallback(async (
    amount: bigint,
    startDate: bigint,
    endDate: bigint
  ) => {
    try {
      const transaction = await createGradualLock(amount, startDate, endDate);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating gradual lock:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating gradual lock'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  // Vesting functions
  const createLinearVestingTx = useCallback(async (
    amount: bigint,
    recipient: string,
    startDate: bigint,
    endDate: bigint
  ) => {
    try {
      const transaction = await createLinearVesting(amount, recipient, startDate, endDate);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating linear vesting:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating linear vesting'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  const createCliffVestingTx = useCallback(async (
    amount: bigint,
    recipient: string,
    cliffDate: bigint,
    endDate: bigint
  ) => {
    try {
      const transaction = await createCliffVesting(amount, recipient, cliffDate, endDate);
      return executeTransaction(transaction);
    } catch (error) {
      console.error('Error creating cliff vesting:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error('Error creating cliff vesting'),
        transactionId: null,
      });
      return null;
    }
  }, [executeTransaction]);

  // Generic contract call function
  const callContract = useCallback(async (
    module: string,
    functionName: string,
    args: any[],
    amount: bigint = BigInt(0)
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await IotaWallet.executeContract(
        `${module}::${functionName}`,
        args,
        amount
      );
      setState({
        loading: false,
        error: null,
        transactionId: result.digest,
      });
      return result;
    } catch (error) {
      console.error(`Error calling ${module}::${functionName}:`, error);
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error(`Error calling ${module}::${functionName}`),
        transactionId: null,
      });
      return null;
    }
  }, []);

  return {
    ...state,
    resetState,
    executeTransaction,
    // Airdrop functions
    createInstantAirdropTx,
    createVestedAirdropTx,
    // Payment functions
    createOneTimePaymentTx,
    createRecurringPaymentTx,
    // Token lock functions
    createFixedLockTx,
    createGradualLockTx,
    // Vesting functions
    createLinearVestingTx,
    createCliffVestingTx,
    // Generic contract call
    callContract,
    // Constants
    CONTRACT_MODULES,
    CONTRACT_FUNCTIONS,
    PACKAGE_ID
  };
}