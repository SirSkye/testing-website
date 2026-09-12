export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface WaitlistFormData {
  name: string;
  email: string;
}

export type ActivePage = 'home' | 'features' | 'waitlist';