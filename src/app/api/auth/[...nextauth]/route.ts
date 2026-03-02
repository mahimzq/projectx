import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.error("[AUTH] Login attempt for:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.error("[AUTH] Missing credentials");
                    return null;
                }

                try {
                    console.error("[AUTH] Looking up user in database...");
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    if (!user) {
                        console.error("[AUTH] User NOT found for email:", credentials.email);
                        return null;
                    }

                    console.error("[AUTH] User found:", user.email, "role:", user.role);
                    console.error("[AUTH] Stored password length:", user.password?.length, "Input password length:", credentials.password?.length);
                    console.error("[AUTH] Password match:", user.password === credentials.password);

                    if (user.password !== credentials.password) {
                        console.error("[AUTH] Password MISMATCH");
                        return null;
                    }

                    console.error("[AUTH] Login SUCCESS for:", user.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error: any) {
                    console.error("[AUTH] Database error:", error.message);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
