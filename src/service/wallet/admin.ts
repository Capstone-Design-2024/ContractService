import { Request, Response } from "express";
import {
  badRequest,
  notOwnerOfWallet,
  insufficientReIssueTokenChance,
} from "../../status/false";
import ERC20Contract from "../../contract/ERC20Contract";
import { WalletInfo } from "../../customType/wallet/wallet";
import { ethers } from "ethers";
import sqlCon from "../../../database/sqlCon";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");
const conn = sqlCon();

const CONTRACT_DEPLOYED_NETWORK: string =
  process.env.CONTRACT_DEPLOYED_NETWORK || "defaultNetwork";
const PPT_CONTRACT_NAME: string =
  process.env.PPT_CONTRACT_NAME || "defaultContractName";

const erc20ContractInstance: ERC20Contract = ERC20Contract.getInstance(
  PPT_CONTRACT_NAME,
  CONTRACT_DEPLOYED_NETWORK
);

export const mintPPToken = async (req: Request, res: Response) => {
  try {
    const { wallet_address } = req.body as WalletInfo;
    const member_id: number = req.decoded.ID;

    const [userData]: any[] = await conn.execute(
      "SELECT charge_count FROM member_cached WHERE member_id = ?",
      [member_id]
    );

    const [userWallet]: any[] = await conn.execute(
      "SELECT * FROM wallet WHERE member_id = ?",
      [member_id]
    );

    if (!userData || userData.length === 0 || userData[0].charge_count <= 0) {
      return res.status(400).json(insufficientReIssueTokenChance);
    }

    if (userWallet[0].wallet_address != wallet_address) {
      return res.status(401).json(notOwnerOfWallet);
    }

    console.log("=======Minting Start=======");

    const receipt = await erc20ContractInstance.mint(wallet_address);
    console.log("=======Minting Finish=======");

    await conn.execute(
      "UPDATE member_cached SET charge_count = ? WHERE member_id = ?",
      [userData[0].charge_count - 1, member_id]
    );

    return res.status(200).json({
      message: "성공적으로 PPT를 발행했습니다.",
      receipt,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};
