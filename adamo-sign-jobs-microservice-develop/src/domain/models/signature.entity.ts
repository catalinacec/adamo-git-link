export class Signature {
  constructor(
    public id: string,
    public recipientEmail: string,
    public recipientsName: string,
    public signatureText: string,
    public signatureContentFixed: boolean,
    public signatureDelete: boolean,
    public signatureIsEdit: boolean,
    public slideElement: string,
    public slideIndex: number,
    public top: number,
    public left: number,
    public width: number,
    public height: number,
    public rotation: number,
    public color: string
  ) {}
}
