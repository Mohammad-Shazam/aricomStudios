import Link from "next/link"
import { ArrowLeft, Building2 } from "lucide-react"

import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8 self-start">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center justify-center mb-8">
          <Building2 className="h-10 w-10 text-primary mr-2" />
          <h1 className="text-3xl font-bold">Aricom Studios</h1>
        </div>

        <div className="w-full max-w-md">
          <LoginForm />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By logging in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
