// import { sendNotification } from "../../index"; // tu función WS
import { getRabbitMQChannel } from "../../infrastructure/eventBus/RabbitMQConfig";
import { NotificationModel } from "../../infrastructure/repositories/notification.repository";

export async function startRabbitSubscriber() {
  const ch = await getRabbitMQChannel();

  const EXCHANGE = "adamo.notifications";
  const QUEUE = "adamo.notifications.queue";
  const ROUTING = "#";

  await ch.assertExchange(EXCHANGE, "topic", { durable: true });
  await ch.assertQueue(QUEUE, { durable: true });
  await ch.bindQueue(QUEUE, EXCHANGE, ROUTING);

  console.log(`🔔 Subscribed to ${EXCHANGE} → ${QUEUE}`);

  await ch.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return;
      try {
        const { userId, payload } = JSON.parse(msg.content.toString());
        await NotificationModel.create({
          user: userId,
          ...payload,
          createdAt: new Date(),
          read: false,
        });
        // sendNotification(userId, payload);
        ch.ack(msg);
      } catch (e) {
        console.error("❌ Error processing notification:", e);
        ch.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}
