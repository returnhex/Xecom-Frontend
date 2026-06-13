import type { NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import { API_URL } from "@/redux/api/baseApi";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(`${API_URL}/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              profilePicture: user.image,
            }),
          });

          const data = await response.json();

          if (data.success && data.data.accessToken) {
            (user as any).backendToken = data.data.accessToken;
            return true;
          }

          return false;
        } catch (error) {
          console.error("Backend API error:", error);
          return false;
        }
      }

      return true;
    },

    async session({ session, token }) {
      console.log("=== SESSION DATA ===");
      console.log("session:", session);
      console.log("token:", token);
      if (token.backendToken) {
        (session as any).backendToken = token.backendToken;
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {
      console.log("=== JWT DATA ===");
      console.log("token:", token);
      console.log("user:", user);
      if (user && (user as any).backendToken) {
        token.backendToken = (user as any).backendToken;
      }
      return token;
    },
  },
};
