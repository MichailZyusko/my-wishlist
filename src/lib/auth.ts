import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth';
import { prisma } from './prisma';

interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const googleProfile = profile as GoogleProfile | undefined;
      if (!googleProfile?.sub || !googleProfile.email) {
        return false;
      }
      await prisma.user.upsert({
        where: { googleId: googleProfile.sub },
        update: {
          email: googleProfile.email,
          name: googleProfile.name ?? 'User',
          avatarUrl: googleProfile.picture ?? null,
        },
        create: {
          googleId: googleProfile.sub,
          email: googleProfile.email,
          name: googleProfile.name ?? 'User',
          avatarUrl: googleProfile.picture ?? null,
        },
      });
      return true;
    },
    async jwt({ token, profile }) {
      if (token.userId) {
        return token;
      }
      // On initial sign-in, we have the Google profile with sub.
      if (profile?.sub) {
        const user = await prisma.user.findUnique({
          where: { googleId: profile.sub },
        });
        if (user) {
          token.userId = user.id;
          return token;
        }
      }
      // token.sub is typically the provider account id for OAuth
      if (token.sub) {
        const user = await prisma.user.findUnique({
          where: { googleId: token.sub },
        });
        if (user) {
          token.userId = user.id;
          return token;
        }
      }
      // Fallback for subsequent calls.
      if (token.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (user) {
          token.userId = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string | undefined;
      }
      return session;
    },
  },
};

export async function requireSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  if (session.user.id) {
    return { id: session.user.id, email: session.user.email ?? '' };
  }
  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) {
      return { id: user.id, email: user.email };
    }
  }
  return null;
}
