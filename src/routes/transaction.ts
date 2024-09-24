import express, { Router } from "express";
import { approveAndTx, approve } from "../service/transaction/p2pTx";
import accessControl from "../middleWare/accessControl";
const router: Router = express.Router();

router.post("/approveTx", accessControl, approveAndTx);
router.post("/approve", accessControl, approve);

export default router;
