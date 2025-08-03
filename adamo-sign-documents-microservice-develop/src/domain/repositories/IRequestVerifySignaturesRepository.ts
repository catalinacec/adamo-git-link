import { ReqVerifySignatureDocument } from "../models/req-verify-signature.entity";

export interface IRequestVerifySignatureRepository {
  save(req: ReqVerifySignatureDocument): Promise<ReqVerifySignatureDocument>;
}
