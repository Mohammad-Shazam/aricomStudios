"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, Loader2, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getHousePlanById, incrementPlanViews } from "@/lib/firestore"
import { RequestForm } from "@/components/ui/request-form"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/cart-context"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { SimilarPlans } from "@/components/ui/similar-plans"

export default function PlanDetailPage() {
  const params = useParams<{ id: string }>()
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const { toast } = useToast()
  const { addItem } = useCart()

  useEffect(() => {
    async function fetchPlan() {
      try {
        const { plan, error } = await getHousePlanById(params.id)
        if (error) {
          setError("Failed to load house plan. Please try again.")
        } else if (!plan) {
          setError("House plan not found.")
        } else {
          setPlan(plan)
          // Increment view count
          await incrementPlanViews(params.id)
        }
      } catch (err) {
        setError("An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [params.id])

  const handleAddToCart = async () => {
    if (!plan) return

    setAddingToCart(true)
    try {
      await addItem(plan.id!)
      toast({
        title: "Added to cart",
        description: `${plan.title} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-10 mx-auto flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="container px-4 md:px-6 py-10 mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error || "Failed to load house plan."}</p>
          <Button asChild>
            <Link href="/plans">Back to Plans</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-10 mx-auto">
      <div className="mb-6">
        <Link href="/plans">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Plans
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
            <p className="text-gray-500">Plan ID: {plan.id}</p>
          </div>

          <div className="aspect-[16/10] overflow-hidden rounded-lg mb-6">
            <img
              src={plan.images && plan.images.length > 0 ? plan.images[0] : "/placeholder.svg?height=600&width=800"}
              alt={plan.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {plan.images &&
              plan.images.slice(0, 4).map((image: string, index: number) => (
                <div key={index} className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${plan.title} - View ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Plan Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{plan.description}</p>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">Plan Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Square Feet</p>
                    <p className="font-semibold">{plan.sqft} sq ft</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-semibold">{plan.bedrooms}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-semibold">{plan.bathrooms}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Garage</p>
                    <p className="font-semibold">{plan.garage}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Stories</p>
                    <p className="font-semibold">{plan.stories}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Width</p>
                    <p className="font-semibold">{plan.width} ft</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Depth</p>
                    <p className="font-semibold">{plan.depth} ft</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Style</p>
                    <p className="font-semibold">{plan.style}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="features" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Interior Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan.interiorFeatures &&
                    plan.interiorFeatures.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">Exterior Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan.exteriorFeatures &&
                    plan.exteriorFeatures.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="customize">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Need Modifications?</h2>
                <p className="mb-4">
                  We can customize this plan to fit your specific needs. Fill out the form below to request
                  modifications.
                </p>
                <RequestForm planId={plan.id} planTitle={plan.title} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <div className="sticky top-20">
            <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
              <div className="text-3xl font-bold mb-4">${plan.price}</div>
              <div className="space-y-4">
                <Button className="w-full" onClick={handleAddToCart} disabled={addingToCart}>
                  {addingToCart ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </span>
                  )}
                </Button>
                <FavoriteButton planId={plan.id!} variant="outline" className="w-full" />
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">What's Included:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Complete construction blueprints</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Detailed floor plans for all levels</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Exterior elevations (front, rear, sides)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Foundation plan</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Electrical layouts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Cross-section and details</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Material specifications</span>
                  </li>
                </ul>
              </div>

              <Separator className="my-6" />

              <div className="text-sm text-gray-500">
                <p className="mb-2">
                  <strong>Note:</strong> After purchase, our team will contact you to discuss any customizations and
                  finalize your order.
                </p>
                <p>Plans are typically delivered within 3-5 business days after order confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Plans Section - Make sure this is outside the grid */}
      <div className="mt-16">
        <SimilarPlans currentPlan={plan} />
      </div>
    </div>
  )
}
