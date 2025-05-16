"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { HousePlanCard } from "./house-plan-card"
import { getSimilarHousePlans } from "@/lib/firestore"
import type { HousePlan } from "@/lib/firestore"
import { SectionHeader } from "./section-header"

interface SimilarPlansProps {
  currentPlan: HousePlan
}

export function SimilarPlans({ currentPlan }: SimilarPlansProps) {
  const [plans, setPlans] = useState<HousePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSimilarPlans() {
      setLoading(true)
      try {
        const { plans, error } = await getSimilarHousePlans(currentPlan)
        if (error) {
          setError(error)
        } else {
          setPlans(plans)
        }
      } catch (err) {
        setError("An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarPlans()
  }, [currentPlan])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>
  }

  if (plans.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <SectionHeader
        title="Similar House Plans"
        description="You might also be interested in these similar house plans"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {plans.map((plan) => (
          <HousePlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}
