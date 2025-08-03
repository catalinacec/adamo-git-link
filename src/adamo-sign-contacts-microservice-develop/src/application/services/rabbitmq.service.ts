// src/infrastructure/rabbitmq/rabbitmq.service.ts
import amqplib, { Channel } from "amqplib";

export class RabbitMQService {
  private static _channel: Channel;

  public static async getChannel(): Promise<Channel> {
    if (this._channel) return this._channel;

    const url = process.env.RABBITMQ_URL!;
    const conn = await amqplib.connect(url);
    const channel = await conn.createChannel();
    await channel.assertQueue("delete_contacts_bulk", { durable: true });
    channel.prefetch(5);
    this._channel = channel;
    return channel;
  }

  public static async publishDeleteJob(documentId: string, userId: string) {
    const ch = await this.getChannel();

    const payload = JSON.stringify({
      action: "delete_contacts",
      documentId,
      userId,
      timestamp: Date.now(),
    });

    const documentRecord = {
      Records: [
        {
          messageId: `Document ${documentId} deletion request`,
          deliveryTag: 1,
          body: Buffer.from(payload).toString("base64"),
          queueName: "delete_contacts_bulk",
        },
      ],
    };

    ch.sendToQueue(
      "delete_contacts_bulk",
      Buffer.from(JSON.stringify(documentRecord)),
      {
        persistent: true,
      }
    );
  }

  public static async publishTransactionalEmailQueue(
    from: string,
    to: string,
    subject: string,
    text: string,
    content: any
  ) {
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

    ch.sendToQueue(
      "transactional_email_queue",
      Buffer.from(JSON.stringify(documentRecord)),
      {
        persistent: true,
      }
    );
  }
}
