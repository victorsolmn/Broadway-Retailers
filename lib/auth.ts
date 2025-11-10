import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from './prisma';
import { sendEmail, emailTemplates } from './email';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: {
        host: 'localhost',
        port: 1025,
        auth: {
          user: 'mock',
          pass: 'mock',
        },
      },
      from: 'noreply@broadway-sellers.com',
      async sendVerificationRequest({ identifier: email, url }) {
        await sendEmail(emailTemplates.magicLink(email, url));
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, email: true, role: true },
        });

        session.user.id = user.id;
        session.user.role = dbUser?.role || 'seller';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'database',
  },
});

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'seller' | 'admin';
    };
  }
}
