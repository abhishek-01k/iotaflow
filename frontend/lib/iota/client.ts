import {
  IotaClient,
  getFullnodeUrl,
  Network
} from '@iota/iota-sdk/client';

import { KioskClient, KioskTransaction } from '@iota/kiosk';

// Configuration for IOTA client
const NODE_URL = process.env.NEXT_PUBLIC_IOTA_NODE_URL || 'https://api.devnet.iota.cafe';

// Deployed contract package ID
export const PACKAGE_ID = '0x059feebf7bbde97146ab5b2eca6c16602674e23593cfc0732c5350cfd0b68de2';

// Initialize IOTA client
export const initIotaClient = async (): Promise<IotaClient> => {
  try {
    const client = new IotaClient({
      url: NODE_URL,
    });
    return client;
  } catch (error) {
    console.error('Error initializing IOTA client:', error);
    throw error;
  }
};

// Initialize IOTA Kiosk client
export const initKioskClient = async (): Promise<KioskClient> => {
  try {
    const client = new IotaClient({ url: getFullnodeUrl(Network.Testnet) });
    
    // Create a Kiosk Client
    const kioskClient = new KioskClient({
      client,
      network: Network.Testnet,
    });
    
    return kioskClient;
  } catch (error) {
    console.error('Error initializing IOTA Kiosk client:', error);
    throw error;
  }
};

// Create a new kiosk for a user (will need to use an IOTA Transaction object)
export const createKiosk = async (walletAddress: string): Promise<any> => {
  try {
    const kioskClient = await initKioskClient();
    
    // Using Transaction from the IOTA SDK to create a kiosk
    // Note: In a real implementation, this would use proper Transaction from IOTA SDK
    // and would be signed and executed by the wallet
    const kiosk = { id: `kiosk_${Math.random().toString(36).substring(2, 10)}`, owner: walletAddress };
    
    return kiosk;
  } catch (error) {
    console.error('Error creating kiosk:', error);
    throw error;
  }
};

// Create a new subscription using the deployed contract
export const createSubscription = async (params: {
  name: string;
  description: string;
  price: bigint;
  duration: number;
  ownerAddress: string;
}): Promise<any> => {
  try {
    const kioskClient = await initKioskClient();
    
    // In a production implementation, we would:
    // 1. Create a Transaction using IOTA SDK
    // 2. Call the subscription_manager::create_subscription function from the deployed contract
    // 3. Finalize and return the transaction for signing
    
    console.log(`Using contract at: ${PACKAGE_ID}`);
    
    // Simulating the transaction for now
    const mockSubscription = {
      id: `sub_${Math.random().toString(36).substring(2, 15)}`,
      name: params.name,
      description: params.description,
      price: params.price,
      duration: params.duration,
      ownerAddress: params.ownerAddress,
      packageId: PACKAGE_ID,
      createdAt: Date.now(),
      active: true
    };
    
    return mockSubscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get a user's kiosk by ID
export const getKiosk = async (kioskId: string): Promise<any> => {
  try {
    const kioskClient = await initKioskClient();
    const kiosk = await kioskClient.getKiosk({ 
      id: kioskId,
      options: {
        withKioskFields: true,
        withListingPrices: true
      }
    });
    return kiosk;
  } catch (error) {
    console.error('Error getting kiosk:', error);
    return null;
  }
};

// Get owned kiosks for a user
export const getOwnedKiosks = async (address: string): Promise<any> => {
  try {
    const kioskClient = await initKioskClient();
    const kiosks = await kioskClient.getOwnedKiosks({ address });
    return kiosks;
  } catch (error) {
    console.error('Error getting owned kiosks:', error);
    return { kioskOwnerCaps: [], kioskIds: [] };
  }
};

// Create a subscription payment using the deployed contract
export const createSubscriptionPayment = async (
  kioskId: string,
  payerAddress: string,
  receiverAddress: string,
  amount: bigint,
  metadataJson: Record<string, any>
): Promise<any> => {
  try {
    const kioskClient = await initKioskClient();
    
    // In a production implementation, we would:
    // 1. Create a Transaction using IOTA SDK
    // 2. Call the subscription_manager::create_payment function from the deployed contract
    // 3. Finalize and return the transaction for signing
    
    console.log(`Using contract at: ${PACKAGE_ID}`);
    
    // Simulating the transaction for now
    const mockTransaction = {
      id: `tx_${Math.random().toString(36).substring(2, 15)}`,
      kioskId,
      sender: payerAddress,
      recipient: receiverAddress,
      amount,
      packageId: PACKAGE_ID,
      metadata: metadataJson,
      timestamp: Date.now()
    };
    
    return mockTransaction;
  } catch (error) {
    console.error('Error creating subscription payment:', error);
    throw error;
  }
};

// Process a payment split transaction using the deployed contract
export const createSplitPayment = async (
  kioskId: string,
  payerAddress: string,
  recipients: Array<{ address: string, share: number }>,
  totalAmount: bigint,
  metadataJson: Record<string, any>
): Promise<any[]> => {
  try {
    const kioskClient = await initKioskClient();
    
    // In a production implementation, we would:
    // 1. Create a Transaction using IOTA SDK
    // 2. Call the payment_splitter::split_payment function from the deployed contract
    // 3. Finalize and return the transaction for signing
    
    console.log(`Using contract at: ${PACKAGE_ID}`);
    
    // Create a transaction for each recipient
    const transactions = [];
    
    for (const recipient of recipients) {
      const recipientAmount = (totalAmount * BigInt(recipient.share)) / BigInt(100);
      
      if (recipientAmount > BigInt(0)) {
        const mockTransaction = {
          id: `tx_${Math.random().toString(36).substring(2, 15)}`,
          kioskId,
          sender: payerAddress,
          recipient: recipient.address,
          amount: recipientAmount,
          packageId: PACKAGE_ID,
          metadata: {
            ...metadataJson,
            recipient_share: recipient.share
          },
          timestamp: Date.now()
        };
        
        transactions.push(mockTransaction);
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error creating split payment:', error);
    throw error;
  }
};

// Get transaction history for a kiosk using the deployed contract
export const getTransactionHistory = async (kioskId: string): Promise<any[]> => {
  try {
    const kioskClient = await initKioskClient();
    
    // In a production implementation, we would:
    // 1. Call the subscription_registry::get_transaction_history function from the deployed contract
    
    console.log(`Using contract at: ${PACKAGE_ID}`);
    
    // Mocking the transaction history as there's no clear documentation for this method
    return [
      {
        id: `tx_${Math.random().toString(36).substring(2, 15)}`,
        kioskId,
        type: 'payment',
        packageId: PACKAGE_ID,
        amount: BigInt(1000000),
        timestamp: Date.now() - 3600000
      },
      {
        id: `tx_${Math.random().toString(36).substring(2, 15)}`,
        kioskId,
        type: 'subscription',
        packageId: PACKAGE_ID,
        amount: BigInt(5000000),
        timestamp: Date.now() - 7200000
      }
    ];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

// Utility function to convert IOTA tokens to human-readable format
export const formatIotaAmount = (amount: bigint): string => {
  const amountString = amount.toString();
  // Format with proper decimal placement for IOTA tokens
  if (amountString.length <= 6) {
    return `0.${amountString.padStart(6, '0')} Mi`;
  } else {
    const integerPart = amountString.slice(0, -6);
    const decimalPart = amountString.slice(-6);
    return `${integerPart}.${decimalPart} Mi`;
  }
};

// Check if wallet is connected
export const isWalletConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  // This would integrate with an actual IOTA wallet connector
  const connectedWallet = localStorage.getItem('connectedWallet');
  return !!connectedWallet;
};

// Connect wallet (placeholder implementation)
export const connectWallet = async (): Promise<string> => {
  // This would integrate with an actual IOTA wallet connector
  // For now, just a placeholder to simulate wallet connection
  const mockAddress = `iota1${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('connectedWallet', mockAddress);
  return mockAddress;
};

// Disconnect wallet
export const disconnectWallet = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('connectedWallet');
};

// Get connected wallet address
export const getWalletAddress = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('connectedWallet');
}; 