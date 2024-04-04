import express, { Router } from "express";
import { approveAndTx } from "../service/transaction/p2pTx";
import accessControl from "../middleWare/accessControl";
const router: Router = express.Router();

router.post("/approveTx", accessControl, approveAndTx);

export default router;
