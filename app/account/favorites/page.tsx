"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2, Loader2 } from "lucide-react"

import { AccountSidebar } from "@/components/account/account-sidebar"
import { HousePlanCard } from "@/components/ui/house-plan-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getUserFavorites, removeFavoritePlan } from "@/lib/firestore"
import type { HousePlan } from "@/lib/firestore"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<HousePlan[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load favorites
  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { favorites, error } = await getUserFavorites(user.uid)
        if (error) {
          throw new Error(error)
        }
        setFavorites(favorites)
      } catch (error) {
        console.error("Error loading favorites:", error)
        toast({
          title: "Error",
          description: "Failed to load your saved plans. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user, toast])

  const removeFavorite = async (id: string) => {
    if (!user) return

    try {
      setLoading(true)
      const { success, error } = await removeFavoritePlan(user.uid, id)

      if (!success) {
        throw new Error(error)
      }

      setFavorites(favorites.filter((plan) => plan.id !== id))

      toast({
        title: "Plan removed",
        description: "The house plan has been removed from your saved plans.",
      })
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast({
        title: "Error",
        description: "Failed to remove the plan from your saved plans.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Saved Plans" />

      <div className="container px-4 md:px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <div>
            <AccountSidebar activePage="favorites" />
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>My Saved Plans</CardTitle>
                <CardDescription>House plans you've saved for future reference</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((plan) => (
                      <div key={plan.id} className="relative group">
                        <HousePlanCard plan={plan} />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFavorite(plan.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove from favorites</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No saved plans yet</h3>
                    <p className="text-gray-500 mb-6">
                      Browse our house plans and click the heart icon to save your favorites
                    </p>
                    <Button asChild>
                      <a href="/plans">Browse House Plans</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
