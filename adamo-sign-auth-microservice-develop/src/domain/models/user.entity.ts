import { TermsAndConditionsStatus } from "../../infrastructure/repositories/user.repository";

export interface AcceptedTerm {
  id: number;
  status: TermsAndConditionsStatus;
  date: Date;
  updatedAt: string;
}

export class User {
  constructor(
    public _id: string | null,
    public uuid: string,
    public name: string,
    public surname: string,
    public email: string,
    public password: string,
    public firstLogin: boolean = true,
    public language: string = "en",
    public photo: string = "",
    public roles: string[] = [],
    public isActive: boolean = true,
    public temporaryPassword?: string,
    public temporaryPasswordExpiresAt?: Date,
    public twoFactorAuthEnabled: boolean = false,
    public __s: string = "",
    public acceptedTerms: AcceptedTerm[] = [],
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
