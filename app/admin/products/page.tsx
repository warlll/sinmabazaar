"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminAuth } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Trash2, Edit2 } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock_quantity: number
  description: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const auth = getAdminAuth()
    if (!auth) {
      router.push("/admin/auth")
      return
    }

    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setProducts(data || [])
    } catch (err) {
      setError("Failed to load products")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from("products").delete().eq("id", id)

      if (deleteError) throw deleteError
      setProducts(products.filter((p) => p.id !== id))
    } catch (err) {
      setError("Failed to delete product")
      console.error(err)
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Product Management</h1>
            <p className="text-sm text-muted-foreground">Manage your products</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="border-border bg-transparent">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Add Product Button and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-border"
            />
          </div>
          <Link href="/admin/products/add">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Products Table/Cards */}
        {filteredProducts.length === 0 ? (
          <Card className="border-border text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No products found</p>
              <Link href="/admin/products/add">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Add Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Stock</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                        <td className="px-6 py-4 text-sm text-foreground">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{product.stock_quantity}</td>
                        <td className="px-6 py-4 text-right text-sm space-x-2 flex justify-end">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button size="sm" variant="outline" className="border-border bg-transparent">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
