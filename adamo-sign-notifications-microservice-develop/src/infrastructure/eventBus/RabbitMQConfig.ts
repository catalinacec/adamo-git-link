import amqp, { Channel, Connection } from "amqplib";
import fs from "fs";
import path from "path";

let connection: Connection | null = null;
let channel: Channel | null = null;

const RETRY_INTERVAL = 5000;

export async function connectRabbitMQ(): Promise<void> {
  try {
    console.log("🔄 Connecting to RabbitMQ over TLS...");

    // Leemos el CA de Amazon MQ
    // const caCert = fs.readFileSync(
    //   process.env.RABBITMQ_CA_CERT ||
    //     path.resolve(__dirname, "../certs/amazon-mq-ca.crt")
    // );
    const caCert = "";

    // Construimos la URL amqps://usuario:pass@host:port/vhost
    const url = new URL(
      `amqps://${process.env.RABBITMQ_USERNAME}:` +
        `${process.env.RABBITMQ_PASSWORD}@` +
        `${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
    );
    // Si usas algún vhost distinto de "/", lo puedes poner así:
    // url.pathname = "/mi_vhost";

    // El segundo parámetro es el socketOptions para TLS
    const socketOptions = { ca: [caCert] };

    connection = await amqp.connect(url.toString(), socketOptions);

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ Connection Error:", err.message);
      connection = null;
    });
    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ Connection closed, retrying in 5s...");
      connection = null;
      setTimeout(connectRabbitMQ, RETRY_INTERVAL);
    });

    channel = await connection.createChannel();
    console.log("✅ RabbitMQ Connected and Channel created");
  } catch (err: any) {
    console.error("❌ Failed to connect RabbitMQ:", err.message || err);
    setTimeout(connectRabbitMQ, RETRY_INTERVAL);
  }
}

export async function getRabbitMQChannel(): Promise<Channel> {
  while (!channel) {
    console.log("⏳ Waiting for RabbitMQ channel initialization...");
    await new Promise((res) => setTimeout(res, 1000));
  }
  return channel!;
}
