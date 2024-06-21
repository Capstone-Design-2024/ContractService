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

// 이 부분은 프론트엔드 부분
export const approveAndTx = async (req: Request, res: Response) => {
  try {
    const { from, to, amount } = req.body as TransactionFrom;
    const member_id: number = req.decoded.member_id;

    const [userWallet]: any[] = await conn.execute(
      "SELECT * FROM wallet WHERE member_id = ?",
      [member_id]
    );

    if (userWallet[0].wallet_address != from) {
      return res.status(401).json(notOwnerOfWallet);
    }

    console.log("=======Approving Start=======");
    /**
     * FrontEnd에서 Provider 설정부터 clientSign까지만 설정할 수 있으면 Class만 가지고도 트랜잭션 가능
     */
    const provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_MUMBI_RPC_URL
    );

    const clientWallet = new ethers.Wallet(
      process.env.CL_PK as string,
      provider
    );

    const clientSign = clientWallet.connect(provider);

    const receipt = await erc20ContractInstance.approve(clientSign, amount);

    console.log("=======Approving Finish=======");
    console.log("=======TransferFrom Start=======");

    const txRecept = await erc20ContractInstance.transferFrom(from, to, amount);
    console.log("=======TransferFrom Finish=======");
    return res.status(200).json({
      message: `Sender의 계좌에서 ${amount} 금액만큼을 approve 했습니다.\n Sender: ${from} \n Receiver: ${to} \n amount: ${amount} 송금 하였습니다.`,
      txRecept,
    });

    // return res.status(200).json({
    //   message: `성공적으로 PPT를 ${amount}만큼 Approve 했습니다.`,
    //   receipt,
    // });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequestBlockChain(error.reason));
  }
};
