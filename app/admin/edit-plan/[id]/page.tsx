"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Home, Plus, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function EditPlanPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const planId = params.id

  // In a real app, you would fetch the plan data based on the ID
  const [plan, setPlan] = useState({
    title: "Modern Farmhouse",
    style: "farmhouse",
    stories: "2",
    bedrooms: "4",
    bathrooms: "3.5",
    garage: "2",
    sqft: "2850",
    width: "60",
    depth: "48",
    description: "A spacious modern farmhouse with open concept living, large kitchen island, and covered porch.",
    price: "1299",
    status: "published",
  })

  const [images, setImages] = useState<string[]>(["/placeholder.svg?height=400&width=600"])

  useEffect(() => {
    // In a real app, this would fetch the plan data from an API
    // For now, we'll just simulate different data based on the ID
    if (planId === "coastal-retreat") {
      setPlan({
        title: "Coastal Retreat",
        style: "coastal",
        stories: "2",
        bedrooms: "5",
        bathrooms: "4",
        garage: "3",
        sqft: "3200",
        width: "65",
        depth: "52",
        description:
          "Bright and airy coastal design with large windows, multiple outdoor living spaces, and a bonus room.",
        price: "1499",
        status: "published",
      })
    }
  }, [planId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setPlan((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setPlan((prev) => ({ ...prev, [id]: value }))
  }

  const handleImageUpload = () => {
    // Simulate adding a new image
    setImages([...images, "/placeholder.svg?height=400&width=600"])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would update the plan data via an API
    alert("Plan updated successfully!")
    router.push("/admin")
  }

  return (
    <div className="container px-4 md:px-6 py-10 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit House Plan: {plan.title}</h1>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Plan Details</TabsTrigger>
          <TabsTrigger value="images">Images & Files</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Edit the basic details for this house plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title</Label>
                <Input id="title" value={plan.title} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={plan.style} onValueChange={(value) => handleSelectChange("style", value)}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  <Label htmlFor="stories">Stories</Label>
                  <Select value={plan.stories} onValueChange={(value) => handleSelectChange("stories", value)}>
                    <SelectTrigger id="stories">
                      <SelectValue placeholder="Select number of stories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Story</SelectItem>
                      <SelectItem value="1.5">1.5 Stories</SelectItem>
                      <SelectItem value="2">2 Stories</SelectItem>
                      <SelectItem value="3">3 Stories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={plan.bedrooms} onValueChange={(value) => handleSelectChange("bedrooms", value)}>
                    <SelectTrigger id="bedrooms">
                      <SelectValue placeholder="Select number of bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4 Bedrooms</SelectItem>
                      <SelectItem value="5">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select value={plan.bathrooms} onValueChange={(value) => handleSelectChange("bathrooms", value)}>
                    <SelectTrigger id="bathrooms">
                      <SelectValue placeholder="Select number of bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                      <SelectItem value="3">3 Bathrooms</SelectItem>
                      <SelectItem value="3.5">3.5 Bathrooms</SelectItem>
                      <SelectItem value="4">4+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="garage">Garage</Label>
                  <Select value={plan.garage} onValueChange={(value) => handleSelectChange("garage", value)}>
                    <SelectTrigger id="garage">
                      <SelectValue placeholder="Select garage size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Garage</SelectItem>
                      <SelectItem value="1">1 Car</SelectItem>
                      <SelectItem value="2">2 Cars</SelectItem>
                      <SelectItem value="3">3 Cars</SelectItem>
                      <SelectItem value="4">4+ Cars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sqft">Square Footage</Label>
                  <Input id="sqft" type="number" value={plan.sqft} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width (ft)</Label>
                  <Input id="width" type="number" value={plan.width} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth">Depth (ft)</Label>
                  <Input id="depth" type="number" value={plan.depth} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={plan.description} onChange={handleChange} className="min-h-[150px]" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Images & Files</CardTitle>
              <CardDescription>Manage images and blueprint files for this house plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Main Images</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative border rounded-lg overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`House plan image ${index + 1}`}
                        className="w-full h-auto aspect-[4/3] object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-red-500 hover:bg-white"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  ))}
                  <div
                    className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleImageUpload}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Upload Image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Floor Plans</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Home className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Upload First Floor Plan</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or image files</p>
                  </div>
                  <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Building2 className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Upload Second Floor Plan</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or image files</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Edit features and specifications for this house plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features content similar to add-plan page */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label>Interior Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                      <Input placeholder="Add interior feature" />
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span>Open concept floor plan</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span>Large kitchen island</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Exterior Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                      <Input placeholder="Add exterior feature" />
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span>Covered front porch</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span>Rear patio/deck</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Update pricing and availability for this house plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" value={plan.price} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={plan.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" placeholder="e.g. modern, open concept, energy efficient" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input id="seo-title" placeholder="SEO optimized title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">SEO Description</Label>
                <Textarea id="seo-description" placeholder="SEO optimized description..." className="min-h-[100px]" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
