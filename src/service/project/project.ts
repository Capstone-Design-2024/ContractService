import { Request, Response } from "express";
import { badRequestBlockChain, notOwnerOfWallet } from "../../status/false";
import ERC20Contract from "../../contract/ERC20Contract";
import { TransactionFrom } from "../../customType/tx/tx";
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

export const getProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.body.project_id;

    const receipt = await erc20ContractInstance.getProject(projectId);
    const receipt_lst = receipt.split(",");
    const project_meta_info = {
      title: receipt_lst[0],
      makerAddress: receipt_lst[1],
      price: receipt_lst[2],
      tokenURI: receipt_lst[3],
      publishedTokenId: receipt_lst[4],
    };

    return res.status(200).json({
      message: `프로젝트의 메타 정보를 가져옵니다.`,
      project_meta_info,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequestBlockChain(error.reason));
  }
};

export const buyProject = async (req: Request, res: Response) => {
  try {
    const { project_id, payment } = req.body;

    const receipt = await erc20ContractInstance.buyProject(project_id, payment);
    console.log(receipt);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequestBlockChain(error.reason));
  }
};
