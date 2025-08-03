// src/application/services/blockchain.service.ts
import crypto from "crypto";
import { delay } from "../../utils/delay";

export interface SendTransactionResult {
  contractId: string;
  transactionId: string;
  network: string;
  timestamp: Date;
}

export class BlockchainService {
  public readonly network = process.env.BC_NETWORK || "ethereum-goerli";

  /**
   * Simula el envío de una transacción a la blockchain.
   * Puede fallar aleatoriamente para forzar retry.
   */
  async sendTransaction(hash: string): Promise<SendTransactionResult> {
    // Simula latencia
    await delay(2000);

    // Simula fallo un 30% de las veces
    // if (Math.random() < 0.3) {
    //   throw new Error("Blockchain node timeout");
    // }

    // Genera valores mock
    const transactionId = "0x" + crypto.randomBytes(16).toString("hex");
    const contractId = "0x" + crypto.randomBytes(12).toString("hex");
    return {
      contractId,
      transactionId,
      network: this.network,
      timestamp: new Date(),
    };
  }
}
