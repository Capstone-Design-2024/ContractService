import { UserAuthInfo } from "../../../customType/auth/user";
import sqlCon from "../../../../database/sqlCon";
import moment from "moment-timezone";
import { badRequest, notFound, unAuthorized } from "../../../status/false";
import axios from "axios";
import ERC20Contract from "../../../contract/ERC20Contract";

const conn = sqlCon();
moment.tz.setDefault("Asia/Seoul");

const PINATA_API_KEY = process.env.PINATA_API_KEY as string;
const PINATA_API_URI = process.env.PINATA_API_URI as string;
const CONTRACT_DEPLOYED_NETWORK: string =
  process.env.CONTRACT_DEPLOYED_NETWORK || "defaultNetwork";
const PPT_CONTRACT_NAME: string =
  process.env.PPT_CONTRACT_NAME || "defaultContractName";

const erc20ContractInstance: ERC20Contract = ERC20Contract.getInstance(
  PPT_CONTRACT_NAME,
  CONTRACT_DEPLOYED_NETWORK
);

const nftRegistryEventService = async (data: any) => {
  try {
    const walletAddress = (await conn.execute(
      "SELECT wallet_address FROM wallet WHERE member_id = ?",
      [data.maker_id]
    )) as any;
    const makerAddress = walletAddress[0][0].wallet_address;

    const res = await pinataTokenURIUploader(data);
    const tokenURI = "https://ipfs.io/ipfs/" + res.data.IpfsHash;
    const receipt = await erc20ContractInstance.createProject(
      data.title,
      tokenURI,
      makerAddress,
      data.project_id,
      data.price
    );
    console.log(
      "====================TX successfully done!========================="
    );
    console.log(receipt);
  } catch (error: any) {
    console.log(error);
    throw new Error(badRequest.toString());
  }
};

const pinataTokenURIUploader = async (data: any) => {
  const tokenURI = {
    name: data.title,
    description: data.description,
    image: data.image_uri,
    external_url: "http://itm.suitestudy.com/",
    attributes: [
      {
        trait_type: "Price of ticket",
        value: data.price,
      },
    ],
  };

  const pinataData = {
    pinataOptions: { cidVersion: 1 },
    pinataMetadata: { name: data.title + ".json" },
    pinataContent: tokenURI,
  };

  const config = {
    headers: {
      Authorization: `Bearer ${PINATA_API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.post(PINATA_API_URI, pinataData, config);
    return res;
  } catch (error: any) {
    console.log(error);
    throw new Error(badRequest.toString());
  }
};

export default nftRegistryEventService;
