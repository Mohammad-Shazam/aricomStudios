"use client"

import { useEffect, useState } from "react"
import { Download, Eye, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { AccountSidebar } from "@/components/account/account-sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getUserOrders, getHousePlanById, type Order } from "@/lib/firestore"

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account/orders")
    }
  }, [user, authLoading, router])

  // Fetch user orders
  useEffect(() => {
    async function fetchUserOrders() {
      if (user) {
        setLoading(true)
        try {
          const { orders: userOrders, error } = await getUserOrders(user.uid)
          if (error) {
            toast({
              title: "Error",
              description: "Failed to load your orders. Please try again.",
              variant: "destructive",
            })
          } else {
            // Fetch plan details for each order
            const ordersWithDetails = await Promise.all(
              userOrders.map(async (order) => {
                try {
                  const { plan } = await getHousePlanById(order.planId)
                  return {
                    ...order,
                    planTitle: plan?.title || order.planTitle,
                    planImage: plan?.images?.[0] || order.planImage,
                  }
                } catch (error) {
                  console.error("Error fetching plan details:", error)
                  return order
                }
              }),
            )
            setOrders(ordersWithDetails)
          }
        } catch (error) {
          console.error("Error fetching orders:", error)
          toast({
            title: "Error",
            description: "Failed to load your orders. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserOrders()
  }, [user, toast])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const viewOrder = (orderId: string) => {
    // This would typically navigate to an order details page
    toast({
      title: "View Order",
      description: `Viewing order #${orderId}`,
    })
  }

  const downloadPlan = (orderId: string) => {
    // This would typically trigger a download of the plan files
    toast({
      title: "Download Plan",
      description: `Downloading plan for order #${orderId}`,
    })
  }

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader title="My Orders" />
        <div className="container px-4 md:px-6 py-8 mx-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="My Orders" />

      <div className="container px-4 md:px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <div>
            <AccountSidebar activePage="orders" />
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and manage your house plan purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id?.substring(0, 6)}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.planImage && (
                                <div className="h-10 w-10 rounded overflow-hidden">
                                  <Image
                                    src={order.planImage || "/placeholder.svg"}
                                    alt={order.planTitle}
                                    width={40}
                                    height={40}
                                    className="object-cover h-full w-full"
                                  />
                                </div>
                              )}
                              {order.planTitle}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>${order.price}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => viewOrder(order.id!)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Order</span>
                              </Button>
                              {order.status === "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => downloadPlan(order.id!)}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-300 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">
                      Browse our house plans and make a purchase to see your order history
                    </p>
                    <Button asChild>
                      <a href="/plans">Browse House Plans</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
