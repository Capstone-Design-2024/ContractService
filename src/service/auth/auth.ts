import { Request, Response } from "express";
import { badRequest, notFound, unAuthorized } from "../../status/false";
import { UserAuthInfo, UserSignInInfo } from "../../customType/auth/user";
import sqlCon from "../../../database/sqlCon";
import moment from "moment-timezone";
import jwt from "jsonwebtoken";
moment.tz.setDefault("Asia/Seoul");
const conn = sqlCon();

export const signup = async (req: Request, res: Response) => {
  try {
    const now = moment().format("YYYY-M-D H:m:s");
    const { name, email, pwd, address, profile_url, member_id } =
      req.body as UserAuthInfo;

    await conn.execute(
      "INSERT INTO member_cached VALUES (?,?,?,?,?,?,?,?,?,?)",
      [null, name, email, pwd, address, profile_url, member_id, now, now, 3]
    );

    return res.status(201).json({
      message: `${email} 에 대한 회원가입이 성공적으로 진행됐습니다.`,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, pwd } = req.body as UserSignInInfo;
    const users: UserAuthInfo[] = (
      await conn.execute(
        "SELECT email, member_id, pwd, name FROM member_cached WHERE email=?",
        [email]
      )
    )[0] as UserAuthInfo[];

    const user: UserAuthInfo = users[0];

    if (!user) return res.status(404).json(notFound);

    if (user.pwd != pwd) return res.status(401).json(unAuthorized);
    const token = jwt.sign(
      { member_id: user.member_id, email: user.email, name: user.name },
      process.env.SECRET as string,
      {
        expiresIn: "1h", // 토큰 만료 시간 설정
      }
    );

    return res.status(200).json({
      message: `${email} 에 대한 로그인이 성공했습니다.`,
      token,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json(badRequest);
  }
};
