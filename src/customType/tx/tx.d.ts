import { Wallet } from "ethers";

export interface TransactionFrom {
  from: string;
  to: string;
  amount: number;
}

export interface ApproveTxFrom {
  from: string;
  to: string;
  amount: number;
  clientWallet: Wallet;
}
