"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { createOrder, getUserProfile, updateUserProfile } from "@/lib/firestore"
import { sendEmailNotification } from "@/lib/api"

export default function CheckoutPage() {
  const { items, subtotal, tax, total, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    paymentMethod: "invoice",
    notes: "",
  })

  // Load user profile data
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) {
        setProfileLoading(false)
        return
      }

      try {
        const { profile, error } = await getUserProfile(user.uid)
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || user.email || "",
            phone: profile.phone || "",
          }))
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login or create an account to complete your order.",
        variant: "destructive",
      })
      router.push("/login?redirect=/checkout")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add items before placing an order.",
        variant: "destructive",
      })
      router.push("/plans")
      return
    }

    // Validate form
    const requiredFields = ["firstName", "lastName", "email", "phone"]
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Missing information",
          description: `Please fill in all required fields.`,
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)

    try {
      // Update user profile
      await updateUserProfile(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      })

      // Create orders for each item
      const orderPromises = items.map((item) =>
        createOrder({
          userId: user.uid,
          userEmail: formData.email,
          userName: `${formData.firstName} ${formData.lastName}`,
          planId: item.planId,
          planTitle: item.title,
          planImage: item.image,
          price: item.price,
          status: "pending",
          paymentMethod: formData.paymentMethod,
          createdAt: new Date(),
        }),
      )

      const orders = await Promise.all(orderPromises)

      // Send order notifications
      const notificationPromises = orders.map(order =>
        sendEmailNotification('order', {
          ...order,
          userName: `${formData.firstName} ${formData.lastName}`,
          userEmail: formData.email,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod
        })
      )

      await Promise.all(notificationPromises)

      // Clear cart
      await clearCart()

      // Show success message
      toast({
        title: "Order placed successfully",
        description: "Thank you for your order! You'll receive a confirmation email shortly.",
      })

      // Redirect to confirmation page
      router.push("/checkout/confirmation")
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Redirect if not logged in
  if (!user && !loading) {
    router.push("/login?redirect=/checkout")
    return null
  }

  return (
    <div className="container px-4 md:px-6 py-10 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cart">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      {profileLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Please provide your contact details so we can reach out to finalize your order.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose how you'd like to pay for your order.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue="invoice"
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="invoice" id="invoice" />
                      <Label htmlFor="invoice" className="flex-1 cursor-pointer">
                        <div className="font-medium">Pay by Invoice</div>
                        <div className="text-sm text-gray-500">
                          We'll send you an invoice after reviewing your order. No payment required now.
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                        <div className="font-medium">Credit Card</div>
                        <div className="text-sm text-gray-500">
                          Pay securely with your credit card. We'll charge you after order confirmation.
                        </div>
                      </Label>
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Let us know if you have any special requirements or questions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Special instructions or notes about your order..."
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex gap-3">
                            <img
                              src={item.image || "/placeholder.svg?height=200&width=300"}
                              alt={item.title}
                              className="w-16 h-12 object-cover rounded-md"
                            />
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-gray-500">House Plan</div>
                            </div>
                          </div>
                          <div>${item.price}</div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
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
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading || items.length === 0}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </span>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2">
                  <strong>What happens next?</strong> After placing your order, our team will review it and contact you
                  within 1-2 business days to confirm details and discuss any customizations.
                </p>
                <p>You'll receive your house plans via email after your order is finalized.</p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
