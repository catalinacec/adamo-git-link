enum TermsAndConditionsStatus {
  Accepted = "Accepted",
  Rejected = "Rejected",
}

export interface AcceptedTerm {
  id: number;
  status: TermsAndConditionsStatus;
  date: Date;
}

export class User {
  constructor(
    public _id: string | null,
    public name: string,
    public surname: string,
    public email: string,
    public password: string,
    public language: string = "es",
    public photo: string,
    public roles: string[] = [],
    public isActive: boolean = true,
    public profileImageUrl = "",
    public firstLogin: boolean = true,
    public twoFactorAuthEnabled: boolean = false,
    public __s: string | undefined,
    public temporaryPassword?: string,
    public temporaryPasswordExpiresAt?: Date,
    public acceptedTerms: AcceptedTerm[] = [],
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
