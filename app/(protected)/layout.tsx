import type React from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { PageTransition } from "@/components/layout/page-transition"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <PageTransition>{children}</PageTransition>
    </ProtectedLayout>
  )
}
