export interface ILogRepository {
  deleteById(id: string): Promise<void>;
}
