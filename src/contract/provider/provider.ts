import { ethers } from "ethers";

// Check if environment variables are defined, otherwise provide defaults or throw an error
const rpcUrl = process.env.POLYGON_MUMBI_RPC_URL || "default_rpc_url";
const adminKey = process.env.ADMIN_KEY || "default_admin_key";

export const provider = new ethers.JsonRpcProvider(rpcUrl);

export const adminWallet = new ethers.Wallet(adminKey, provider);

export const adminSign = adminWallet.connect(provider);
