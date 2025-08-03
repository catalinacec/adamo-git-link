export class Log {
  constructor(
    public action: string,
    public success: boolean,
    public userId?: string,
    public email?: string,
    public statusCode?: number,
    public message?: string,
    public payload?: any,
    public headers?: any,
    public ip?: string,
    public userAgent?: string,
    public method?: string,
    public path?: string,
    public timestamp: Date = new Date()
  ) {}
}
