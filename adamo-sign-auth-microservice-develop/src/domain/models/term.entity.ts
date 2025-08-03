export class Term {
  constructor(
    public _id: string | null,
    public name: string,
    public description: string,
    public version: string | number,
    public status: "active" | "inactive" | "accepted" | "rejected",
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
