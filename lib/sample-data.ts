import { collection, getDocs, query, where, limit } from "firebase/firestore"
import { db } from "./firebase"
import { createOrder } from "./firestore"

// Create sample orders for a user
export async function createSampleOrders(userId: string) {
  try {
    // First, check if the user already has orders
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("userId", "==", userId), limit(1))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      console.log("User already has orders, skipping sample data creation")
      return { success: true }
    }

    // Get some published house plans to use for orders
    const plansRef = collection(db, "housePlans")
    const plansQuery = query(plansRef, where("status", "==", "published"), limit(3))
    const plansSnapshot = await getDocs(plansQuery)

    if (plansSnapshot.empty) {
      console.log("No published house plans found")
      return { success: false, error: "No published house plans found" }
    }

    // Create sample orders
    const plans = plansSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const statuses = ["completed", "processing", "pending"]

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i]
      const orderData = {
        userId,
        planId: plan.id,
        planTitle: plan.title,
        planImage: plan.images?.[0] || "",
        price: plan.price,
        status: statuses[i],
        paymentMethod: "credit_card",
        paymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
        createdAt: new Date(Date.now() - i * 86400000), // Stagger dates
      }

      await createOrder(orderData)
    }

    console.log("Sample orders created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error creating sample orders:", error)
    return { success: false, error }
  }
}
