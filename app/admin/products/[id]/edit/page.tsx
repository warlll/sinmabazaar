"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getAdminAuth } from "@/lib/admin-auth"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

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
            <h1 className="text-2xl font-bold text-primary">Edit Product</h1>
            <p className="text-sm text-muted-foreground">Update product details</p>
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
        <ProductForm productId={productId} isEditing />
      </main>
    </div>
  )
}
