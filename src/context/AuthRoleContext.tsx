import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { storageService, DEFAULT_USER_PROFILE } from '../services/storageService';

interface AuthRoleContextType {
  role: UserRole;
  profile: UserProfile;
  setRole: (newRole: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const ROLE_LABELS: Record<UserRole, { title: string; badge: string; color: string; desc: string }> = {
  deaf_user: {
    title: 'Deaf / HoH User',
    badge: 'D/HoH',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    desc: 'Primary access via large captions, ISL demonstration player & sign-to-text input.'
  },
  hearing_user: {
    title: 'Hearing Partner',
    badge: 'Hearing',
    color: 'bg-navy-100 text-navy-800 border-navy-300',
    desc: 'Communicates using microphone voice captions and audio playback of signs.'
  },
  healthcare_provider: {
    title: 'Healthcare Provider',
    badge: 'Doctor / Nurse',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Triage quick phrases, patient symptom verification & medical disclaimers.'
  },
  isl_expert: {
    title: 'ISL Expert / Interpreter',
    badge: 'ISL Expert',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Curate approved signs, verify video demonstrations & review sign feedback.'
  },
  support_staff: {
    title: 'Support / Front Desk Staff',
    badge: 'Govt / Desk',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Front desk assistance, forms, tickets, and directions.'
  },
  caregiver: {
    title: 'Caregiver / Family',
    badge: 'Caregiver',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Assists dual communication session setup and family health tracking.'
  },
  administrator: {
    title: 'System Administrator',
    badge: 'Admin',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    desc: 'Platform management, profile preferences and communication session controls.'
  }
};

export const AuthRoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(() => storageService.getProfile());

  const setRole = (newRole: UserRole) => {
    const updated: UserProfile = { ...profile, role: newRole };
    setProfileState(updated);
    storageService.saveProfile(updated);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated: UserProfile = { ...profile, ...updates };
    setProfileState(updated);
    storageService.saveProfile(updated);
  };

  return (
    <AuthRoleContext.Provider
      value={{
        role: profile.role,
        profile,
        setRole,
        updateProfile
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = (): AuthRoleContextType => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
