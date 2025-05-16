import Link from "next/link"
import { ArrowRight, Building2, Clock, MapPin, Phone } from "lucide-react"

import { PageHeader } from "@/components/ui/page-header"
import { SectionHeader } from "@/components/ui/section-header"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="About Aricom Studios"
        description="Learn about our company, our mission, and our team of expert architects"
      />

      {/* Company Story */}
      <section className="py-4 md:py-8">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Aricom Studios was founded in 2010 as a subsidiary of Aricom Building Contractors, a well-established
                construction company with over 30 years of experience in residential and commercial building.
              </p>
              <p className="text-gray-600 mb-4">
                What began as an in-house design team for custom homes quickly evolved into a full-service architectural
                studio specializing in premium house plans that combine aesthetic appeal with practical construction
                knowledge.
              </p>
              <p className="text-gray-600 mb-6">
                Today, Aricom Studios is proud to offer a diverse collection of house plans designed by our team of
                expert architects, each bringing years of experience and a passion for innovative, functional design to
                every project.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">500+</span>
                  <span className="text-sm text-gray-500">House Plans</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">15+</span>
                  <span className="text-sm text-gray-500">Architects</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">30+</span>
                  <span className="text-sm text-gray-500">Years Experience</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <img
                src="/3.jpg?height=800&width=600"
                alt="Aricom Studios office"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-4 md:py-8 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <SectionHeader
            title="Our Mission"
            description="We're dedicated to making quality architectural design accessible to everyone"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Design</h3>
              <p className="text-gray-600">
                We believe that thoughtful, well-executed architectural design should be accessible to everyone, not
                just those who can afford custom architecture.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Construction Expertise</h3>
              <p className="text-gray-600">
                Our plans are designed with real-world construction knowledge, ensuring they're not just beautiful but
                also practical and cost-effective to build.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Customer Satisfaction</h3>
              <p className="text-gray-600">
                We're committed to helping our customers find or create the perfect house plan for their needs, with
                personalized service and customization options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
   { /*   <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <SectionHeader
            title="Meet Our Team"
            description="Our experienced architects and designers bring your dream home to life"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
                  <img
                    src={`/placeholder.svg?height=160&width=160&text=${member.name.charAt(0)}`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
                <p className="text-gray-600 mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      */ }

      {/* Location */}
      <section className="py-4 md:py-8 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Visit Our Office</h2>
              <p className="text-gray-600 mb-6">
                Our headquarters is located in the heart of the city. Feel free to visit us to discuss your house plan
                needs in person.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Aricom Building Contractors Limited</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+255 765 060 068</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Monday - Friday: 9am - 5pm</span>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/contact">
                  <Button>
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                className="border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=Aricom%20Building%20Contractors%20Limited&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-4 md:py-8 bg-primary text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Find Your Dream Home?
            </h2>
            <p className="max-w-[600px] text-gray-200 md:text-xl">
              Browse our collection of premium house plans or contact us to discuss your custom requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/plans">
                <Button className="bg-white text-primary hover:bg-gray-200">
                  Browse Plans <ArrowRight className="ml-2 h-4 w-4" />
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

// Sample data for team members
const teamMembers = [
  {
    name: "Michael Johnson",
    role: "Principal Architect",
    bio: "With over 20 years of experience, Michael leads our design team with a focus on innovative and sustainable architecture.",
  },
  {
    name: "Sarah Williams",
    role: "Senior Architect",
    bio: "Sarah specializes in modern residential design and has been creating beautiful, functional homes for 15 years.",
  },
  {
    name: "David Chen",
    role: "Architectural Designer",
    bio: "David brings fresh perspectives to traditional designs, creating unique homes that blend classic and contemporary elements.",
  },
  {
    name: "Emily Rodriguez",
    role: "Interior Specialist",
    bio: "Emily ensures our house plans feature thoughtful interior layouts that maximize space and enhance daily living.",
  },
]
