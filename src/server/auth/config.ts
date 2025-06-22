import { type Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { UserRepository } from "@/core/user/user.repository";
import { db } from "@/server/db";
import type { User } from "@prisma/client";
import { z } from "zod";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

const prismaAdapter = PrismaAdapter(db);
const adapter: Adapter = {
  ...prismaAdapter,
  createUser: async (data) => {
    console.log("Creating user", data);
    const userRepository = new UserRepository(db);
    const user = await userRepository.createUser({
      name: data.name ?? null,
      email: data.email,
      emailVerified: data.emailVerified ?? null,
      image: data.image ?? null,
    });
    return user;
  },
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        anonToken: { label: "Anon Token", type: "text" },
      },
      async authorize(credentials) {
        const userRepository = new UserRepository(db);
        const { anonToken } = z
          .object({
            anonToken: z.string(),
          })
          .parse(credentials);
        // TODO: since the token is stored in plain text, we should add a secret token as well
        const user = await userRepository.getOrCreateUserByAnonToken(anonToken);
        if (!user) {
          throw new Error("Invalid credentials");
        }
        return user;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
} satisfies NextAuthConfig;
