// src/infrastructure/rabbitmq/rabbitmq.service.ts
import amqplib, { Channel } from "amqplib";

export class RabbitMQService {
  private static _channel: Channel;

  public static async getChannel(): Promise<Channel> {
    if (this._channel) return this._channel;

    const url = process.env.RABBITMQ_URL!;
    const conn = await amqplib.connect(url);
    const channel = await conn.createChannel();
    await channel.assertQueue("delete_documents_bulk", { durable: true });
    channel.prefetch(5);
    this._channel = channel;
    return channel;
  }

  public static async publishTransactionalEmailQueue(
    from: string,
    to: string,
    subject: string,
    text: string,
    content: any
  ) {
    try {
      console.log("Publishing transactional email to RabbitMQ queue...");
      const ch = await this.getChannel();

      const payload = JSON.stringify({
        action: "send_email",
        dataEmail: {
          from,
          to,
          subject,
          text,
          content,
        },
        timestamp: Date.now(),
      });
      console.log("Payload for transactional email OK");

      const documentRecord = {
        Records: [
          {
            messageId: `Transactional email to ${to}`,
            deliveryTag: 1,
            body: Buffer.from(payload).toString("base64"),
            queueName: "transactional_email_queue",
          },
        ],
      };
      console.log("Document record for transactional email OK");

      console.log("Sending transactional email to RabbitMQ queue...");
      ch.sendToQueue(
        "transactional_email_queue",
        Buffer.from(JSON.stringify(documentRecord)),
        {
          persistent: true,
        }
      );
    } catch (error) {
      console.error("Error publishing transactional email to RabbitMQ:", error);
      throw new Error("Failed to publish transactional email");
    }
  }
}
