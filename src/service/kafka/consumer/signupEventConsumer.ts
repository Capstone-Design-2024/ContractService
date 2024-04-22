import kafka from "../../../kafka/config";
import sqlCon from "../../../../database/sqlCon";
import dotenv from "dotenv";
import moment from "moment-timezone";
import { UserAuthInfo } from "../../../customType/auth/user";
import signupEventService from "../service/signupEventService";

moment.tz.setDefault("Asia/Seoul");
dotenv.config();
const conn = sqlCon();

const producer = kafka.producer();
const consumer = kafka.consumer({
  groupId: "signupEventConsumers",
});

const SIGNUP_EVENT = "signup-event";

const consumerSubscribe = {
  topic: SIGNUP_EVENT,
  fromBeginning: true,
};

export const signupEventConsumer = async () => {
  let tryNum = 1;
  await consumer.subscribe(consumerSubscribe);
  await producer.connect();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageValue: string = message.value?.toString("utf-8") as string;
        const messageJson = JSON.parse(messageValue);
        const data = messageJson.data;

        await signupEventService(data);
        console.log(
          `#${SIGNUP_EVENT} topic is consumed and data ${data} is successfully saved in the database.`
        );
      } catch (error) {
        console.error(error);
        if (tryNum < 3) {
          tryNum++;
          consumer.seek({
            topic,
            partition,
            offset: message.offset,
          });
        } else {
          console.error("Failed to process message after 3 attempts");
        }
      }
    },
  });
};
