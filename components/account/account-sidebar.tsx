import Link from "next/link"
import { CreditCard, Heart, LogOut, Package, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"

interface AccountSidebarProps {
  activePage: string
}

export function AccountSidebar({ activePage }: AccountSidebarProps) {
  const menuItems = [
    { id: "profile", label: "My Profile", icon: User, href: "/account" },
    { id: "orders", label: "My Orders", icon: Package, href: "/account/orders" },
    { id: "favorites", label: "Saved Plans", icon: Heart, href: "/account/favorites" },
    { id: "billing", label: "Billing", icon: CreditCard, href: "/account/billing" },
    { id: "settings", label: "Settings", icon: Settings, href: "/account/settings" },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Link key={item.id} href={item.href}>
            <Button variant={activePage === item.id ? "default" : "ghost"} className="w-full justify-start">
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
      <div className="pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
