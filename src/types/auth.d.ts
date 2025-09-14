import { DefaultSession, DefaultUser } from '@auth/core/types';

declare module '@auth/core/types' {
  interface User extends DefaultUser {
    role: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    role?: string;
    id?: string;
  }
}
