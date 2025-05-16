import Link from "next/link"
import { ArrowRight, Building2, CheckCircle, Home } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { CategoryCard } from "@/components/ui/category-card"
import { HousePlanCard } from "@/components/ui/house-plan-card"
import { SectionHeader } from "@/components/ui/section-header"
import { Button } from "@/components/ui/button"
import { getPublishedHousePlans, getHouseStyles } from "@/lib/firestore"
import { HousePlanCardSkeleton } from "@/components/ui/house-plan-card-skeleton"

// Sample data for testimonials
const testimonials = [
  {
    name: "John Smith",
    location: "Colorado",
    quote: "We built our dream mountain home using the Mountain Cabin plan. The process was smooth and the results exceeded our expectations.",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    location: "California",
    quote: "The Modern Farmhouse plan was perfect for our family. We made a few modifications with Aricom's help and couldn't be happier.",
    rating: 5,
  },
  {
    name: "Michael Brown",
    location: "Texas",
    quote: "As a first-time home builder, I appreciated the detailed plans and responsive customer service from the Aricom team.",
    rating: 4,
  },
]

async function FeaturedPlans() {
  const { plans } = await getPublishedHousePlans()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {plans.slice(0, 12).map((plan) => (
        <HousePlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}

async function PlanCategories() {
  const { styles } = await getHouseStyles()
  const categoryImages = ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg']
  const categories = styles.slice(0, 4).map((style, index) => ({
    ...style,
    id: `${style.id || style.name}-${index}`,
    image: categoryImages[index % categoryImages.length],
    count: style.count || 0,
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-4 md:py-8 lg:py-12 xl:py-16 bg-primary text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Discover Your Dream Home Blueprint
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  Aricom Studios offers premium architectural house plans designed by expert architects. Find your
                  perfect home design today.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/plans">
                  <Button className="bg-white text-primary hover:bg-gray-200">
                    Browse Plans <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="border-white text-black hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/0">
                <img
                  src="/5.jpg"
                  alt="Modern house exterior"
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full pt-4 pb-2 md:pt-8 md:pb-2">
        <div className="container px-4 md:px-6 mx-auto">
          <SectionHeader
            title="Browse by Style"
            description="Explore house plans by architectural style to find your perfect match"
          />
          <PlanCategories />
        </div>
      </section>

      {/* Featured Plans Section */}
      <section className="w-full py-4 md:py-8 lg:py-12 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <SectionHeader
            title="Featured House Plans"
            description="Explore our most popular architectural designs, each crafted with precision and style."
          />
          <FeaturedPlans />
          <div className="flex justify-center mt-10">
            <Link href="/plans">
              <Button variant="outline" className="group">
                View All Plans
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-4 md:py-8 lg:py-12 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <SectionHeader
            title="Why Choose Aricom Studios"
            description="A subsidiary of Aricom Building Contractors, bringing decades of construction expertise to every design."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Architects</h3>
              <p className="text-gray-500">
                Our plans are designed by professional architects with years of experience in residential design.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Construction Ready</h3>
              <p className="text-gray-500">
                All plans include detailed specifications and are ready for construction approval.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customizable Designs</h3>
              <p className="text-gray-500">
                Need modifications? Our team can customize any plan to meet your specific requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-4 md:py-8">
        <div className="container px-4 md:px-6 mx-auto">
          <SectionHeader
            title="What Our Customers Say"
            description="Hear from homeowners who have built their dream homes with our plans"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`/placeholder-user.jpg`} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-4 md:py-8 lg:py-12 bg-primary text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Build Your Dream Home?
              </h2>
              <p className="max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Browse our collection of premium house plans and take the first step towards your new home.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/plans">
                <Button className="bg-white text-primary hover:bg-gray-200">
                  Find Your Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white text-black hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
