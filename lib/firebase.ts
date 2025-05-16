import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0ZqPdIxNmerOiiZgBYrM2DrdY9l9gZ8o",
  authDomain: "aricom-studios.firebaseapp.com",
  databaseURL: "https://aricom-studios-default-rtdb.firebaseio.com",
  projectId: "aricom-studios",
  storageBucket: "aricom-studios.appspot.com",
  messagingSenderId: "471011937467",
  appId: "1:471011937467:web:e0875f874abb208bdfed9e",
  measurementId: "G-S7WRT8H0N5",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Initialize Analytics conditionally (only in browser)
export const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    const analyticsSupported = await isSupported()
    if (analyticsSupported) {
      return getAnalytics(app)
    }
  }
  return null
}

export default app
