import { TransactionReceipt, ethers, formatUnits } from "ethers";
import { provider, adminSign } from "./provider/provider";
import { ContractMetaInfo } from "../customType/contract/contract";
import sqlCon from "../../database/sqlCon";
const conn = sqlCon();

class ERC20Contract {
  private static instance: ERC20Contract;
  private contract: ethers.Contract | null = null;

  private constructor(contractFactoryName: string, network: string) {
    this.getContractInfo(contractFactoryName, network).then(
      (contract: ContractMetaInfo) => {
        this.contract = new ethers.Contract(
          contract.address,
          contract.abi,
          provider
        );
      }
    );
  }

  private async getContractInfo(contractFactoryName: string, network: string) {
    const contractInfo: ContractMetaInfo[] = (
      await conn.execute(
        "SELECT address, abi FROM contract_info WHERE contract_factory_name = ? and network = ?",
        [contractFactoryName, network]
      )
    )[0] as ContractMetaInfo[];
    if (contractInfo.length > 1) {
      throw new Error("동일한 이름의 Contract가 동일한 네트워크에 존재합니다.");
    }
    return contractInfo[0];
  }

  public static getInstance(
    contractFactoryName: string,
    network: string
  ): ERC20Contract {
    if (!ERC20Contract.instance) {
      ERC20Contract.instance = new ERC20Contract(contractFactoryName, network);
    }
    return ERC20Contract.instance;
  }

  async mint(recipient: string): Promise<TransactionReceipt | null> {
    const params = [recipient, process.env.PPT_MINT_AMOUNT];
    console.log(params);
    const to = await this.contract?.getAddress();
    console.log(`Contract Address: ${to}`);
    const data = this.contract?.interface.encodeFunctionData("mint", params);
    console.log(`Contract Caller Is Ready \n ${data}`);
    const tx = {
      to,
      data,
    };

    console.log(`========Transaction Start========`);
    const signedTx = await adminSign.sendTransaction(tx);

    const receipt = await signedTx.wait();
    console.log(`========Transaction Finish========`);
    return receipt;
  }

  async initialSupply(): Promise<string> {
    const result = await this.contract?.totalSupply();
    console.log(`ERC20 PPT initial supply amount is: ${result}`);
    return result.toString();
  }

  async availableSupply(): Promise<number> {
    const result = await this.contract?.balanceOf(
      process.env.SUPERVISOR_WALLET_KEY
    );
    console.log(`ERC20 Remain PPT balance is: ${result}`);
    return result.toString();
  }

  async balanceOf(owner: string): Promise<any> {
    const result = await this.contract?.balanceOf(owner);
    console.log(`Address ${owner} balance is: ${result}`);
    return result.toString();
  }

  async approve(clientSign: ethers.Wallet, amount: number): Promise<any> {
    const params = [process.env.SUPERVISOR_WALLET_KEY, amount];
    const ca = await this.contract?.getAddress();
    console.log(`Contract Address: ${ca}`);

    const data = this.contract?.interface.encodeFunctionData("approve", params);
    console.log(`Contract Caller Is Ready \n ${data}`);

    console.log("서비스가 사용자에게 수수료를 제공중입니다.");
    await this.estimateGasForClient(clientSign, data, ca as string);

    const tx = {
      to: ca,
      data,
    };
    console.log(`========Transaction Start========`);
    const signedTx = await clientSign.sendTransaction(tx);

    const receipt = await signedTx.wait();
    console.log(`========Transaction Finish========`);
    return receipt;
  }

  async transferFrom(from: string, to: string, amount: number): Promise<any> {
    const params = [from, to, amount];
    const ca = await this.contract?.getAddress();
    console.log(`Contract Address: ${ca}`);

    const data = this.contract?.interface.encodeFunctionData(
      "transferFrom",
      params
    );
    console.log(`Contract Caller Is Ready \n ${data}`);

    const tx = {
      to: ca,
      data,
    };
    console.log(`========Transaction Start========`);
    const signedTx = await adminSign.sendTransaction(tx);

    const receipt = await signedTx.wait();
    console.log(`========Transaction Finish========`);

    return receipt;
  }

  async createProject(
    title: string,
    tokenURI: string,
    makerAddress: string,
    projectId: number,
    price: number
  ) {
    const params = [title, tokenURI, makerAddress, projectId, price];
    const ca = await this.contract?.getAddress();
    console.log(`Contract Address: ${ca}`);

    const data = this.contract?.interface.encodeFunctionData(
      "createProject",
      params
    );

    console.log(`Contract Caller Is Ready \n ${data}`);

    const tx = {
      to: ca,
      data,
    };

    console.log(`========Transaction Start========`);
    const signedTx = await adminSign.sendTransaction(tx);

    const receipt = await signedTx.wait();
    console.log(`========Transaction Finish========`);

    return receipt;
  }

  async getProject(projectId: number) {
    const result = await this.contract?.getProject(projectId);
    console.log(`Proejct # ${projectId} meta-infomation below`);
    console.log(`${result}`);
    return result.toString();
  }

  async buyProject(projectId: number, payment: number) {
    const params = [projectId, payment];
    const ca = await this.contract?.getAddress();
    console.log(`Contract Address: ${ca}`);

    const data = this.contract?.interface.encodeFunctionData(
      "buyProject",
      params
    );

    console.log(`Contract Caller Is Ready \n ${data}`);

    const tx = {
      to: ca,
      data,
    };

    console.log(`========Transaction Start========`);
    const signedTx = await adminSign.sendTransaction(tx);

    const receipt = await signedTx.wait();
    console.log(`========Transaction Finish========`);

    return receipt;
  }

  private async estimateGasForClient(
    clientSign: ethers.Wallet,
    data: any,
    ca: string
  ) {
    const tx = {
      to: ca,
      data,
    };

    const gasAmount = await clientSign.estimateGas(tx);

    const gasEstimate = await provider.getFeeData();
    const maxPriorityFeePerGas: bigint =
      gasEstimate.maxPriorityFeePerGas as bigint;

    const extraDonate = (maxPriorityFeePerGas * gasAmount) / 10n;

    console.log(
      `donation amount : ${maxPriorityFeePerGas * gasAmount + extraDonate}`
    );

    const donateTx = {
      to: clientSign.address,
      value: maxPriorityFeePerGas * gasAmount + extraDonate,
    };
    const receipt = await adminSign.sendTransaction(donateTx);
    console.log(`수수료 사용자 전달 완료`);

    return receipt;
  }
}

export default ERC20Contract;
