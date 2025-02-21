import { getServerSession } from "next-auth";
import { cookies, headers } from "next/headers";
import GoogleProvider from "next-auth/providers/google";

const nextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export async function createContext({ req }: { req: Request }) {
  const session = await getServerSession(nextAuthOptions);
  
  return {
    session,
    req,
    headers: headers(),
    cookies: cookies(),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>; 