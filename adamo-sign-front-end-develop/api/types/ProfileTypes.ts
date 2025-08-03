export interface ProfileResponse {
    _id: string;
    name: string;
    surname: string;
    email: string;
    language: string;
    photo: string | null;
    roles: string[];
    isActive: boolean;
    profileImageUrl: string | null;
    firtLogin: boolean;
    twoFactorAuthEnabled: boolean;
    __s: string;
    temporaryPassword: string | null;
    temporaryPasswordExpiresAt: string | null;
    acceptedTerms: AcceptedTerms[];
}

export interface AcceptedTerms {
    type: string;
    termId: string;
    _id: string;
} 

export interface ProfileContextType {
  updateProfile: (payload: {
    surname: string;
    language: string;
    profileImage?: File;
  }) => Promise<void>;
}

export interface TwofaVerifyResponse {
    secret: string;
    qrCodeURI: string;
} 
