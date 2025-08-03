import axios from "axios";
import { Participant } from "../../domain/models/participant.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { Document } from "../../domain/models/document.entity";

export class WhatsAppService {
  static async sendWhatsAppMessage(
    to: string,
    tokenLink: string
  ): Promise<void> {
    const docRepo = new DocumentsRepository();

    // Endpoint simulado
    const apiUrl =
      "https://adamo-sign-whatsapp-chatbot-production-885b.up.railway.app/api/whatsapp/send";

    try {
      const payload = {
        to: to,
        token: tokenLink,
      };

      console.log("🔗 Llamada a WhatsAppService con payload:", payload);

      const response = await axios.post(apiUrl, payload, {
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Respuesta de WhatsAppService:", response.data);
      const payloadResponse = response.data as any;
      console.log("✅ Respuesta OK de WhatsAppService: ", payloadResponse);
    } catch (error) {
      console.log("❌ Error simulando llamada a WhatsAppService:", error);
    }
  }
}
