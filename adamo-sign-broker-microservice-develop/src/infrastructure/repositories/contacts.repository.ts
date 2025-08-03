import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  position?: string;
  language?: string;
  is_signer: boolean;
  userId: string;
  isActive?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

const ContactSchema = new Schema<IContact>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    role: { type: String },
    position: { type: String },
    language: { type: String },
    isActive: { type: Boolean, default: true },
    is_signer: { type: Boolean, required: true, default: false },
    userId: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
  },
  { timestamps: true }
);

ContactSchema.plugin(mongoosePaginate);

export const ContactModel = mongoose.model<IContact, PaginateModel<IContact>>(
  "Contact",
  ContactSchema
);

export class ContactRepository {
  async delete(id: string, userId: string): Promise<IContact | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const deleteContact = await ContactModel.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    ).exec();
    return deleteContact ? deleteContact.toObject() : null;
  }
}
