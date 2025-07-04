import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { checkRateLimit, clearRateLimit } from "@/lib/rateLimit";

export const authOptions: NextAuthOptions = {
  // Remove adapter to handle OAuth manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check rate limit for this email
        const rateLimitCheck = checkRateLimit(credentials.email);
        if (!rateLimitCheck.allowed) {
          console.log(`Rate limit exceeded for ${credentials.email}`);
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user || !user.passwordHash) {
          console.log(
            `Invalid login attempt for ${credentials.email}: user not found`
          );
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          console.log(
            `Invalid login attempt for ${credentials.email}: wrong password`
          );
          return null;
        }

        // Clear rate limit on successful login
        clearRateLimit(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userTag: user.userTag,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userTag = (user as any).userTag;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.userId as string) || token.sub!;
        session.user.userTag = token.userTag as string;

        // If userTag is missing, fetch it from the database
        if (!session.user.userTag && session.user.email) {
          try {
            const user = await db.query.users.findFirst({
              where: eq(users.email, session.user.email),
            });
            if (user?.userTag) {
              session.user.userTag = user.userTag;
              token.userTag = user.userTag;
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { user, account, profile });

      if (account?.provider === "google" || account?.provider === "twitter") {
        // For OAuth providers, ensure user exists in our database
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email!),
          });

          if (!existingUser) {
            // Create user if they don't exist
            console.log("Creating new OAuth user:", user.email);
            const userTag = user
              .email!.split("@")[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

            const newUser = await db
              .insert(users)
              .values({
                email: user.email!,
                name: user.name || user.email!,
                userTag: userTag,
                userType: "individual", // Set default user type
              })
              .returning();

            console.log("Created new user:", newUser[0]);

            // Update the user object with the userTag
            (user as any).userTag = newUser[0].userTag;
            user.id = newUser[0].id;
          } else {
            console.log("Found existing user:", existingUser);
            // Update the user object with existing userTag
            (user as any).userTag = existingUser.userTag;
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error creating/updating user:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
