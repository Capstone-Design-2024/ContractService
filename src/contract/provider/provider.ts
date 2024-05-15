import { ethers } from "ethers";

// Check if environment variables are defined, otherwise provide defaults or throw an error
const rpcUrl = process.env.POLYGON_AMOY_RPC_URL;
const adminKey = process.env.SUPERVISOR_KEY || "default_admin_key";

export const provider = new ethers.JsonRpcProvider(rpcUrl);

export const adminWallet = new ethers.Wallet(adminKey, provider);

export const adminSign = adminWallet.connect(provider);
