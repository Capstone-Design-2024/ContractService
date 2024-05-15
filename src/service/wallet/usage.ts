import { Request, Response } from "express";
import { badRequestBlockChain, badRequest } from "../../status/false";
import ERC20Contract from "../../contract/ERC20Contract";
import sqlCon from "../../../database/sqlCon";
import moment from "moment-timezone";
import { WalletInfo } from "../../customType/wallet/wallet";
import { ContractMetaInfo } from "../../customType/contract/contract";
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

export const getContractInfo = async (req: Request, res: Response) => {
  try {
    const { contract_id } = req.body;
    const contractMetaInfo: ContractMetaInfo[] = (
      await conn.execute(
        "SELECT address, contract_factory_name, abi FROM contract_info WHERE cnt_id = ?",
        [contract_id]
      )
    )[0] as ContractMetaInfo[];
    return res.status(200).json({ contractMetaInfo });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};
