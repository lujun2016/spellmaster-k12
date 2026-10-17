import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    isAdmin: boolean
    currentRank: string
    rankValue: number
    gradeLevel: number | null
  }

  interface Session {
    user: {
      id: string
      name: string
      isAdmin: boolean
      currentRank: string
      rankValue: number
      gradeLevel: number | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
    currentRank: string
    rankValue: number
    gradeLevel: number | null
  }
}
