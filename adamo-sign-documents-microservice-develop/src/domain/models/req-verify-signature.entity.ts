import { File } from "buffer";
import { Participant } from "./participant.entity";

export class ReqVerifySignatureDocument {
  constructor(
    public _id: string,
    public hash: string,
    public userId: string,
    public documentId: string,
    public version: string,
    public timestamp: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
