import ContactRepository from "../repositories/ContactRepository";
import {
  ContactListResponse,
  ContactRequest,
  ContactResponse,
} from "../types/ContactTypes";
import { GeneralResponse } from "../types/GeneralTypes";

class ContactUseCase {
  async getContactInfo(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ContactResponse[]>> {
    const response = await ContactRepository.getContactInfo(signal);
    const dataActive: ContactResponse[] = [];

    response.data?.map((contact: ContactResponse) => {
      if (contact.isActive) {
        dataActive.push(contact);
      }
    });
    return {
      ...response,
      data: dataActive,
    };
  }

  async searchContacts(
    search: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ContactResponse[]>> {
    const response = await ContactRepository.searchContacts(search, signal);
    const activeContacts: ContactResponse[] = [];

    response.data?.map((contact: ContactResponse) => {
      if (contact.isActive) {
        activeContacts.push(contact);
      }
    });
    return {
      ...response,
      data: activeContacts,
    };
  }

  async newContact(
    data: ContactRequest,
  ): Promise<GeneralResponse<ContactListResponse>> {
    return await ContactRepository.newContact(data);
  }

  async updateContact(
    id: string,
    data: ContactRequest,
  ): Promise<GeneralResponse<ContactListResponse>> {
    return await ContactRepository.updateContact(id, data);
  }

  async deleteContact(
    id: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ContactListResponse>> {
    return await ContactRepository.deleteContact(id, signal);
  }

  async bulkDeleteContacts(
    ids: { ids: string[] },
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ContactListResponse>> {
    return await ContactRepository.bulkDeleteContacts(ids, signal);
  }
}

export default new ContactUseCase();
