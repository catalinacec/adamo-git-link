export class Contact {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public is_signer: boolean,
    public userId: string,
    public phone?: string,
    public company?: string,
    public role?: string,
    public position?: string,
    public language?: string,
    public address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    }
  ) {}
}
