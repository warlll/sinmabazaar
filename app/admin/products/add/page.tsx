"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdminAuth } from "@/lib/admin-auth"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AddProductPage() {
  const router = useRouter()

  useEffect(() => {
    const auth = getAdminAuth()
    if (!auth) {
      router.push("/admin/auth")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Add New Product</h1>
            <p className="text-sm text-muted-foreground">Create a new product listing</p>
          </div>
          <Link href="/admin/products">
            <Button variant="outline" className="border-border bg-transparent">
              Back to Products
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm />
      </main>
    </div>
  )
}
