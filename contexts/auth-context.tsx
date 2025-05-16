"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthChange, registerUser, signIn } from "@/lib/auth"

// Environment variables
export const OPENAI_API_KEY =
  "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" // Replace with your actual OpenAI API key

// Define the admin email
const ADMIN_EMAIL = "aricomhubllc@gmail.com"

// Define the context type
interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  openaiApiKey: string
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

  // Initialize the admin user if it doesn't exist
  const initializeAdminUser = async () => {
    try {
      // Try to sign in as admin
      const { user, error } = await signIn(ADMIN_EMAIL, "Aricom@2025")

      if (error) {
        // If admin doesn't exist, create it
        console.log("Creating admin user...")
        const { user: newUser, error: registerError } = await registerUser(ADMIN_EMAIL, "Aricom@2025")

        if (registerError) {
          console.error("Error creating admin user:", registerError)
          return
        }

        if (newUser) {
          // Set admin role in Firestore
          await setDoc(doc(db, "users", newUser.uid), {
            email: ADMIN_EMAIL,
            role: "admin",
            createdAt: new Date(),
          })
          console.log("Admin user created successfully")
        }
      } else {
        console.log("Admin user already exists")
      }
    } catch (error) {
      console.error("Error initializing admin user:", error)
    }
  }

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      if (user) {
        checkAdminStatus(user)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
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
    openaiApiKey: OPENAI_API_KEY,
    login,
    register,
    logout,
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
