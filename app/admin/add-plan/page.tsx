"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Home, Plus, Sparkles, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { addHousePlan, type HousePlan } from "@/lib/firestore"
import { uploadImage } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"

export default function AddPlanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading, isAdmin, openaiApiKey } = useAuth()
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [uploadedImageName, setUploadedImageName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Plan data state
  const [planData, setPlanData] = useState<HousePlan>({
    title: "",
    style: "",
    stories: "",
    bedrooms: "",
    bathrooms: "",
    garage: "",
    sqft: "",
    width: "",
    depth: "",
    description: "",
    price: "",
    status: "draft",
    interiorFeatures: [],
    exteriorFeatures: [],
    tags: "",
    seoTitle: "",
    seoDescription: "",
    images: [],
  })

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login")
      toast({
        title: "Access denied",
        description: "You must be logged in as an admin to access this page.",
        variant: "destructive",
      })
    }
  }, [user, loading, isAdmin, router, toast])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setImages([...images, imageUrl])
      setImageFiles([...imageFiles, file])
      setUploadedImageName(file.name)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setPlanData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setPlanData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload images to Firebase Storage
      const uploadedImageUrls: string[] = []

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const path = `plans/${Date.now()}_${file.name}`
        const imageUrl = await uploadImage(file, path)
        uploadedImageUrls.push(imageUrl)
      }

      // Create the house plan with image URLs
      const planToSave: HousePlan = {
        ...planData,
        images: uploadedImageUrls,
      }

      // Add to Firestore
      const { id, error } = await addHousePlan(planToSave)

      if (error) {
        throw error
      }

      toast({
        title: "Success!",
        description: "House plan has been created successfully.",
      })

      router.push("/admin")
    } catch (error) {
      console.error("Error saving house plan:", error)
      toast({
        title: "Error",
        description: "Failed to save house plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePlanWithAI = async () => {
    setIsGenerating(true)
    setGenerationProgress(10)

    try {
      // Check if OpenAI API key is available
      if (!openaiApiKey) {
        toast({
          title: "Error",
          description: "OpenAI API key is not configured. Please set it in your account settings.",
          variant: "destructive",
        })
        setIsGenerating(false)
        return
      }

      // Configure OpenAI with API key from auth context
      process.env.OPENAI_API_KEY = openaiApiKey

      // Step 1: Analyze the uploaded image
      setGenerationProgress(20)
      const { text: imageAnalysis } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Analyze this house image: ${uploadedImageName}. 
      Describe the architectural style, approximate size, and notable features visible in the image.
      Consider elements like roof style, exterior materials, windows, porches, and overall design aesthetic.
      Return your analysis in a brief paragraph.`,
      })

      setGenerationProgress(30)

      // Step 2: Generate basic plan details based on image analysis
      const { text: basicDetailsResponse } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Based on this house image analysis: "${imageAnalysis}"
      Generate realistic house plan details in JSON format with these fields:
      title (creative house plan name that matches the style),
      style (one of: modern, traditional, farmhouse, craftsman, contemporary, coastal, rustic - choose based on the image),
      stories (number of floors as a string: "1", "1.5", "2", or "3" - estimate from the image),
      bedrooms (as a string: "1" to "5" - estimate based on house size),
      bathrooms (as a string: "1" to "4" or "1.5" to "3.5" - estimate based on house size),
      garage (as a string: "0" to "4" - based on what's visible in the image),
      sqft (square footage between 1500-4000 - estimate based on the image),
      width (in feet, between 40-80 - estimate based on the image),
      depth (in feet, between 40-80 - estimate based on the image),
      price (price without commas, between 899-3999 - vary the price based on size, style, and features. Smaller homes should be 899-1499, medium homes 1500-2499, and larger luxury homes 2500-3999)
      
      Make it realistic and coherent (e.g., larger homes should have more bedrooms and higher prices).
      Return ONLY valid JSON without any explanation, markdown formatting, or code blocks.`,
      })

      // Clean the JSON response by removing markdown code blocks if present
      const basicDetailsJson = cleanJsonResponse(basicDetailsResponse)

      // Parse the generated JSON
      const basicData = JSON.parse(basicDetailsJson)
      setGenerationProgress(50)

      // Step 3: Generate description and features based on image analysis and basic details
      const { text: descriptionAndFeaturesResponse } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Based on this house image analysis: "${imageAnalysis}" 
      and these house details: ${JSON.stringify(basicData)},
      
      Generate a detailed description and features for this house plan.
      
      Return as JSON with these fields:
      description (detailed 2-3 sentence description of the house plan, mentioning visible features from the image),
      interiorFeatures (array of 6-8 interior features that would likely be in this style of home),
      exteriorFeatures (array of 4-6 exterior features visible in the image or typical for this style),
      tags (comma-separated list of 5-8 relevant tags based on the style and features),
      seoTitle (SEO-friendly title),
      seoDescription (SEO-friendly description, about 150 characters)
      
      Return ONLY valid JSON without any explanation, markdown formatting, or code blocks.`,
      })

      // Clean the JSON response
      const descriptionAndFeaturesJson = cleanJsonResponse(descriptionAndFeaturesResponse)

      // Parse the generated description and features
      const featuresData = JSON.parse(descriptionAndFeaturesJson)
      setGenerationProgress(90)

      // Combine all the data
      setPlanData({
        ...planData,
        ...basicData,
        ...featuresData,
      })

      setGenerationProgress(100)

      // Switch to the details tab to show the generated data
      setActiveTab("details")

      // Close the dialog and show success message
      setTimeout(() => {
        setAiDialogOpen(false)
        setIsGenerating(false)
        toast({
          title: "AI Generation Complete",
          description:
            "All plan details have been generated based on your image. You can now review and edit the information.",
        })
      }, 1000)
    } catch (error) {
      console.error("Error generating plan data:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error analyzing your image. Please try again or enter details manually.",
        variant: "destructive",
      })
      setIsGenerating(false)
      setAiDialogOpen(false)
    }
  }

  // Helper function to clean JSON responses from markdown formatting
  const cleanJsonResponse = (response: string): string => {
    // Check if the response contains markdown code blocks
    if (response.includes("```json") || response.includes("```")) {
      // Extract the JSON content between code block markers
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1].trim()
      }
    }

    // If no code blocks or extraction failed, return the original response
    return response.trim()
  }

  if (loading) {
    return <div className="container py-10 text-center">Loading...</div>
  }

  return (
    <div className="container px-4 md:px-6 py-10 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New House Plan</h1>
        <Button variant="outline" className="ml-auto gap-2" onClick={() => setAiDialogOpen(true)}>
          <Sparkles className="h-4 w-4 text-amber-500" />
          Generate with AI
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
              <CardDescription>Enter the basic details for this house plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title</Label>
                <Input id="title" placeholder="e.g. Modern Farmhouse" value={planData.title} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={planData.style} onValueChange={(value) => handleSelectChange("style", value)}>
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
                  <Select value={planData.stories} onValueChange={(value) => handleSelectChange("stories", value)}>
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
                  <Select value={planData.bedrooms} onValueChange={(value) => handleSelectChange("bedrooms", value)}>
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
                  <Select value={planData.bathrooms} onValueChange={(value) => handleSelectChange("bathrooms", value)}>
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
                  <Select value={planData.garage} onValueChange={(value) => handleSelectChange("garage", value)}>
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
                  <Input
                    id="sqft"
                    type="number"
                    placeholder="e.g. 2500"
                    value={planData.sqft}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width (ft)</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="e.g. 60"
                    value={planData.width}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth">Depth (ft)</Label>
                  <Input
                    id="depth"
                    type="number"
                    placeholder="e.g. 48"
                    value={planData.depth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the house plan in detail..."
                  className="min-h-[150px]"
                  value={planData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button onClick={() => setActiveTab("images")}>Next: Images & Files</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Images & Files</CardTitle>
              <CardDescription>Upload images and blueprint files for this house plan.</CardDescription>
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
                        onClick={() => {
                          setImages(images.filter((_, i) => i !== index))
                          setImageFiles(imageFiles.filter((_, i) => i !== index))
                        }}
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
                  <label className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Upload Image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP up to 5MB</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Floor Plans (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Home className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Upload First Floor Plan (Optional)</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or image files</p>
                    <input type="file" className="hidden" accept=".pdf,image/*" />
                  </label>
                  <label className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Building2 className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Upload Second Floor Plan (Optional)</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or image files</p>
                    <input type="file" className="hidden" accept=".pdf,image/*" />
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back
              </Button>
              <Button onClick={() => setActiveTab("features")}>Next: Features</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Add features and specifications for this house plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label>Interior Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const newFeature = document.getElementById("new-interior-feature") as HTMLInputElement
                          if (newFeature && newFeature.value) {
                            setPlanData({
                              ...planData,
                              interiorFeatures: [...planData.interiorFeatures, newFeature.value],
                            })
                            newFeature.value = ""
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                      <Input id="new-interior-feature" placeholder="Add interior feature" />
                    </div>
                    <div className="space-y-2 mt-4">
                      {planData.interiorFeatures.length > 0 ? (
                        planData.interiorFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <span>{feature}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => {
                                setPlanData({
                                  ...planData,
                                  interiorFeatures: planData.interiorFeatures.filter((_, i) => i !== index),
                                })
                              }}
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
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic">No interior features added yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Exterior Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const newFeature = document.getElementById("new-exterior-feature") as HTMLInputElement
                          if (newFeature && newFeature.value) {
                            setPlanData({
                              ...planData,
                              exteriorFeatures: [...planData.exteriorFeatures, newFeature.value],
                            })
                            newFeature.value = ""
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                      <Input id="new-exterior-feature" placeholder="Add exterior feature" />
                    </div>
                    <div className="space-y-2 mt-4">
                      {planData.exteriorFeatures.length > 0 ? (
                        planData.exteriorFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <span>{feature}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => {
                                setPlanData({
                                  ...planData,
                                  exteriorFeatures: planData.exteriorFeatures.filter((_, i) => i !== index),
                                })
                              }}
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
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic">No exterior features added yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("images")}>
                Back
              </Button>
              <Button onClick={() => setActiveTab("pricing")}>Next: Pricing</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set pricing and availability for this house plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g. 1299"
                    value={planData.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={planData.status} onValueChange={(value) => handleSelectChange("status", value)}>
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
                <Input
                  id="tags"
                  placeholder="e.g. modern, open concept, energy efficient"
                  value={planData.tags}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="SEO optimized title"
                  value={planData.seoTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  placeholder="SEO optimized description..."
                  className="min-h-[100px]"
                  value={planData.seoDescription}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("features")}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Publish Plan"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Generation Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Plan Details with AI</DialogTitle>
            <DialogDescription>
              Upload your house images and let AI generate all the details for you. Floor plans are optional.
            </DialogDescription>
          </DialogHeader>

          {!isGenerating ? (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Upload House Image</Label>
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP up to 5MB</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {uploadedImageName && (
                    <div className="text-sm text-green-600 mt-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 mr-1"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {uploadedImageName} uploaded successfully
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start">
                    <Sparkles className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">How AI Generation Works</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Our AI will analyze your uploaded house images to generate all the necessary details for your
                        house plan. The more detailed your images, the better the results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generatePlanWithAI} disabled={!uploadedImageName} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Plan Details
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 space-y-6">
              <div className="space-y-2 text-center">
                <div className="flex justify-center">
                  <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
                </div>
                <h3 className="font-medium text-lg">Generating Plan Details...</h3>
                <p className="text-sm text-gray-500">
                  Our AI is analyzing your images and creating detailed information for your house plan.
                </p>
              </div>

              <Progress value={generationProgress} className="h-2" />

              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Current step:</span>
                  <span>
                    {generationProgress < 30
                      ? "Analyzing images"
                      : generationProgress < 50
                        ? "Generating basic details"
                        : generationProgress < 70
                          ? "Creating description"
                          : generationProgress < 90
                            ? "Generating features"
                            : "Finalizing plan details"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
