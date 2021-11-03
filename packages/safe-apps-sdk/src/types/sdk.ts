export type BaseTransaction = {
  to: string;
  value: string;
  data: string;
};

export type GetTxBySafeTxHashParams = {
  safeTxHash: string;
};

export interface SendTransactionRequestParams {
  safeTxGas?: string;
  baseGas?: string;
  gasPrice?: string;
  gasToken?: string;
  refundReceiver?: string;
  nonce?: string;
}

export interface SendTransactionsParams {
  txs: BaseTransaction[];
  params?: SendTransactionRequestParams;
}

export type GetBalanceParams = { currency?: string };

export type SignMessageParams = {
  message: string;
};

export type SendTransactionsResponse = {
  safeTxHash: string;
};

export type SafeInfo = {
  safeAddress: string;
  chainId: number;
  threshold: number;
  owners: string[];
};
