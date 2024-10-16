import express, { Router } from "express";
import {
  buyProject,
  getProject,
  projectBuyer,
} from "../service/project/project";
import accessControl from "../middleWare/accessControl";
const router: Router = express.Router();

router.post("/meta", accessControl, getProject);
router.post("/buy", accessControl, buyProject);
router.post("/buyer-list", projectBuyer);

export default router;
