"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthChange, registerUser, signIn } from "@/lib/auth"

// Define the admin email from env vars
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''

// Define the context type
interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  openaiApiKey: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error: any }>
  register: (email: string, password: string) => Promise<{ success: boolean; error: any }>
  logout: () => Promise<void>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [openaiApiKey, setOpenaiApiKey] = useState<string | null>(null)

  // Check if the user is an admin
  const checkAdminStatus = async (user: User) => {
    if (user.email === ADMIN_EMAIL) {
      setIsAdmin(true)
      return true
    }

    try {
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists() && userSnap.data().role === "admin") {
        setIsAdmin(true)
        return true
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    }

    setIsAdmin(false)
    return false
  }

  // No longer auto-creating admin users for security
  const initializeAdminUser = async () => {
    // This is now a no-op - admin users must be created manually
  }

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user)
      try {
        if (user) {
          await checkAdminStatus(user)
          const apiKey = await getUserApiKey(user.uid)
          setOpenaiApiKey(apiKey)
        } else {
          setIsAdmin(false)
          setOpenaiApiKey(null)
        }
      } catch (error) {
        console.error("Error handling auth change:", error)
      } finally {
        setLoading(false)
      }
    })

    // Initialize admin user
    initializeAdminUser()

    return () => unsubscribe()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { user, error } = await signIn(email, password)
      if (error) {
        return { success: false, error }
      }

      if (user) {
        await checkAdminStatus(user)
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    }
  }

  // Register function
  const register = async (email: string, password: string) => {
    try {
      const { user, error } = await registerUser(email, password)
      if (error) {
        return { success: false, error }
      }

      if (user) {
        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email,
          role: "user",
          createdAt: new Date(),
        })
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    openaiApiKey,
    login,
    register,
    logout,
  }
  
  // Helper function to get user's API key from Firestore
  async function getUserApiKey(uid: string): Promise<string | null> {
    try {
      const userRef = doc(db, "users", uid)
      const userSnap = await getDoc(userRef)
      return userSnap.exists() ? userSnap.data().openaiApiKey || null : null
    } catch (error) {
      console.error("Error getting user API key:", error)
      return null
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to get user's API key from Firestore
async function getUserApiKey(uid: string): Promise<string | null> {
  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)
    return userSnap.exists() ? userSnap.data().openaiApiKey || null : null
  } catch (error) {
    console.error("Error getting user API key:", error)
    return null
  }
}
