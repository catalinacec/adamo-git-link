import axiosInstance from "../axiosInstance";
import {
    ContactListResponse,
    ContactResponse,
    ContactRequest,
} from "../types/ContactTypes";
import { GeneralResponse } from "../types/GeneralTypes";

class ContactRepository {

    async getContactInfo(
        signal?: AbortSignal,
    ): Promise<GeneralResponse<ContactResponse[]>> {
        const response = await axiosInstance.get<GeneralResponse<ContactResponse[]>>(
            "/contacts?page=1&limit=40",
            { signal }
        );
        return response.data;
    }

    async searchContacts(
        search: string,
        signal?: AbortSignal,
    ): Promise<GeneralResponse<ContactResponse[]>> {
        const response = await axiosInstance.get<GeneralResponse<ContactResponse[]>>(
            `/contacts?search=${encodeURIComponent(search)}`,
            { signal }
        );
        return response.data;
    }

    async newContact(
        data: ContactRequest,
        signal?: AbortSignal,
    ): Promise<GeneralResponse<ContactListResponse>> {
        const response = await axiosInstance.post<GeneralResponse<ContactListResponse>>(
            "/contacts",
            data,
            { signal }
        );
        return response.data;
    }

    async updateContact(
        id: string,
        data: ContactRequest,
        signal?: AbortSignal,
    ): Promise<GeneralResponse<ContactListResponse>> {
        const response = await axiosInstance.put<GeneralResponse<ContactListResponse>>(
            `/contacts/${id}`,
            data,
            { signal }
        );
        return response.data;
    }

    async deleteContact(
        id: string,
        signal?: AbortSignal,
    ): Promise<GeneralResponse<ContactListResponse>> {
        const response = await axiosInstance.delete<GeneralResponse<ContactListResponse>>(
            `/contacts/${id}`,
            { signal }
        );
        return response.data;

    }

    async bulkDeleteContacts(
        ids: { ids: string[] },
        signal?: AbortSignal,
    ): Promise<GeneralResponse<ContactListResponse>> {
        const response = await axiosInstance.post<GeneralResponse<ContactListResponse>>(
            `/contacts/bulk-delete`,
            ids,
            { signal }
        );
        return response.data;
    }

}

export default new ContactRepository();