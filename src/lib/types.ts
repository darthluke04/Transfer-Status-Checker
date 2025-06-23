import type { LucideIcon } from 'lucide-react';

export type ValidationRule = {
  pathPattern: string;
  fileNameKeywords?: string[];
  category?: string;
};

export type FolderConfig = {
  id: string;
  type: string;
  subType?: string;
  displayPath: string;
  requiredFiles: string[];
  icon: LucideIcon;
  rules: ValidationRule[];
};

export type Status = 'passing' | 'failing' | 'pending';

export interface FolderStatus {
  id: string;
  status: Status;
  message: string;
  foundFileDetails?: Record<string, string[]>;
}
