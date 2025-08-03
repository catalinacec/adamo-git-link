export class User {
  constructor(
    public _id: string | null,
    public name: string,
    public surname: string,
    public email: string,
    public plan: string
  ) {}
}
