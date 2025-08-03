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
  async create(contact: IContact): Promise<IContact> {
    const newContact = await ContactModel.create(contact);
    return newContact.toObject();
  }

  async findById(id: string): Promise<IContact | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const contact = await ContactModel.findById(id).exec();
    return contact ? contact.toObject() : null;
  }

  async update(
    id: string,
    contact: Partial<IContact>
  ): Promise<IContact | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    // Generar un objeto con $set solo para las propiedades que existan
    const updateFields = Object.entries(contact).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        if (typeof value === "object" && !Array.isArray(value)) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            acc[`${key}.${subKey}`] = subValue;
          });
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    const updatedContact = await ContactModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).exec();

    return updatedContact ? updatedContact.toObject() : null;
  }

  async delete(id: string): Promise<IContact | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updatedContact = await ContactModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();
    return updatedContact ? updatedContact.toObject() : null;
  }

  async findAll(query: object, page: number = 1, limit: number = 10) {
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
    };

    const result = await ContactModel.paginate(query, options);
    return result;
  }
}
