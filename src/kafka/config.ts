import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

// 환경 변수에서 브로커 정보를 가져올 때, 이를 적절히 분리하고 유효성을 검사합니다.
const kafkaBrokers: string[] =
  process.env.KAFKA_BROKER_ORIGIN?.split(",") ?? [];

// Kafka 설정 객체를 초기화합니다.
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "defaultClientId",
  brokers: kafkaBrokers,
});

export default kafka;
