"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface ProductFormProps {
  productId?: string
  isEditing?: boolean
}

interface ProductData {
  name: string
  category: string
  price: string
  stock_quantity: string
  description: string
}

const CATEGORIES = ["Women's Clothing", "Kitchenware", "Accessories"]
const SIZES = ["XS", "S", "M", "L", "XL"]

export function ProductForm({ productId, isEditing }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ProductData>({
    name: "",
    category: "",
    price: "",
    stock_quantity: "",
    description: "",
  })
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [colorInput, setColorInput] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isEditing && productId) {
      fetchProduct()
    }
  }, [productId, isEditing])

  const fetchProduct = async () => {
    try {
      const supabase = createClient()

      const [productRes, imagesRes, sizesRes, colorsRes] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase.from("product_images").select("image_url").eq("product_id", productId).order("display_order"),
        supabase.from("product_sizes").select("size").eq("product_id", productId),
        supabase.from("product_colors").select("color").eq("product_id", productId),
      ])

      if (productRes.data) {
        setFormData({
          name: productRes.data.name,
          category: productRes.data.category,
          price: productRes.data.price.toString(),
          stock_quantity: productRes.data.stock_quantity.toString(),
          description: productRes.data.description || "",
        })
      }

      if (imagesRes.data) {
        setImageUrls(imagesRes.data.map((img) => img.image_url))
      }

      if (sizesRes.data) {
        setSelectedSizes(sizesRes.data.map((s) => s.size))
      }

      if (colorsRes.data) {
        setColors(colorsRes.data.map((c) => c.color))
      }
    } catch (err) {
      setError("Failed to load product")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()])
      setColorInput("")
    }
  }

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter((c) => c !== color))
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setImages((prev) => [...prev, dataUrl])
        setImageUrls((prev) => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const productPayload = {
        name: formData.name,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        stock_quantity: Number.parseInt(formData.stock_quantity),
        description: formData.description,
      }

      let id = productId

      if (isEditing && productId) {
        // Update existing product
        const { error: updateError } = await supabase.from("products").update(productPayload).eq("id", productId)

        if (updateError) throw updateError

        // Delete old sizes and colors
        await Promise.all([
          supabase.from("product_sizes").delete().eq("product_id", productId),
          supabase.from("product_colors").delete().eq("product_id", productId),
        ])
      } else {
        // Create new product
        const { data, error: createError } = await supabase.from("products").insert([productPayload]).select().single()

        if (createError) throw createError
        id = data.id
      }

      // Add sizes
      if (selectedSizes.length > 0 && id) {
        const sizesPayload = selectedSizes.map((size) => ({
          product_id: id,
          size,
        }))
        const { error: sizesError } = await supabase.from("product_sizes").insert(sizesPayload)
        if (sizesError) throw sizesError
      }

      // Add colors
      if (colors.length > 0 && id) {
        const colorsPayload = colors.map((color) => ({
          product_id: id,
          color,
        }))
        const { error: colorsError } = await supabase.from("product_colors").insert(colorsPayload)
        if (colorsError) throw colorsError
      }

      // Handle new images (data URLs are stored as placeholder URLs in demo)
      if (images.length > 0 && id) {
        const newImages = images.map((url, index) => ({
          product_id: id,
          image_url: url,
          display_order: imageUrls.length - images.length + index,
        }))
        const { error: imagesError } = await supabase.from("product_images").insert(newImages)
        if (imagesError) throw imagesError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/products")
      }, 1500)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? (err as any).message
            : "Failed to save product"
      setError(errorMessage)
      console.error("Product form error:", errorMessage, err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Product" : "Create New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">{error}</div>
          )}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500 text-green-600 rounded-lg">
              Product saved successfully!
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product Information</h3>

            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1 bg-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1 bg-input border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="mt-1 bg-input border-border"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                  className="mt-1 bg-input border-border"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 bg-input border-border min-h-24"
              />
            </div>
          </div>

          {/* Sizes (for Women's Clothing) */}
          {formData.category === "Women's Clothing" && (
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground">Available Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSelectedSizes(
                        selectedSizes.includes(size)
                          ? selectedSizes.filter((s) => s !== size)
                          : [...selectedSizes, size],
                      )
                    }
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedSizes.includes(size)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="space-y-4 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground">Colors</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter color name (e.g., Red, Blue)"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                className="bg-input border-border"
              />
              <Button
                type="button"
                onClick={handleAddColor}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <div
                  key={color}
                  className="px-3 py-1 bg-secondary text-foreground rounded-full flex items-center gap-2 text-sm"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground">Product Images</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" className="cursor-pointer block">
                <p className="font-medium text-foreground">Click to upload images</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </Label>
            </div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSaving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-border bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
