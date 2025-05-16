import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  limit,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase"

// Collection names
const PLANS_COLLECTION = "housePlans"
const ORDERS_COLLECTION = "orders"
const USERS_COLLECTION = "users"
const CONTACT_COLLECTION = "contactMessages"
const MODIFICATION_REQUESTS_COLLECTION = "modificationRequests"
const SETTINGS_COLLECTION = "settings"

// Types
export interface HousePlan {
  id?: string
  title: string
  style: string
  stories: string
  bedrooms: string
  bathrooms: string
  garage: string
  sqft: string
  width: string
  depth: string
  description: string
  price: string
  status: string
  interiorFeatures: string[]
  exteriorFeatures: string[]
  tags: string
  seoTitle: string
  seoDescription: string
  images: string[]
  views?: number
  createdAt?: any
  updatedAt?: any
}

// Add this type for the modification request
export interface ModificationRequest {
  planId?: string
  planTitle?: string
  name: string
  email: string
  phone?: string
  modifications: string
}

// Add this type for contact messages
export interface ContactMessage {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  createdAt?: any
}

// User profile type
export interface UserProfile {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  role?: string
  createdAt?: any
  updatedAt?: any
}

// Order type
export interface Order {
  id?: string
  userId: string
  userEmail?: string
  userName?: string
  planId: string
  planTitle: string
  planImage?: string
  price: string
  status: string
  paymentMethod?: string
  paymentId?: string
  shippingAddress?: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt?: any
  updatedAt?: any
}

// Settings type
export interface SiteSettings {
  id?: string
  siteName: string
  siteDescription: string
  contactEmail: string
  phoneNumber: string
  address: string
  taxRate: number
  shippingFee: number
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    pinterest?: string
  }
  updatedAt?: any
}

// Add a new house plan
export const addHousePlan = async (planData: HousePlan) => {
  try {
    const docRef = await addDoc(collection(db, PLANS_COLLECTION), {
      ...planData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    console.error("Error adding house plan:", error)
    return { id: null, error }
  }
}

// Update a house plan
export const updateHousePlan = async (id: string, planData: Partial<HousePlan>) => {
  try {
    const planRef = doc(db, PLANS_COLLECTION, id)
    await updateDoc(planRef, {
      ...planData,
      updatedAt: serverTimestamp(),
    })
    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating house plan:", error)
    return { success: false, error }
  }
}

// Delete a house plan
export const deleteHousePlan = async (id: string) => {
  try {
    await deleteDoc(doc(db, PLANS_COLLECTION, id))
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting house plan:", error)
    return { success: false, error }
  }
}

// Get all house plans
export const getAllHousePlans = async () => {
  try {
    const q = query(collection(db, PLANS_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const plans: HousePlan[] = []

    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() } as HousePlan)
    })

    return { plans, error: null }
  } catch (error) {
    console.error("Error getting house plans:", error)
    return { plans: [], error }
  }
}

// Get published house plans
export const getPublishedHousePlans = async () => {
  try {
    const q = query(collection(db, PLANS_COLLECTION), where("status", "==", "published"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const plans: HousePlan[] = []

    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() } as HousePlan)
    })

    return { plans, error: null }
  } catch (error) {
    console.error("Error getting published house plans:", error)
    return { plans: [], error }
  }
}

// Get a single house plan by ID
export const getHousePlanById = async (id: string) => {
  try {
    const docRef = doc(db, PLANS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { plan: { id: docSnap.id, ...docSnap.data() } as HousePlan, error: null }
    } else {
      return { plan: null, error: "House plan not found" }
    }
  } catch (error) {
    console.error("Error getting house plan:", error)
    return { plan: null, error }
  }
}

// Get house plans by style
export const getHousePlansByStyle = async (style: string) => {
  try {
    const q = query(
      collection(db, PLANS_COLLECTION),
      where("status", "==", "published"),
      where("style", "==", style),
      orderBy("createdAt", "desc"),
    )
    const querySnapshot = await getDocs(q)
    const plans: HousePlan[] = []

    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() } as HousePlan)
    })

    return { plans, error: null }
  } catch (error) {
    console.error("Error getting house plans by style:", error)
    return { plans: [], error }
  }
}

// Get popular house plans
export const getPopularHousePlans = async (count = 5) => {
  try {
    const q = query(
      collection(db, PLANS_COLLECTION),
      where("status", "==", "published"),
      orderBy("views", "desc"),
      limit(count),
    )
    const querySnapshot = await getDocs(q)
    const plans: HousePlan[] = []

    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() } as HousePlan)
    })

    return { plans, error: null }
  } catch (error) {
    console.error("Error getting popular house plans:", error)
    return { plans: [], error }
  }
}

// Increment house plan views
export const incrementPlanViews = async (id: string) => {
  try {
    const planRef = doc(db, PLANS_COLLECTION, id)
    const planSnap = await getDoc(planRef)

    if (planSnap.exists()) {
      const currentViews = planSnap.data().views || 0
      await updateDoc(planRef, {
        views: currentViews + 1,
      })
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error incrementing plan views:", error)
    return { success: false, error }
  }
}

// Upload an image to Firebase Storage
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Delete an image from Firebase Storage
export const deleteImage = async (path: string) => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { success: false, error }
  }
}

export async function getHouseStyles(): Promise<{
  styles: { id: string; name: string; count: number }[]
  error?: string
}> {
  try {
    const housePlansRef = collection(db, "housePlans")
    const q = query(housePlansRef, where("status", "==", "published"))
    const querySnapshot = await getDocs(q)

    // Create a map to count plans by style
    const styleMap = new Map<string, number>()

    querySnapshot.forEach((doc) => {
      const plan = doc.data() as HousePlan
      const style = plan.style || "Other"

      if (styleMap.has(style)) {
        styleMap.set(style, styleMap.get(style)! + 1)
      } else {
        styleMap.set(style, 1)
      }
    })

    // Convert map to array of style objects
    const styles = Array.from(styleMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      count,
    }))

    // Sort by count (descending)
    styles.sort((a, b) => b.count - a.count)

    return { styles }
  } catch (error) {
    console.error("Error getting house styles:", error)
    return { styles: [], error: "Failed to fetch house styles" }
  }
}

export async function saveModificationRequest(
  requestData: ModificationRequest,
): Promise<{ success: boolean; error?: string }> {
  try {
    const requestsRef = collection(db, MODIFICATION_REQUESTS_COLLECTION)
    await addDoc(requestsRef, {
      ...requestData,
      createdAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error saving modification request:", error)
    return { success: false, error: "Failed to save your request. Please try again." }
  }
}

// Save contact form data to Firestore
export async function saveContactMessage(messageData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[Firestore] Attempting to save contact message:", messageData)
    
    // Validate required fields
    if (!messageData.firstName || !messageData.lastName || !messageData.email || !messageData.subject || !messageData.message) {
      throw new Error("Missing required fields")
    }

    console.log("[Firestore] Initializing Firestore connection...")
    const contactRef = collection(db, CONTACT_COLLECTION)
    console.log("[Firestore] Collection reference created")

    const docData = {
      ...messageData,
      createdAt: serverTimestamp(),
    }
    console.log("[Firestore] Document data prepared:", docData)

    const docRef = await addDoc(contactRef, docData)
    console.log("[Firestore] Document successfully written with ID:", docRef.id)
    
    return { success: true }
  } catch (error) {
    console.error("Error saving contact message:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save your message. Please try again.",
    }
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { profile: { id: userSnap.id, ...userSnap.data() } as UserProfile, error: null }
    } else {
      // Create a default profile if it doesn't exist
      const defaultProfile: UserProfile = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        createdAt: serverTimestamp(),
      }

      await setDoc(userRef, defaultProfile)
      return { profile: { id: userId, ...defaultProfile }, error: null }
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return { profile: null, error }
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<{ success: boolean; error: any }> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    })
    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error }
  }
}

// Get user orders
export async function getUserOrders(userId: string): Promise<{ orders: Order[]; error: any }> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const orders: Order[] = []

    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order)
    })

    return { orders, error: null }
  } catch (error) {
    console.error("Error getting user orders:", error)
    return { orders: [], error }
  }
}

// Create a new order
export async function createOrder(orderData: Order): Promise<{ id: string | null; error: any }> {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    console.error("Error creating order:", error)
    return { id: null, error }
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<{ order: Order | null; error: any }> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    const orderSnap = await getDoc(orderRef)

    if (orderSnap.exists()) {
      return { order: { id: orderSnap.id, ...orderSnap.data() } as Order, error: null }
    } else {
      return { order: null, error: "Order not found" }
    }
  } catch (error) {
    console.error("Error getting order:", error)
    return { order: null, error }
  }
}

// Get all orders
export async function getAllOrders(): Promise<{ orders: Order[]; error: any }> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const orders: Order[] = []

    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order)
    })

    return { orders, error: null }
  } catch (error) {
    console.error("Error getting all orders:", error)
    return { orders: [], error }
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error: any }> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    })
    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error }
  }
}

// Get all users
export async function getAllUsers(): Promise<{ users: UserProfile[]; error: any }> {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const users: UserProfile[] = []

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile)
    })

    return { users, error: null }
  } catch (error) {
    console.error("Error getting all users:", error)
    return { users: [], error }
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<{ user: UserProfile | null; error: any }> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { user: { id: userSnap.id, ...userSnap.data() } as UserProfile, error: null }
    } else {
      return { user: null, error: "User not found" }
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return { user: null, error }
  }
}

// Get recent orders
export async function getRecentOrders(count = 5): Promise<{ orders: Order[]; error: any }> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"), limit(count))
    const querySnapshot = await getDocs(q)
    const orders: Order[] = []

    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order)
    })

    return { orders, error: null }
  } catch (error) {
    console.error("Error getting recent orders:", error)
    return { orders: [], error }
  }
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<{
  stats: {
    totalRevenue: number
    totalSales: number
    activePlans: number
    totalCustomers: number
    recentSales: any[]
    popularPlans: HousePlan[]
  }
  error: any
}> {
  try {
    // Get all orders
    const ordersQuery = query(collection(db, ORDERS_COLLECTION))
    const ordersSnapshot = await getDocs(ordersQuery)

    // Get all plans
    const plansQuery = query(collection(db, PLANS_COLLECTION), where("status", "==", "published"))
    const plansSnapshot = await getDocs(plansQuery)

    // Get all users
    const usersQuery = query(collection(db, USERS_COLLECTION))
    const usersSnapshot = await getDocs(usersQuery)

    // Calculate total revenue
    let totalRevenue = 0
    ordersSnapshot.forEach((doc) => {
      const order = doc.data() as Order
      totalRevenue += Number.parseFloat(order.price || "0")
    })

    // Get recent sales
    const recentSalesQuery = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"), limit(5))
    const recentSalesSnapshot = await getDocs(recentSalesQuery)
    const recentSales: any[] = []

    for (const doc of recentSalesSnapshot.docs) {
      const order = doc.data() as Order
      const userProfile = order.userId ? await getUserById(order.userId) : null

      recentSales.push({
        id: doc.id,
        customer:
          userProfile?.user?.firstName && userProfile?.user?.lastName
            ? `${userProfile.user.firstName} ${userProfile.user.lastName}`
            : order.userName || "Anonymous",
        email: userProfile?.user?.email || order.userEmail || "N/A",
        amount: order.price || "0",
        date: order.createdAt ? formatFirestoreTimestamp(order.createdAt) : "N/A",
      })
    }

    // Get popular plans
    const { plans: popularPlans } = await getPopularHousePlans(5)

    return {
      stats: {
        totalRevenue,
        totalSales: ordersSnapshot.size,
        activePlans: plansSnapshot.size,
        totalCustomers: usersSnapshot.size,
        recentSales,
        popularPlans,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    return {
      stats: {
        totalRevenue: 0,
        totalSales: 0,
        activePlans: 0,
        totalCustomers: 0,
        recentSales: [],
        popularPlans: [],
      },
      error,
    }
  }
}

// Get site settings
export async function getSiteSettings(): Promise<{ settings: SiteSettings | null; error: any }> {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, "site")
    const settingsSnap = await getDoc(settingsRef)

    if (settingsSnap.exists()) {
      return { settings: { id: settingsSnap.id, ...settingsSnap.data() } as SiteSettings, error: null }
    } else {
      // Create default settings if they don't exist
      const defaultSettings: SiteSettings = {
        siteName: "Aricom Studios",
        siteDescription: "Premium House Plans",
        contactEmail: "contact@aricomstudios.com",
        phoneNumber: "(555) 123-4567",
        address: "123 Main St, Anytown, USA",
        taxRate: 7.5,
        shippingFee: 15,
        socialLinks: {
          facebook: "https://facebook.com/aricomstudios",
          twitter: "https://twitter.com/aricomstudios",
          instagram: "https://instagram.com/aricomstudios",
          pinterest: "https://pinterest.com/aricomstudios",
        },
        updatedAt: serverTimestamp(),
      }

      await setDoc(settingsRef, defaultSettings)
      return { settings: { id: "site", ...defaultSettings }, error: null }
    }
  } catch (error) {
    console.error("Error getting site settings:", error)
    return { settings: null, error }
  }
}

// Update site settings
export async function updateSiteSettings(
  settingsData: Partial<SiteSettings>,
): Promise<{ success: boolean; error: any }> {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, "site")
    await updateDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp(),
    })
    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating site settings:", error)
    return { success: false, error }
  }
}

// Helper function to format Firestore timestamp
export function formatFirestoreTimestamp(timestamp: any): string {
  if (!timestamp) return "N/A"

  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Invalid date"
  }
}

// Create sample orders for testing
export async function createSampleOrders(userId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Get published house plans
    const { plans } = await getPublishedHousePlans()
    if (plans.length === 0) {
      return { success: false, error: "No house plans available" }
    }

    // Get user profile
    const { profile } = await getUserProfile(userId)
    if (!profile) {
      return { success: false, error: "User profile not found" }
    }

    // Create sample orders
    const statuses = ["pending", "processing", "completed"]
    const sampleOrders = []

    for (let i = 0; i < 3; i++) {
      const plan = plans[Math.floor(Math.random() * plans.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      const orderData: Order = {
        userId,
        userEmail: profile.email,
        userName: `${profile.firstName} ${profile.lastName}`,
        planId: plan.id!,
        planTitle: plan.title,
        planImage: plan.images && plan.images.length > 0 ? plan.images[0] : undefined,
        price: plan.price,
        status,
        paymentMethod: "Credit Card",
        paymentId: `test_payment_${Date.now()}`,
        shippingAddress: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          address: profile.address || "123 Main St",
          city: profile.city || "Anytown",
          state: profile.state || "CA",
          zipCode: profile.zipCode || "12345",
          country: "USA",
        },
        createdAt: new Date(Date.now() - i * 86400000), // Stagger creation dates
      }

      const { id, error } = await createOrder(orderData)
      if (error) {
        console.error("Error creating sample order:", error)
      } else {
        sampleOrders.push(id)
      }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error creating sample orders:", error)
    return { success: false, error }
  }
}

// Add these functions to the existing firestore.ts file

// Save a plan to favorites
export async function saveFavoritePlan(userId: string, planId: string): Promise<{ success: boolean; error: any }> {
  try {
    const favoriteRef = doc(db, `users/${userId}/favorites`, planId)
    await setDoc(favoriteRef, {
      planId,
      createdAt: serverTimestamp(),
    })
    return { success: true, error: null }
  } catch (error) {
    console.error("Error saving favorite plan:", error)
    return { success: false, error }
  }
}

// Remove a plan from favorites
export async function removeFavoritePlan(userId: string, planId: string): Promise<{ success: boolean; error: any }> {
  try {
    const favoriteRef = doc(db, `users/${userId}/favorites`, planId)
    await deleteDoc(favoriteRef)
    return { success: true, error: null }
  } catch (error) {
    console.error("Error removing favorite plan:", error)
    return { success: false, error }
  }
}

// Get user's favorite plans
export async function getUserFavorites(userId: string): Promise<{ favorites: HousePlan[]; error: any }> {
  try {
    const favoritesRef = collection(db, `users/${userId}/favorites`)
    const favoritesSnapshot = await getDocs(favoritesRef)

    if (favoritesSnapshot.empty) {
      return { favorites: [], error: null }
    }

    // Get all favorite plan IDs
    const favoriteIds = favoritesSnapshot.docs.map((doc) => doc.id)

    // Get plan details for each favorite
    const favorites: HousePlan[] = []

    for (const planId of favoriteIds) {
      const { plan, error } = await getHousePlanById(planId)
      if (plan && !error) {
        favorites.push(plan)
      }
    }

    return { favorites, error: null }
  } catch (error) {
    console.error("Error getting user favorites:", error)
    return { favorites: [], error }
  }
}

// Check if a plan is in user's favorites
export async function isPlanFavorite(userId: string, planId: string): Promise<{ isFavorite: boolean; error: any }> {
  try {
    const favoriteRef = doc(db, `users/${userId}/favorites`, planId)
    const favoriteSnap = await getDoc(favoriteRef)

    return { isFavorite: favoriteSnap.exists(), error: null }
  } catch (error) {
    console.error("Error checking if plan is favorite:", error)
    return { isFavorite: false, error }
  }
}

// Add this function to get similar house plans
export async function getSimilarHousePlans(
  currentPlan: HousePlan,
  maxCount = 4,
): Promise<{ plans: HousePlan[]; error: string | null }> {
  try {
    // Get plans with similar style, bedrooms, or square footage
    const plansRef = collection(db, PLANS_COLLECTION)

    // Create a query to find plans with the same style
    let q = query(
      plansRef,
      where("status", "==", "published"),
      where("style", "==", currentPlan.style),
      limit(maxCount),
    )

    const querySnapshot = await getDocs(q)
    let plans: HousePlan[] = []

    // Convert to HousePlan objects
    plans = querySnapshot.docs
      .filter((doc) => doc.id !== currentPlan.id) // Filter out current plan
      .map((doc) => {
        return { id: doc.id, ...doc.data() } as HousePlan
      })

    // If we don't have enough plans, try a different query based on bedrooms
    if (plans.length < maxCount) {
      q = query(
        plansRef,
        where("status", "==", "published"),
        where("bedrooms", "==", currentPlan.bedrooms),
        limit(maxCount - plans.length),
      )

      const bedroomsSnapshot = await getDocs(q)

      // Add plans that aren't already in the list and aren't the current plan
      const existingIds = new Set(plans.map((plan) => plan.id))
      existingIds.add(currentPlan.id!) // Add current plan ID to exclude it

      const additionalPlans = bedroomsSnapshot.docs
        .filter((doc) => !existingIds.has(doc.id))
        .map((doc) => ({ id: doc.id, ...doc.data() }) as HousePlan)

      plans = [...plans, ...additionalPlans.slice(0, maxCount - plans.length)]
    }

    // If we still don't have enough plans, get some random ones
    if (plans.length < maxCount) {
      q = query(
        plansRef,
        where("status", "==", "published"),
        limit(maxCount * 2), // Get more than we need to ensure we have enough after filtering
      )

      const randomSnapshot = await getDocs(q)

      // Add plans that aren't already in the list and aren't the current plan
      const existingIds = new Set(plans.map((plan) => plan.id))
      existingIds.add(currentPlan.id!) // Add current plan ID to exclude it

      const additionalPlans = randomSnapshot.docs
        .filter((doc) => !existingIds.has(doc.id))
        .map((doc) => ({ id: doc.id, ...doc.data() }) as HousePlan)

      plans = [...plans, ...additionalPlans.slice(0, maxCount - plans.length)]
    }

    return { plans, error: null }
  } catch (error) {
    console.error("Error getting similar house plans:", error)
    return { plans: [], error: "Failed to get similar house plans" }
  }
}
