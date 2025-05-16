import Link from "next/link"
import { Building2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container flex flex-col gap-6 py-8 px-4 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Aricom Studios</span>
            </Link>
            <p className="text-sm text-gray-500">
              A subsidiary of Aricom Building Contractors, providing premium architectural house plans.
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <h3 className="font-semibold mb-3">House Plans</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/plans" className="text-gray-500 hover:text-gray-900">
                  All Plans
                </Link>
              </li>
              <li>
                <Link href="/plans?style=modern" className="text-gray-500 hover:text-gray-900">
                  Modern
                </Link>
              </li>
              <li>
                <Link href="/plans?style=traditional" className="text-gray-500 hover:text-gray-900">
                  Traditional
                </Link>
              </li>
              <li>
                <Link href="/plans?style=farmhouse" className="text-gray-500 hover:text-gray-900">
                  Farmhouse
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-2 md:mt-0">
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-500 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-500 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-2 md:mt-0">
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-500 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-gray-500 border-t pt-6 mt-2">
          © {new Date().getFullYear()} Aricom Studios. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
