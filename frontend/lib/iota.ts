// Define the expected wallet instance type
type WalletInstance = {
  address: {
    secret: {
      generateEd25519Addresses: (options: any) => Promise<string[]>;
    };
  };
  getBalance: () => Promise<{
    baseCoin: {
      available: number;
    };
  }>;
};

class IotaWalletAdapter {
  private static instance: IotaWalletAdapter;
  private walletInstance: WalletInstance | null = null;
  private walletConnected = false;
  private currentAddress: string | null = null;
  
  // Add the deployed package ID
  private readonly IOTAFLOW_PACKAGE_ID = "0xe2990fecf7f783c1c31f300468e32e7632cb49e01f2b5dce73bdb6607bbcf7cb";
  
  private constructor() {
    // Check for wallet connection on initialization
    this.checkWalletConnection();
  }

  private async checkWalletConnection() {
    try {
      if (typeof window === "undefined") return;
      
      // Check if wallet extension exists and is connected
      if ((window as any).iota && (window as any).iota.isConnected) {
        this.walletConnected = await (window as any).iota.isConnected();
        
        if (this.walletConnected) {
          this.walletInstance = await (window as any).iota.getWallet();
          // Get the current address
          await this.updateCurrentAddress();
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      this.walletConnected = false;
    }
  }

  private async updateCurrentAddress() {
    try {
      if (!this.walletInstance) return null;
      
      const addresses = await this.walletInstance.address.secret.generateEd25519Addresses({
        accountIndex: 0,
        range: {
          start: 0,
          end: 1,
        },
      });
      
      this.currentAddress = addresses[0];
    } catch (error) {
      console.error("Error getting address:", error);
      this.currentAddress = null;
    }
  }

  public static getInstance(): IotaWalletAdapter {
    if (!IotaWalletAdapter.instance) {
      IotaWalletAdapter.instance = new IotaWalletAdapter();
    }
    return IotaWalletAdapter.instance;
  }

  /**
   * Connect to the IOTA wallet
   */
  public async connect(): Promise<string> {
    try {
      // Check if window object exists (browser environment)
      if (typeof window === "undefined") {
        throw new Error("Cannot connect wallet in non-browser environment");
      }

      // Check if wallet extension exists
      if (!(window as any).iota) {
        throw new Error(
          "IOTA wallet extension not found. Please install the extension."
        );
      }

      // Request connection to the wallet
      await (window as any).iota.requestPermissions({
        permissions: ["address:ed25519", "address:alias"],
      });

      // Get wallet instance
      this.walletInstance = await (window as any).iota.getWallet();
      this.walletConnected = true;

      // Get the first address
      await this.updateCurrentAddress();
      
      if (!this.currentAddress) {
        throw new Error("Failed to get wallet address");
      }
      
      return this.currentAddress;
    } catch (error) {
      console.error("Error connecting to IOTA wallet:", error);
      this.walletConnected = false;
      this.currentAddress = null;
      throw error;
    }
  }

  /**
   * Disconnect from the IOTA wallet
   */
  public async disconnect(): Promise<void> {
    // If the wallet extension has a disconnect method, call it
    if (typeof window !== "undefined" && (window as any).iota && (window as any).iota.disconnect) {
      try {
        await (window as any).iota.disconnect();
      } catch (error) {
        console.error("Error disconnecting from wallet extension:", error);
      }
    }
    
    this.walletInstance = null;
    this.walletConnected = false;
    this.currentAddress = null;
  }

  /**
   * Check if wallet is connected
   */
  public isConnected(): boolean {
    // If in browser, try to get the connected state from the extension
    if (typeof window !== "undefined" && (window as any).iota && (window as any).iota.isConnected) {
      try {
        const connectedState = (window as any).iota.isConnected();
        // Update our internal state
        this.walletConnected = connectedState;
        return connectedState;
      } catch (error) {
        console.error("Error checking wallet connection state:", error);
      }
    }
    
    return this.walletConnected && this.walletInstance !== null;
  }

  /**
   * Get current account address
   */
  public getAccount(): string | null {
    return this.currentAddress;
  }

  /**
   * Get wallet balance in microIOTA
   */
  public async getBalance(): Promise<number> {
    if (!this.walletConnected || !this.walletInstance) {
      throw new Error("Wallet not connected");
    }

    try {
      const balanceResponse = await this.walletInstance.getBalance();
      return balanceResponse.baseCoin.available;
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      throw error;
    }
  }

  /**
   * Sign a transaction
   */
  public async signTransaction(transaction: any): Promise<any> {
    if (!this.walletConnected || !this.walletInstance) {
      throw new Error("Wallet not connected");
    }

    try {
      const signedTransaction = await (window as any).iota.signTransaction({
        transaction,
        addressType: "ed25519",
      });
      return signedTransaction;
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }
  }

  /**
   * Send a transaction
   */
  public async sendTransaction(
    recipientAddress: string,
    amount: number
  ): Promise<string> {
    if (!this.walletConnected || !this.walletInstance) {
      throw new Error("Wallet not connected");
    }

    try {
      const transaction = {
        type: "BasicOutput",
        amount: amount.toString(),
        recipientAddress,
      };

      const signedTransaction = await this.signTransaction(transaction);
      const response = await (window as any).iota.sendTransaction({
        signedTransaction,
      });

      return response.transactionId;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }

  /**
   * Execute a smart contract call
   */
  public async executeContract(
    contractAddress: string,
    methodName: string,
    args: any[],
    amount: number = 0
  ): Promise<any> {
    if (!this.walletConnected || !this.walletInstance) {
      throw new Error("Wallet not connected");
    }

    try {
      // If contractAddress is not provided, use the deployed package ID
      const targetAddress = contractAddress || this.IOTAFLOW_PACKAGE_ID;
      
      console.log(`Executing contract call: ${methodName} on ${targetAddress} with args:`, args);
      
      const transaction = {
        type: "BasicOutput",
        amount: amount.toString(),
        recipientAddress: targetAddress,
        payload: {
          type: "Contract",
          method: methodName,
          args,
        },
      };

      const signedTransaction = await this.signTransaction(transaction);
      const response = await (window as any).iota.sendTransaction({
        signedTransaction,
      });

      return response;
    } catch (error) {
      console.error("Error executing contract:", error);
      throw error;
    }
  }

  /**
   * Get the package ID of the deployed contract
   */
  public getPackageId(): string {
    return this.IOTAFLOW_PACKAGE_ID;
  }
}

// Export a singleton instance
export const IotaWallet = {
  connect: async (): Promise<string> => {
    return await IotaWalletAdapter.getInstance().connect();
  },
  disconnect: async (): Promise<void> => {
    return await IotaWalletAdapter.getInstance().disconnect();
  },
  isConnected: (): boolean => {
    return IotaWalletAdapter.getInstance().isConnected();
  },
  getAccount: (): string | null => {
    return IotaWalletAdapter.getInstance().getAccount();
  },
  getBalance: async (): Promise<number> => {
    return await IotaWalletAdapter.getInstance().getBalance();
  },
  signTransaction: async (transaction: any): Promise<any> => {
    return await IotaWalletAdapter.getInstance().signTransaction(transaction);
  },
  sendTransaction: async (
    recipientAddress: string,
    amount: number
  ): Promise<string> => {
    return await IotaWalletAdapter.getInstance().sendTransaction(
      recipientAddress,
      amount
    );
  },
  executeContract: async (
    contractAddress: string,
    methodName: string,
    args: any[],
    amount: number = 0
  ): Promise<any> => {
    return await IotaWalletAdapter.getInstance().executeContract(
      contractAddress,
      methodName,
      args,
      amount
    );
  },
  getPackageId: (): string => {
    return IotaWalletAdapter.getInstance().getPackageId();
  },
}; 