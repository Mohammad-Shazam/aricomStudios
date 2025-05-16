"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth-context"
import { getHousePlanById } from "@/lib/firestore"
import { useToast } from "@/components/ui/use-toast"

// Define the cart item type
export interface CartItem {
  id: string
  planId: string
  title: string
  price: string
  image?: string
  quantity: number
}

// Define the cart context type
interface CartContextType {
  items: CartItem[]
  loading: boolean
  addItem: (planId: string) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  subtotal: string
  tax: string
  total: string
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Create a provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Calculate totals
  const subtotal = items.reduce((total, item) => {
    const priceStr = String(item.price || "0")
    return total + Number.parseFloat(priceStr.replace(/,/g, "")) * item.quantity
  }, 0)

  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Load cart items when user changes
  useEffect(() => {
    async function loadCartItems() {
      setLoading(true)
      try {
        if (user) {
          // Load from Firestore
          const cartRef = collection(db, `users/${user.uid}/cart`)
          const querySnapshot = await getDocs(cartRef)
          const cartItems: CartItem[] = []

          for (const doc of querySnapshot.docs) {
            const item = doc.data() as CartItem
            cartItems.push({ ...item, id: doc.id })
          }

          setItems(cartItems)
        } else {
          // Load from localStorage
          const storedCart = localStorage.getItem("cart")
          if (storedCart) {
            setItems(JSON.parse(storedCart))
          } else {
            setItems([])
          }
        }
      } catch (error) {
        console.error("Error loading cart items:", error)
        toast({
          title: "Error",
          description: "Failed to load your cart items. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCartItems()
  }, [user, toast])

  // Save cart items to localStorage when items change
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, user, loading])

  // Add item to cart
  const addItem = async (planId: string) => {
    try {
      setLoading(true)

      // Get plan details
      const { plan, error } = await getHousePlanById(planId)
      if (error || !plan) {
        throw new Error("Failed to get plan details")
      }

      const newItem: CartItem = {
        id: planId, // Use planId as the cart item id initially
        planId,
        title: plan.title,
        price: plan.price,
        image: plan.images && plan.images.length > 0 ? plan.images[0] : undefined,
        quantity: 1,
      }

      // Check if item already exists in cart
      const existingItemIndex = items.findIndex((item) => item.planId === planId)

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...items]
        updatedItems[existingItemIndex].quantity += 1

        if (user) {
          // Update in Firestore
          const itemRef = doc(db, `users/${user.uid}/cart`, items[existingItemIndex].id)
          await updateDoc(itemRef, { quantity: updatedItems[existingItemIndex].quantity })
        }

        setItems(updatedItems)
        toast({
          title: "Cart updated",
          description: `Increased quantity of ${plan.title} in your cart.`,
        })
      } else {
        // Add new item
        if (user) {
          // Add to Firestore
          const cartRef = collection(db, `users/${user.uid}/cart`)
          const docRef = doc(cartRef)
          await setDoc(docRef, newItem)

          // Update the id to match the Firestore document id
          newItem.id = docRef.id
        }

        setItems([...items, newItem])
        toast({
          title: "Added to cart",
          description: `${plan.title} has been added to your cart.`,
        })
      }
    } catch (error) {
      console.error("Error adding item to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Remove item from cart
  const removeItem = async (id: string) => {
    try {
      setLoading(true)

      if (user) {
        // Remove from Firestore
        const itemRef = doc(db, `users/${user.uid}/cart`, id)
        await deleteDoc(itemRef)
      }

      const updatedItems = items.filter((item) => item.id !== id)
      setItems(updatedItems)

      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      })
    } catch (error) {
      console.error("Error removing item from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true)

      if (user) {
        // Delete all items from Firestore
        const cartRef = collection(db, `users/${user.uid}/cart`)
        const querySnapshot = await getDocs(cartRef)

        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))

        await Promise.all(deletePromises)
      }

      setItems([])
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "Failed to clear your cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity < 1) {
        return removeItem(id)
      }

      setLoading(true)
      const updatedItems = items.map((item) => (item.id === id ? { ...item, quantity } : item))

      if (user) {
        // Update in Firestore
        const itemRef = doc(db, `users/${user.uid}/cart`, id)
        await updateDoc(itemRef, { quantity })
      }

      setItems(updatedItems)
    } catch (error) {
      console.error("Error updating item quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const value = {
    items,
    loading,
    addItem,
    removeItem,
    clearCart,
    updateQuantity,
    subtotal: formatCurrency(subtotal),
    tax: formatCurrency(tax),
    total: formatCurrency(total),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Create a hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
