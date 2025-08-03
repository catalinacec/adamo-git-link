export interface ContactResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    countryCode?: string;
    company?: string;
    isActive?: boolean;
    position?: string;
    address?: ContactAddress;
}

export interface ContactListResponse {
  data: ContactResponse[];
}

export interface ContactRequest {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company: string;
    position: string;
    countryCode?: string;
    role?: string;
    language?: string;
    address: ContactAddress;
}

export interface ContactAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

