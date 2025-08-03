export class User {
  constructor(
    public _id: string | null,
    public uuid: string,
    public name: string,
    public surname: string,
    public email: string,
    public roles: string[] = [],
    public isActive: boolean = true,
    public profileImageUrl: string = "",
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
