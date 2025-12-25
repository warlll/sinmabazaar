"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdminAuth } from "@/lib/admin-auth"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const auth = getAdminAuth()
    if (!auth) {
      router.push("/admin/auth")
    }
  }, [router])

  return <>{children}</>
}
