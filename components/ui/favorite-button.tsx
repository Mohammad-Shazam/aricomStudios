"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { isPlanFavorite, saveFavoritePlan, removeFavoritePlan } from "@/lib/firestore"

interface FavoriteButtonProps {
  planId: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function FavoriteButton({ planId, variant = "outline", size = "icon", className = "" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Check if plan is in favorites
  useEffect(() => {
    async function checkFavorite() {
      if (!user || !planId) {
        setLoading(false)
        return
      }

      try {
        const { isFavorite, error } = await isPlanFavorite(user.uid, planId)
        if (error) {
          console.error("Error checking favorite status:", error)
        } else {
          setIsFavorite(isFavorite)
        }
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkFavorite()
  }, [user, planId])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login or create an account to save plans.",
        variant: "destructive",
      })
      return
    }

    if (loading) return

    try {
      setLoading(true)

      if (isFavorite) {
        const { success, error } = await removeFavoritePlan(user.uid, planId)
        if (!success) {
          throw new Error(error)
        }
        toast({
          title: "Plan removed",
          description: "The house plan has been removed from your saved plans.",
        })
      } else {
        const { success, error } = await saveFavoritePlan(user.uid, planId)
        if (!success) {
          throw new Error(error)
        }
        toast({
          title: "Plan saved",
          description: "The house plan has been added to your saved plans.",
        })
      }

      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update your saved plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${isFavorite ? "text-red-500 hover:text-red-600" : ""}`}
      onClick={toggleFavorite}
      disabled={loading}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}
