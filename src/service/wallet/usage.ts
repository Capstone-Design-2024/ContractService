import { Request, Response } from "express";
import { badRequestBlockChain, badRequest } from "../../status/false";
import ERC20Contract from "../../contract/ERC20Contract";
import sqlCon from "../../../database/sqlCon";
import moment from "moment-timezone";
import { WalletInfo } from "../../customType/wallet/wallet";
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

export const initialSupplyAmount = async (req: Request, res: Response) => {
  try {
    const receipt = await erc20ContractInstance.initialSupply();
    return res.status(200).json({
      message: "초기 발행 PPT 개수",
      receipt,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};

export const remainSupplyAmount = async (req: Request, res: Response) => {
  try {
    const receipt = await erc20ContractInstance.availableSupply();
    return res.status(200).json({
      message: "발행 가능한 PPT 개수",
      receipt,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const { wallet_address } = req.body as WalletInfo;

    const receipt = await erc20ContractInstance.balanceOf(wallet_address);

    return res.status(200).json({
      receipt,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequestBlockChain(error.reason));
  }
};
