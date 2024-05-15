import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import sqlCon from "../../database/sqlCon";
import dotenv from "dotenv";
dotenv.config();
const conn = sqlCon();

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.decoded = jwt.verify(
      (req.headers.authorization as string).replace(/^Bearer\s/, ""),
      process.env.SECRET as string
    ) as JwtPayload;
    if (req.decoded.allowResult) {
      return res.status(403).json({
        error: "403 Forbidden",
        message: "Authorization 토큰이 아닙니다.",
      });
    }

    const queryResult: any = await conn.execute(
      "SELECT * FROM member_cached WHERE email = ?",
      [req.decoded.sub]
    );
    const DBSearchResult: any = queryResult[0][0] as any;

    if (DBSearchResult["role"] == "ADMIN") {
      return next();
    } else {
      throw new Error("AccessDeny - Low Authentication");
    }
  } catch (err: any) {
    if (err.name == "TokenExpiredError") {
      return res.status(403).json({
        error: "403 Forbidden",
        message: "토큰이 만료됐습니다.",
      });
    }
    console.log(err);
    return res.status(403).json({
      error: "403 Forbidden",
      message: "해당 라우터 접근 권한이 없습니다.",
    });
  }
};

export default isAdmin;
