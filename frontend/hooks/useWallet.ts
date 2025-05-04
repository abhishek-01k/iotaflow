import { useState, useEffect, useCallback } from "react";
import { ConnectButton } from "@iota/dapp-kit";
import { IotaWallet } from "@/lib/iota";

// Define wallet hook types
interface WalletState {
  connecting: boolean;
  connected: boolean;
  currentAccount: string | null;
  walletBalance: number | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connecting: false,
    connected: false,
    currentAccount: null,
    walletBalance: null,
  });

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await IotaWallet.isConnected();
        if (isConnected) {
          const account = await IotaWallet.getAccount();
          const balance = await IotaWallet.getBalance();
          setState({
            connecting: false,
            connected: true,
            currentAccount: account,
            walletBalance: balance,
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkConnection();
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, connecting: true }));
      await IotaWallet.connect();
      const account = await IotaWallet.getAccount();
      const balance = await IotaWallet.getBalance();
      setState({
        connecting: false,
        connected: true,
        currentAccount: account,
        walletBalance: balance,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setState((prev) => ({ ...prev, connecting: false }));
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await IotaWallet.disconnect();
      setState({
        connecting: false,
        connected: false,
        currentAccount: null,
        walletBalance: null,
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }, []);

  // Refresh wallet balance
  const refreshBalance = useCallback(async () => {
    if (state.connected) {
      try {
        const balance = await IotaWallet.getBalance();
        setState((prev) => ({ ...prev, walletBalance: balance }));
      } catch (error) {
        console.error("Error refreshing balance:", error);
      }
    }
  }, [state.connected]);

  // Effect to periodically refresh balance when connected
  useEffect(() => {
    if (!state.connected) return;

    refreshBalance();
    const intervalId = setInterval(refreshBalance, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId);
  }, [state.connected, refreshBalance]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
} 