import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
  chainId: string;
  packageId: string;
}

export const networks: Record<string, NetworkConfig> = {
  testnet: {
    name: "IOTA Testnet",
    rpcUrl: "https://api.testnet.iota.org",
    explorerUrl: "https://explorer.testnet.iota.org",
    faucetUrl: "https://faucet.testnet.iota.org",
    chainId: "iota-testnet",
    packageId: "0xe2990fecf7f783c1c31f300468e32e7632cb49e01f2b5dce73bdb6607bbcf7cb",
  },
  mainnet: {
    name: "IOTA Mainnet",
    rpcUrl: "https://api.iota.org",
    explorerUrl: "https://explorer.iota.org",
    chainId: "iota-mainnet",
    packageId: "0xe2990fecf7f783c1c31f300468e32e7632cb49e01f2b5dce73bdb6607bbcf7cb", // Use the same ID for now, update if mainnet deploy is different
  },
};

export const defaultNetwork = networks.testnet;

export { useNetworkVariable, useNetworkVariables, networkConfig };
