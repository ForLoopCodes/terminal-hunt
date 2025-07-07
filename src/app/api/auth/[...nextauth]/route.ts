import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, admins } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { checkRateLimit, clearRateLimit } from "@/lib/rateLimit";

export const authOptions: any = {
  // Remove adapter to handle OAuth manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
    async jwt({ token, user }) {
      if (user) {
        const userWithTag = user as { userTag?: string };
        token.userTag = userWithTag.userTag || "";
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

        // Always check admin status to ensure it's current
        if (session.user.id) {
          try {
            const adminRecord = await db.query.admins.findFirst({
              where: eq(admins.userId, session.user.id),
            });

            if (adminRecord) {
              session.user.isAdmin = true;
              session.user.adminRole = adminRecord.role || "admin";
              // Update token for consistency
              token.isAdmin = true;
              token.adminRole = adminRecord.role || "admin";
            } else {
              session.user.isAdmin = false;
              session.user.adminRole = undefined;
              // Update token for consistency
              token.isAdmin = false;
              token.adminRole = undefined;
            }
          } catch (error) {
            console.error("Error checking admin status in session:", error);
            session.user.isAdmin = false;
            session.user.adminRole = undefined;
          }
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { user, account, profile });

      if (
        account?.provider === "google" ||
        account?.provider === "twitter" ||
        account?.provider === "github"
      ) {
        // For OAuth providers, ensure user exists in our database
        try {
          // Handle Twitter's lack of email by creating a fallback
          let userEmail = user.email;
          if (!userEmail && account?.provider === "twitter") {
            // Use Twitter username if available, otherwise use the Twitter ID
            const twitterProfile = profile as any;
            const username =
              twitterProfile?.data?.username ||
              twitterProfile?.username ||
              user.id;
            userEmail = `${username}@x.com`;
            user.email = userEmail; // Update the user object
          }

          if (!userEmail) {
            console.error("No email available for OAuth user");
            return false;
          }

          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, userEmail),
          });

          if (!existingUser) {
            // Create user if they don't exist
            console.log("Creating new OAuth user:", userEmail);
            const userTag = userEmail
              .split("@")[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

            const newUser = await db
              .insert(users)
              .values({
                email: userEmail,
                name: user.name || userEmail,
                userTag: userTag,
                userType: "individual", // Set default user type
              })
              .returning();

            console.log("Created new user:", newUser[0]);

            // Update the user object with the userTag
            const userWithTag = user as { userTag?: string };
            userWithTag.userTag = newUser[0].userTag;
            user.id = newUser[0].id;
          } else {
            console.log("Found existing user:", existingUser);
            // Update the user object with existing userTag
            const userWithTag = user as { userTag?: string };
            userWithTag.userTag = existingUser.userTag;
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
