import { botRequest } from "../types/botTypes";
import botRepository from "@/api/repositories/BotStatus.repository"

class botUseCase {

    async sendSignedBot({ 
        token,  
    }:botRequest): Promise<{ code: number, to: number | undefined } | void> {
        return await botRepository.sendSignedBot(
            token,
        );
    }

    async rejectedDocumentBot({ 
        token,  
    }:botRequest): Promise<{ code: number, to: number | undefined } | void> {
        return await botRepository.rejectedDocumentBot(
            token,
        );
    }
}

const documentsUseCase = new botUseCase();
export default documentsUseCase;
