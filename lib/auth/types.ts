export type AuthSessionUser = {
  uid: string;
  email?: string | null;
};

export type AuthPasswordUser = {
  userId: string;
  email: string;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  maxAgeSeconds: number;
};

export interface AuthAdapter {
  supportsPasswordAuth: boolean;
  loginWithPassword(email: string, password: string): Promise<AuthPasswordUser>;
  signupWithPassword(email: string, password: string): Promise<AuthPasswordUser>;
  createSession(userId: string): Promise<AuthSession>;
  getSessionUser(sessionToken: string): Promise<AuthSessionUser | null>;
  revokeSession(sessionToken: string): Promise<void>;
}
