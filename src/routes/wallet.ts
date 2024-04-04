import express, { Router } from "express";
import { walletGenerate, getWalletAddress } from "../service/wallet/management";
import {
  getBalance,
  initialSupplyAmount,
  remainSupplyAmount,
} from "../service/wallet/usage";
import { mintPPToken } from "../service/wallet/admin";
import accessControl from "../middleWare/accessControl";
const router: Router = express.Router();

router.post("/create", accessControl, walletGenerate);
router.post("/mint", accessControl, mintPPToken);
router.post("/balance", accessControl, getBalance);

router.get("/", accessControl, getWalletAddress);
router.get("/initialSupply", accessControl, initialSupplyAmount);
router.get("/remainSupply", accessControl, remainSupplyAmount);

export default router;
