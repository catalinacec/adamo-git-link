import React from "react";

import { BadgeProps } from "@/components/ui/Badge";

export interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
}

export interface SidebarItem {
  titleId: string;
  href: string;
  icon: React.ReactNode;
  hasBadge: boolean;
}

export interface StatItem {
  title: string;
  value: string;
  icon: string;
  href: string;
  hrefText: string;
}

export interface StatDocItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  buttonText: string;
  buttonVariant?: "primary" | "secondary";
}

export interface InputProps {
  isError?: boolean;
  label?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export interface ParticipantStatus {
  id: string;
  timestamp: string;
  helperText: string;
}

export interface Participant {
  id: number;
  photo: string;
  firstName: string;
  lastName: string;
  email: string;
  docUrl: string;
  status?: ParticipantStatus;
}

export interface Document {
  id: number;
  title: string;
  date: string;
  participants: Participant[];
  status: string;
  register: BadgeProps["status"] | string;
}

export interface Signature {
  id: string;
  left: number;
  top: number;
  position?: any;
  color?: string;
  width?: number;
  height?: number;
  rotation?: number;
  slideIndex: number;
  signatureText: string;
  recipientsName: string;
  recipientEmail: string;
  slideElement?: HTMLElement;
  signature?: React.ReactNode;
  signatureType?: string;
  signatureFontFamily?: string;
  signatureTextSize?: number;
  signatureContentFixed: boolean;
  signatureDelete?: boolean;
  signatureIsEdit: boolean;
}

export type VerificationType =
  | "selfie"
  | "document"
  | "identity"
  | "facial"
  | "phone"
  | "email";

export interface Verification {
  type: VerificationType;
  isPro?: boolean;
}

export type Mode = "view" | "edit";
