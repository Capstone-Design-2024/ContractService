import { Request, Response } from "express";
import { badRequest, notMatchedMnemonic } from "../../status/false";
import {
  WalletGenerationInfo,
  WalletInfo,
} from "../../customType/wallet/wallet";
import { hdkey } from "ethereumjs-wallet";
import { ethers } from "ethers";
import * as bip39 from "bip39";
import sqlCon from "../../../database/sqlCon";
import moment from "moment-timezone";
import { provider } from "../../contract/provider/provider";
moment.tz.setDefault("Asia/Seoul");
const conn = sqlCon();

const createWallet = async (mnemonic: string) => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const rootKey = hdkey.fromMasterSeed(seed);
  const hardenedKey = rootKey.derivePath("m/44'/60'/0'/0");
  const childKey = hardenedKey.deriveChild(0);
  const wallet = childKey.getWallet();

  return wallet;
};

export const walletGenerate = async (req: Request, res: Response) => {
  try {
    const now = moment().format("YYYY-M-D H:m:s");
    const member_id = req.decoded.member_id;

    let { mnemonic } = req.body as WalletGenerationInfo;
    if (!mnemonic) {
      mnemonic = bip39.generateMnemonic();
    }

    const wallet = await createWallet(mnemonic);

    const connectedWallet = new ethers.Wallet(
      wallet.getPrivateKeyString(),
      provider
    );

    const wallet_address = connectedWallet.address;

    const existingWallet: WalletInfo[] = (
      await conn.execute(
        "SELECT wallet_address FROM wallet WHERE member_id = ?",
        [member_id]
      )
    )[0] as WalletInfo[];

    if (existingWallet.length !== 0) {
      if (existingWallet[0].wallet_address != wallet_address) {
        return res.status(400).json(notMatchedMnemonic);
      }
      return res.status(201).json({
        message: `지갑 복구 성공. 비밀키를 외부에 노출하지 마세요.`,
        public_key: wallet_address,
        private_key: wallet.getPrivateKeyString(),
        mnemonic,
      });
    }

    await conn.execute("INSERT INTO wallet VALUES (?,?,?,?,?)", [
      null,
      wallet_address,
      member_id,
      now,
      now,
    ]);

    return res.status(201).json({
      message: `지갑 생성 성공. 비밀키를 외부에 노출하지 마세요.`,
      public_key: wallet_address,
      private_key: wallet.getPrivateKeyString(),
      mnemonic,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};

export const getWalletAddress = async (req: Request, res: Response) => {
  try {
    const token = req.decoded;
    const member_id = token.member_id;
    const existingWallet: WalletInfo[] = (
      await conn.execute(
        "SELECT wallet_address FROM wallet WHERE member_id = ?",
        [member_id]
      )
    )[0] as WalletInfo[];
    return res.status(200).json({
      existingWallet: existingWallet[0],
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};
