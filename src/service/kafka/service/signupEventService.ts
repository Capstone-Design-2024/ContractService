import { UserAuthInfo } from "../../../customType/auth/user";
import sqlCon from "../../../../database/sqlCon";
import moment from "moment-timezone";
import { badRequest, notFound, unAuthorized } from "../../../status/false";
import { sign } from "crypto";
const conn = sqlCon();
moment.tz.setDefault("Asia/Seoul");

const signupEventService = async (data: any) => {
  try {
    const now = moment().format("YYYY-M-D H:m:s");
    const chargeCount = 3;
    await conn.execute(
      "INSERT INTO member_cached VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [
        null,
        data.name,
        data.email,
        data.password,
        data.address,
        data.profile_url,
        data.member_id,
        now,
        now,
        chargeCount,
        data.role,
      ]
    );
  } catch (error: any) {
    console.log(error);
    throw new Error(badRequest.toString());
  }
};

export default signupEventService;
