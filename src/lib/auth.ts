import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          currentRank: user.currentRank,
          rankValue: user.rankValue,
          gradeLevel: user.gradeLevel,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.currentRank = user.currentRank
        token.rankValue = user.rankValue
        token.gradeLevel = user.gradeLevel
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.isAdmin = token.isAdmin
      session.user.currentRank = token.currentRank
      session.user.rankValue = token.rankValue
      session.user.gradeLevel = token.gradeLevel as number | null
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
