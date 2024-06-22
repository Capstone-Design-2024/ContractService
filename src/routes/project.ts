import express, { Router } from "express";
import { buyProject, getProject } from "../service/project/project";
import accessControl from "../middleWare/accessControl";
const router: Router = express.Router();

router.post("/meta", accessControl, getProject);
router.post("/buy", accessControl, buyProject);

export default router;
