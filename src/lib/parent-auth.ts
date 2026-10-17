import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "parent-jwt-secret-dev"

interface ParentToken {
  phone: string
  childId: string
  type: "parent"
}

export function verifyParentToken(token: string): ParentToken | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as ParentToken
    if (payload.type !== "parent") return null
    return payload
  } catch {
    return null
  }
}

export function getParentToken(req: Request): ParentToken | null {
  const auth = req.headers.get("Authorization") || ""
  const token = auth.replace("Bearer ", "")
  if (!token) return null
  return verifyParentToken(token)
}
