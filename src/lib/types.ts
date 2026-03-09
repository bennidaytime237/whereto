export interface AcrossChain {
  chainId: number;
  name: string;
  publicRpcUrl: string;
  explorerUrl: string;
  logoUrl: string;
}

export interface AcrossToken {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
  priceUsd: string;
}

export interface AcrossDeposit {
  id: number;
  relayHash: string | null;
  depositId: string | null;
  originChainId: number;
  destinationChainId: number;
  depositor: string;
  recipient: string;
  inputToken: string;
  inputAmount: string;
  outputToken: string;
  outputAmount: string;
  message: string;
  status: string;
  inputPriceUsd: string | null;
  outputPriceUsd: string | null;
  bridgeFeeUsd: string | null;
  fillGasFeeUsd: string | null;
  depositBlockTimestamp: string;
  fillBlockTimestamp: string | null;
  depositTxHash: string;
  fillTx: string | null;
  relayer: string | null;
  speedups: unknown[];
}

// Aggregated types for leaderboard display

export interface ChainStats {
  chainId: number;
  name: string;
  logoUrl: string;
  explorerUrl: string;
  txCount: number;
  volumeUsd: number;
  avgBridgeTimeSec: number;
  volumeShare: number; // 0-1, share of total volume across all destination chains
  txShare: number; // 0-1, share of total tx count
}

export interface TokenStats {
  symbol: string;
  logoUrl: string;
  txCount: number;
  volumeUsd: number;
}

export interface RouteStats {
  originChainId: number;
  originName: string;
  originLogoUrl: string;
  destinationChainId: number;
  destinationName: string;
  destinationLogoUrl: string;
  txCount: number;
  volumeUsd: number;
}

export interface OverviewStats {
  totalVolumeUsd: number;
  totalTransactions: number;
  avgBridgeTimeSec: number;
  uniqueChains: number;
}
