"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Filter, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { getPublishedHousePlans, type HousePlan } from "@/lib/firestore"
import { useToast } from "@/components/ui/use-toast"
import { HousePlanCardSkeleton } from "@/components/ui/house-plan-card-skeleton"

export default function PlansPage() {
  const [plans, setPlans] = useState<HousePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredPlans, setFilteredPlans] = useState<HousePlan[]>([])
  const [filters, setFilters] = useState({
    style: "all",
    bedrooms: "any",
    bathrooms: "any",
    minSqft: "",
    maxSqft: "",
    searchTerm: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { plans, error } = await getPublishedHousePlans()

        if (error) {
          throw error
        }

        setPlans(plans)
        setFilteredPlans(plans)
      } catch (error) {
        console.error("Error fetching house plans:", error)
        toast({
          title: "Error",
          description: "Failed to load house plans. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [toast])

  useEffect(() => {
    // Apply filters
    let result = [...plans]

    // Filter by style
    if (filters.style !== "all") {
      result = result.filter((plan) => plan.style.toLowerCase() === filters.style.toLowerCase())
    }

    // Filter by bedrooms
    if (filters.bedrooms !== "any") {
      result = result.filter((plan) => {
        const beds = Number.parseInt(plan.bedrooms)
        const filterBeds = Number.parseInt(filters.bedrooms)
        return beds >= filterBeds
      })
    }

    // Filter by bathrooms
    if (filters.bathrooms !== "any") {
      result = result.filter((plan) => {
        const baths = Number.parseFloat(plan.bathrooms)
        const filterBaths = Number.parseFloat(filters.bathrooms)
        return baths >= filterBaths
      })
    }

    // Filter by square footage
    if (filters.minSqft) {
      result = result.filter((plan) => Number.parseInt(plan.sqft) >= Number.parseInt(filters.minSqft))
    }

    if (filters.maxSqft) {
      result = result.filter((plan) => Number.parseInt(plan.sqft) <= Number.parseInt(filters.maxSqft))
    }

    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      result = result.filter(
        (plan) =>
          plan.title.toLowerCase().includes(term) ||
          plan.description.toLowerCase().includes(term) ||
          plan.tags.toLowerCase().includes(term),
      )
    }

    setFilteredPlans(result)
  }, [filters, plans])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      style: "all",
      bedrooms: "any",
      bathrooms: "any",
      minSqft: "",
      maxSqft: "",
      searchTerm: "",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="bg-gray-50 py-10">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-start gap-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">House Plans</h1>
              <p className="text-gray-500 md:text-xl">
                Browse our collection of premium architectural house plans designed by expert architects.
              </p>
            </div>
          </div>
        </section>
        <div className="container px-4 md:px-6 py-10 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Filters Sidebar Skeleton */}
            <div className="h-fit lg:sticky lg:top-20 rounded-lg border border-gray-200 bg-white p-6 space-y-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-px bg-gray-200 w-full" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-px bg-gray-200 w-full" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
            </div>

            {/* Plans Grid Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
                <div className="h-10 bg-gray-200 rounded animate-pulse w-[180px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <HousePlanCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-gray-50 py-10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">House Plans</h1>
            <p className="text-gray-500 md:text-xl">
              Browse our collection of premium architectural house plans designed by expert architects.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Filters Sidebar */}
            <Card className="h-fit lg:sticky lg:top-20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </h3>
                  <Button variant="ghost" size="sm" className="h-8 text-sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <Input
                      placeholder="Search plans..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Style</label>
                    <Select value={filters.style} onValueChange={(value) => handleFilterChange("style", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Styles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Styles</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="farmhouse">Farmhouse</SelectItem>
                        <SelectItem value="craftsman">Craftsman</SelectItem>
                        <SelectItem value="contemporary">Contemporary</SelectItem>
                        <SelectItem value="coastal">Coastal</SelectItem>
                        <SelectItem value="rustic">Rustic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                    <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bathrooms</label>
                    <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange("bathrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Square Footage</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.minSqft}
                        onChange={(e) => handleFilterChange("minSqft", e.target.value)}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.maxSqft}
                        onChange={(e) => handleFilterChange("maxSqft", e.target.value)}
                      />
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setFilteredPlans(filteredPlans)}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {filteredPlans.length} of {plans.length} plans
                </p>
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="sqft-low">Sq Ft: Low to High</SelectItem>
                    <SelectItem value="sqft-high">Sq Ft: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map((plan) => (
                    <Link href={`/plans/${plan.id}`} key={plan.id} className="group">
                      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img
                            src={
                              plan.images && plan.images.length > 0
                                ? plan.images[0]
                                : "/placeholder.svg?height=600&width=800"
                            }
                            alt={plan.title}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{plan.title}</h3>
                            <span className="text-gray-500">${plan.price}</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Home className="mr-1 h-4 w-4" />
                            <span>{plan.sqft} sq ft</span>
                            <span className="mx-2">•</span>
                            <span>{plan.bedrooms} beds</span>
                            <span className="mx-2">•</span>
                            <span>{plan.bathrooms} baths</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{plan.description}</p>
                          <div className="mt-4 flex items-center text-sm">
                            <span className="text-sm font-medium text-primary">View Details</span>
                            <ArrowRight className="ml-1 h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-gray-500 mb-4">No house plans match your current filters.</p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
