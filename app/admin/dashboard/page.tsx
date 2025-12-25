"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminAuth, clearAdminAuth } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Shirt,
  Utensils,
  Watch,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  preparingOrders: number
  shippedOrders: number
  deliveredOrders: number
  totalRevenue: number
  totalInventoryValue: number
}

interface CategoryStats {
  category: string
  productCount: number
  totalStock: number
  totalValue: number
  ordersCount: number
  orderedQuantity: number
  revenue: number
}

interface TopProduct {
  id: string
  name: string
  category: string
  price: number
  stock_quantity: number
  total_ordered: number
  revenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAdminAuth()
    if (!auth) {
      router.push("/admin/auth")
      return
    }

    fetchDashboardStats()
  }, [router])

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClient()

      // Fetch all products with details
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, category, price, stock_quantity")

      if (productsError) throw productsError

      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, status, total_price")

      if (ordersError) throw ordersError

      // Fetch all order items with product details
      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select(`
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            category,
            price,
            stock_quantity
          )
        `)

      if (orderItemsError) throw orderItemsError

      // Calculate basic stats
      const totalProducts = products?.length || 0
      const totalOrders = orders?.length || 0
      
      // Calculate order status counts
      const statusCounts = (orders || []).reduce(
        (acc, order) => {
          const status = order.status as string
          return {
            ...acc,
            [status]: (acc[status as keyof typeof acc] || 0) + 1,
          }
        },
        { Pending: 0, Confirmed: 0, Preparing: 0, Shipped: 0, Delivered: 0 },
      )

      // Calculate total revenue
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0

      // Calculate total inventory value (stock × price)
      const totalInventoryValue = products?.reduce(
        (sum, product) => sum + (product.stock_quantity * product.price), 
        0
      ) || 0

      setStats({
        totalProducts,
        totalOrders,
        pendingOrders: statusCounts.Pending,
        confirmedOrders: statusCounts.Confirmed,
        preparingOrders: statusCounts.Preparing,
        shippedOrders: statusCounts.Shipped,
        deliveredOrders: statusCounts.Delivered,
        totalRevenue,
        totalInventoryValue,
      })

      // Calculate category statistics
      const categoriesMap = new Map<string, CategoryStats>()
      
      // Initialize categories from products
      products?.forEach((product) => {
        const cat = product.category
        if (!categoriesMap.has(cat)) {
          categoriesMap.set(cat, {
            category: cat,
            productCount: 0,
            totalStock: 0,
            totalValue: 0,
            ordersCount: 0,
            orderedQuantity: 0,
            revenue: 0,
          })
        }
        const catStats = categoriesMap.get(cat)!
        catStats.productCount++
        catStats.totalStock += product.stock_quantity
        catStats.totalValue += product.stock_quantity * product.price
      })

      // Add order statistics to categories
      orderItems?.forEach((item: any) => {
        const category = item.products?.category
        if (category && categoriesMap.has(category)) {
          const catStats = categoriesMap.get(category)!
          catStats.ordersCount++
          catStats.orderedQuantity += item.quantity
          catStats.revenue += item.quantity * item.price
        }
      })

      setCategoryStats(Array.from(categoriesMap.values()))

      // Calculate top products by orders
      const productOrdersMap = new Map<string, any>()
      
      orderItems?.forEach((item: any) => {
        const productId = item.product_id
        if (!productOrdersMap.has(productId)) {
          productOrdersMap.set(productId, {
            id: productId,
            name: item.products?.name || 'Unknown',
            category: item.products?.category || 'Unknown',
            price: item.products?.price || 0,
            stock_quantity: item.products?.stock_quantity || 0,
            total_ordered: 0,
            revenue: 0,
          })
        }
        const productStats = productOrdersMap.get(productId)!
        productStats.total_ordered += item.quantity
        productStats.revenue += item.quantity * item.price
      })

      const topProductsList = Array.from(productOrdersMap.values())
        .sort((a, b) => b.total_ordered - a.total_ordered)
        .slice(0, 10)

      setTopProducts(topProductsList)

      setIsLoading(false)
    } catch (err) {
      console.error("Dashboard stats error:", err)
      setError("Failed to load dashboard statistics")
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAdminAuth()
    router.push("/admin/auth")
  }

  const getCategoryIcon = (category: string) => {
    if (category.includes("Women") || category.includes("Clothing")) return Shirt
    if (category.includes("Kitchen")) return Utensils
    if (category.includes("Accessories")) return Watch
    return Package
  }

  const getCategoryColor = (category: string) => {
    if (category.includes("Women") || category.includes("Clothing")) 
      return "bg-pink-100 text-pink-800 border-pink-300"
    if (category.includes("Kitchen")) 
      return "bg-orange-100 text-orange-800 border-orange-300"
    if (category.includes("Accessories")) 
      return "bg-purple-100 text-purple-800 border-purple-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">SINMA BAZAAR</h1>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-border bg-transparent">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to the SINMA BAZAAR admin panel</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/admin/products">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all border-border">
              <CardHeader>
                <CardTitle className="text-primary">Product Management</CardTitle>
                <CardDescription>Add, edit, and delete products</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all border-border">
              <CardHeader>
                <CardTitle className="text-primary">Order Management</CardTitle>
                <CardDescription>View and update order status</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Products in store</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All orders placed</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {stats?.totalRevenue.toFixed(2) || "0.00"} DA
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total sales revenue</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {stats?.totalInventoryValue.toFixed(2) || "0.00"} DA
              </div>
              <p className="text-xs text-muted-foreground mt-1">Stock × Price value</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Summary */}
        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Order Status Overview
            </CardTitle>
            <CardDescription>Breakdown of all orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-2 border-yellow-300">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats?.pendingOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats?.confirmedOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-300">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats?.preparingOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Preparing</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-950 rounded-lg border-2 border-cyan-300">
                <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                  {stats?.shippedOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Shipped</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-300">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats?.deliveredOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Analytics */}
        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle>Category Analytics</CardTitle>
            <CardDescription>Detailed breakdown by product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.length > 0 ? (
                categoryStats.map((cat) => {
                  const Icon = getCategoryIcon(cat.category)
                  const colorClass = getCategoryColor(cat.category)
                  return (
                    <div key={cat.category} className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">{cat.category}</h3>
                          <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Stock Quantity</p>
                          <p className="text-xl font-bold text-blue-600">{cat.totalStock}</p>
                          <p className="text-xs text-muted-foreground">units</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Inventory Value</p>
                          <p className="text-xl font-bold text-purple-600">{cat.totalValue.toFixed(2)} DA</p>
                          <p className="text-xs text-muted-foreground">stock × price</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Orders</p>
                          <p className="text-xl font-bold text-orange-600">{cat.orderedQuantity}</p>
                          <p className="text-xs text-muted-foreground">units sold</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                          <span className="text-2xl font-bold text-green-600">{cat.revenue.toFixed(2)} DA</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">No category data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Most ordered products by quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{product.total_ordered} units</p>
                      <p className="text-xs text-green-600 font-medium">{product.revenue.toFixed(2)} DA</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Stock: {product.stock_quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
