import Link from "next/link"
import { ArrowRight, Home } from "lucide-react"
import type { HousePlan } from "@/lib/firestore"
import { FavoriteButton } from "./favorite-button"

interface HousePlanCardProps {
  plan: HousePlan
}

export function HousePlanCard({ plan }: HousePlanCardProps) {
  return (
    <Link href={`/plans/${plan.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={plan.images && plan.images.length > 0 ? plan.images[0] : "/placeholder.svg?height=600&width=800"}
            alt={plan.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <FavoriteButton planId={plan.id!} />
          </div>
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
  )
}
