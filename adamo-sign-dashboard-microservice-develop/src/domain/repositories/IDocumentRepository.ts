export interface IDocumentsRepository {
  getStats(user: string): Promise<any>;
  getPendingSignature(userId: string): Promise<number>;
}
