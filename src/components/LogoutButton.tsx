"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  async function handleLogout() {
    try { await fetch("/api/session", { method: "DELETE" }) } catch (_) {}
    signOut({ callbackUrl: "/login" })
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-red-500 transition"
    >
      退出
    </button>
  )
}
