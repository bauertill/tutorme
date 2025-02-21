import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { DBAdapter } from "@/core/adapters/dbAdapter";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const db = new DBAdapter();
        const existingUser = await db.getUserByEmail(user.email!);
        
        if (!existingUser) {
          await db.createUser(user.email!, user.name!);
        }
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    }
  }
})

export { handler as GET, handler as POST } 