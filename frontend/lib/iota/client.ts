import {
  IotaClient,
  getFullnodeUrl,
  Network
} from '@iota/iota-sdk/client';

import { Transaction } from '@iota/iota-sdk/transactions';
import { SerialTransactionExecutor } from '@iota/iota-sdk/transactions';
import { useSignAndExecuteTransaction, useIotaClient } from '@iota/dapp-kit';

// Types
export interface IotaClientConfig {
  url: string;
  network?: Network;
}

export interface ContractCallOptions {
  moduleFunction: string;
  args: any[];
  amount?: bigint;
}

export interface TransactionResult {
  transactionId: string;
  status: string;
  timestamp: number;
}

// Configuration
const NODE_URL = process.env.NEXT_PUBLIC_IOTA_NODE_URL || 'https://api.devnet.iota.cafe';
export const PACKAGE_ID = '0xe2990fecf7f783c1c31f300468e32e7632cb49e01f2b5dce73bdb6607bbcf7cb';

// Client initialization
export class IotaClientService {
  private static instance: IotaClientService;
  private client: IotaClient | null = null;

  private constructor() {}

  public static getInstance(): IotaClientService {
    if (!IotaClientService.instance) {
      IotaClientService.instance = new IotaClientService();
    }
    return IotaClientService.instance;
  }

  public async getClient(): Promise<IotaClient> {
    if (!this.client) {
      try {
        this.client = new IotaClient({
          url: NODE_URL,
        });
      } catch (error) {
        console.error('Error initializing IOTA client:', error);
        throw new Error('Failed to initialize IOTA client');
      }
    }
    return this.client;
  }

  // Transaction handling
  public async createTransactionExecutor(signer: any): Promise<SerialTransactionExecutor> {
    try {
      const client = await this.getClient();
      return new SerialTransactionExecutor({ client, signer });
    } catch (error) {
      console.error('Error creating transaction executor:', error);
      throw new Error('Failed to create transaction executor');
    }
  }

  public async executeTransaction(transaction: Transaction, signer: any): Promise<TransactionResult> {
    try {
      const client = await this.getClient();
      const result = await client.executeTransactionBlock({
        transactionBlock: transaction,
        signature: signer,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      });

      return {
        transactionId: result.digest,
        status: 'success',
        timestamp: Date.now(),
        effects: result.effects,
        objectChanges: result.objectChanges
      };
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw new Error('Failed to execute transaction');
    }
  }

  // Contract interactions
  public async createContractTransaction(options: ContractCallOptions): Promise<Transaction> {
    const { moduleFunction, args, amount = BigInt(0) } = options;
    try {
      const tx = new Transaction();
      
      if (amount > BigInt(0)) {
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
      }
      
      tx.moveCall({
        target: `${PACKAGE_ID}::${moduleFunction}`,
        arguments: args.map(arg => tx.pure(arg)),
      });
      
      return tx;
    } catch (error) {
      console.error('Error creating contract transaction:', error);
      throw new Error('Failed to create contract transaction');
    }
  }

  // Object and event queries
  public async getOwnedObjects(address: string): Promise<any> {
    try {
      const client = await this.getClient();
      const objects = await client.getOwnedObjects({ owner: address });
      return objects;
    } catch (error) {
      console.error('Error getting owned objects:', error);
      return { data: [] };
    }
  }

  public async getTransactionStatus(digest: string): Promise<any> {
    try {
      const client = await this.getClient();
      return await client.getTransactionBlock({ digest });
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return null;
    }
  }

  public async getContractEvents(module: string, eventType: string, limit: number = 50): Promise<any[]> {
    try {
      const client = await this.getClient();
      const events = await client.getEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${module}::${eventType}` },
        limit,
      });
      return events.data;
    } catch (error) {
      console.error(`Error getting ${eventType} events:`, error);
      return [];
    }
  }

  // Module-specific transactions
  public async createModuleTransaction(
    module: string,
    functionName: string,
    args: any[],
    amount: bigint
  ): Promise<Transaction> {
    return this.createContractTransaction({
      moduleFunction: `${module}::${functionName}`,
      args,
      amount
    });
  }
}

// Export singleton instance
export const iotaClient = IotaClientService.getInstance();

// Utility functions
export const formatIotaAmount = (amount: bigint): string => {
  const amountString = amount.toString();
  if (amountString.length <= 6) {
    return `0.${amountString.padStart(6, '0')} Mi`;
  }
  const integerPart = amountString.slice(0, -6);
  const decimalPart = amountString.slice(-6);
  return `${integerPart}.${decimalPart} Mi`;
};