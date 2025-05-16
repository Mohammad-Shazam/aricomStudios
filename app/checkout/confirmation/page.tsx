"use client"

import Link from "next/link"
import { CheckCircle, Home } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function ConfirmationPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not coming from checkout
  useEffect(() => {
    const referrer = document.referrer
    if (!referrer.includes("/checkout") && !referrer.includes("/cart")) {
      router.push("/")
    }
  }, [router])

  return (
    <div className="container px-4 md:px-6 py-10 mx-auto">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Thank you for your order. We've received your request and will contact you shortly to finalize the
              details.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">What happens next?</h3>
              <ol className="text-left space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="font-medium mr-2">1.</span>
                  <span>Our team will review your order within 1-2 business days.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">2.</span>
                  <span>We'll contact you to confirm details and discuss any customizations you might need.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">3.</span>
                  <span>
                    Once finalized, you'll receive your house plans via email and physical delivery (if requested).
                  </span>
                </li>
              </ol>
            </div>
            <div className="space-y-1 mb-4">
              <h3 className="font-medium">Delivery Method</h3>
              <p className="text-sm text-gray-500">Digital delivery via email</p>
            </div>
            <p>You can view your order details and track its status in your account dashboard.</p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild>
              <Link href="/account/orders" className="flex items-center gap-2">
                View My Orders
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" /> Return to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
