import kafka from "../../../kafka/config";
import sqlCon from "../../../../database/sqlCon";
import dotenv from "dotenv";
import moment from "moment-timezone";
import nftRegistryEventService from "../service/nftRegistryEventService";

moment.tz.setDefault("Asia/Seoul");
dotenv.config();
const conn = sqlCon();

const producer = kafka.producer();
const consumer = kafka.consumer({
  groupId: "nftRegistryConsumers",
});

const NFT_REGISTRY_EVENT = "nft-registry-event";

const consumerSubscribe = {
  topic: NFT_REGISTRY_EVENT,
  fromBeginning: true,
};

export const nftRegistryEventConsumer = async () => {
  let tryNum = 1;
  await consumer.subscribe(consumerSubscribe);
  await producer.connect();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageValue: string = message.value?.toString("utf-8") as string;
        const messageJson = JSON.parse(messageValue);

        const data = messageJson.data;

        await nftRegistryEventService(data);
        console.log(
          `#${NFT_REGISTRY_EVENT} topic is consumed and data ${messageJson} is successfully saved in the database.`
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
