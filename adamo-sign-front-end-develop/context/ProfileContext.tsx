import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import ProfileUseCase from "@/api/useCases/ProfileUseCase";
import { ProfileResponse } from "@/api/types/ProfileTypes";

export interface ProfileContextType {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  name: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  twoFactorAuthEnabled: boolean;
  setTwoFactorAuthEnabled: (enabled: boolean) => void;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: {
    name: string;
    surname: string;
    language: string;
    profileImage?: File;
  }) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setError(null);
    try {
      const resp = await ProfileUseCase.profile();
      const data = resp.data as ProfileResponse;
      setProfileImage(data.profileImageUrl);
      setFirstName(data.name);
      setLastName(data.surname);
      setEmail(data.email);
      setTwoFactorAuthEnabled(!!data.twoFactorAuthEnabled);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Unknown error");
    }
  }, []);

  const updateProfile = useCallback(
    async (
      payload: { name: string; surname: string; language: string; profileImage?: File }
    ) => {
      setError(null);
      
      const previousValues = {
        name,
        lastName,
        email,
        twoFactorAuthEnabled,
        profileImage
      };

      try {

        setFirstName(payload.name);
        setLastName(payload.surname);

        const resp = await ProfileUseCase.updateProfile(payload);
        const data = resp.data as ProfileResponse;
        
        if (payload.profileImage) {
          setProfileImage(data.photo ?? data.profileImageUrl);
        }
        
        setFirstName(data.name);
        setLastName(data.surname);
        setEmail(data.email);
        setTwoFactorAuthEnabled(!!data.twoFactorAuthEnabled);
        
      } catch (err: any) {
        console.error("Error updating profile:", err);
        setError(err.message || "Unknown error");
        
        setFirstName(previousValues.name);
        setLastName(previousValues.lastName);
        setEmail(previousValues.email);
        setTwoFactorAuthEnabled(previousValues.twoFactorAuthEnabled);
        setProfileImage(previousValues.profileImage);
        
        await fetchProfile();

        throw err;
      }
    },
    [name, lastName, email, twoFactorAuthEnabled, profileImage, fetchProfile]
  );

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profileImage,
        setProfileImage,
        name,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        twoFactorAuthEnabled,
        setTwoFactorAuthEnabled,
        error,
        refreshProfile: fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};