import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileService } from '@/services/api';
import type { ProfileResponse } from '@/types/api';

interface ProfileContextType {
  profile: ProfileResponse | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: {
    surname: string;
    language: string;
    profileImage?: File;
  }) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.getProfile();
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload: {
    surname: string;
    language: string;
    profileImage?: File;
  }) => {
    try {
      const formData = new FormData();
      formData.append('surname', payload.surname);
      formData.append('language', payload.language);
      if (payload.profileImage) {
        formData.append('profileImage', payload.profileImage);
      }

      const response = await profileService.updateProfile(formData);
      setProfile(response.data);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error updating profile');
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refreshProfile,
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
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};