import axios from "axios";
import { Participant } from "../../domain/models/participant.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { Document } from "../../domain/models/document.entity";

export class TelegramService {
  static async sendTelegramMessage(
    to: string,
    tokenLink: string
  ): Promise<void> {
    const docRepo = new DocumentsRepository();

    // Endpoint simulado
    const apiUrl =
      "https://telegram-bot-adamo-sign-production.up.railway.app/api/telegram/send";

    try {
      const payload = {
        to: to,
        token: tokenLink,
      };

      console.log("🔗 Llamada a TelegramService con payload:", payload);

      const response = await axios.post(apiUrl, payload, {
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Respuesta de TelegramService:", response.data);
      const payloadResponse = response.data as any;
      console.log("✅ Respuesta OK de TelegramService: ", payloadResponse);
    } catch (error) {
      console.log("❌ Error simulando llamada a TelegramService:", error);
    }
  }
}
