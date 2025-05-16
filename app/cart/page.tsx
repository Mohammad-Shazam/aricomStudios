"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2, Minus, Plus, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const { items, loading, removeItem, clearCart, updateQuantity, subtotal, tax, total } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCart = async () => {
    setIsClearing(true)
    await clearCart()
    setIsClearing(false)
  }

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login or create an account to proceed to checkout.",
        variant: "destructive",
      })
      router.push("/login?redirect=/cart")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add items before proceeding to checkout.",
        variant: "destructive",
      })
      return
    }

    router.push("/checkout")
  }

  return (
    <div className="container px-4 md:px-6 py-10 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div>
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-lg text-gray-500">Loading your cart...</p>
              </CardContent>
            </Card>
          ) : items.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <img
                            src={item.image || "/placeholder.svg?height=200&width=300"}
                            alt={item.title}
                            className="w-20 h-16 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/plans/${item.planId}`} className="hover:underline">
                            {item.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={loading}
                            >
                              <Minus className="h-4 w-4" />
                              <span className="sr-only">Decrease</span>
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={loading}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Increase</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.price}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                            disabled={loading}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/plans" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                  onClick={handleClearCart}
                  disabled={loading || isClearing}
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    "Clear Cart"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-lg text-gray-500 mb-4">Your cart is empty</p>
                <Button asChild>
                  <Link href="/plans">Browse Plans</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (10%)</span>
                  <span>${tax}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCheckout} disabled={loading || items.length === 0}>
                <span className="flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">
              <strong>Note:</strong> This is an ordering process, not a direct payment. After checkout, our team will
              contact you to finalize your order and discuss any customizations you may need.
            </p>
            <p>
              All plans include complete construction blueprints, detailed floor plans, exterior elevations, and
              material specifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
