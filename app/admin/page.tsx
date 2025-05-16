"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, Home, LayoutDashboard, LogOut, Package, Settings, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAllHousePlans,
  deleteHousePlan,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getDashboardStats,
  getSiteSettings,
  updateSiteSettings,
  formatFirestoreTimestamp,
  type HousePlan,
  type Order,
  type UserProfile,
  type SiteSettings,
} from "@/lib/firestore"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [plansData, setPlansData] = useState<HousePlan[]>([])
  const [ordersData, setOrdersData] = useState<Order[]>([])
  const [usersData, setUsersData] = useState<UserProfile[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalRevenue: 0,
    totalSales: 0,
    activePlans: 0,
    totalCustomers: 0,
    recentSales: [],
    popularPlans: [],
  })
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isSettingsChanged, setIsSettingsChanged] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading, isAdmin, logout } = useAuth()

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login")
      toast({
        title: "Access denied",
        description: "You must be logged in as an admin to access this page.",
        variant: "destructive",
      })
      return
    }

    // Fetch data based on active tab
    if (user && isAdmin) {
      fetchData()
    }
  }, [user, authLoading, isAdmin, router, toast, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard stats for overview tab
      const { stats, error: statsError } = await getDashboardStats()
      if (statsError) {
        console.error("Error fetching dashboard stats:", statsError)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Please try again.",
          variant: "destructive",
        })
      } else {
        setDashboardStats(stats)
      }

      // Fetch house plans
      if (activeTab === "overview" || activeTab === "plans") {
        const { plans, error: plansError } = await getAllHousePlans()
        if (plansError) {
          console.error("Error fetching house plans:", plansError)
          toast({
            title: "Error",
            description: "Failed to load house plans. Please try again.",
            variant: "destructive",
          })
        } else {
          setPlansData(plans)
        }
      }

      // Fetch orders
      if (activeTab === "overview" || activeTab === "orders") {
        const { orders, error: ordersError } = await getAllOrders()
        if (ordersError) {
          console.error("Error fetching orders:", ordersError)
          toast({
            title: "Error",
            description: "Failed to load orders. Please try again.",
            variant: "destructive",
          })
        } else {
          setOrdersData(orders)
        }
      }

      // Fetch users
      if (activeTab === "overview" || activeTab === "customers") {
        const { users, error: usersError } = await getAllUsers()
        if (usersError) {
          console.error("Error fetching users:", usersError)
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive",
          })
        } else {
          setUsersData(users)
        }
      }

      // Fetch site settings
      if (activeTab === "settings") {
        const { settings, error: settingsError } = await getSiteSettings()
        if (settingsError) {
          console.error("Error fetching site settings:", settingsError)
          toast({
            title: "Error",
            description: "Failed to load site settings. Please try again.",
            variant: "destructive",
          })
        } else {
          setSiteSettings(settings)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (confirm(`Are you sure you want to delete "${planName}"?`)) {
      try {
        const { success, error } = await deleteHousePlan(planId)

        if (!success || error) {
          throw new Error(error || "Failed to delete house plan")
        }

        // Update the local state to remove the deleted plan
        setPlansData(plansData.filter((plan) => plan.id !== planId))

        toast({
          title: "Success",
          description: `"${planName}" has been deleted.`,
        })
      } catch (error) {
        console.error("Error deleting house plan:", error)
        toast({
          title: "Error",
          description: "Failed to delete house plan. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDialogOpen(true)
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { success, error } = await updateOrderStatus(orderId, status)

      if (!success || error) {
        throw new Error(error || "Failed to update order status")
      }

      // Update the local state
      setOrdersData(ordersData.map((order) => (order.id === orderId ? { ...order, status } : order)))

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status })
      }

      toast({
        title: "Success",
        description: `Order status updated to ${status}.`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user)
    setIsUserDialogOpen(true)
  }

  const handleSaveSettings = async () => {
    if (!siteSettings) return

    try {
      setLoading(true)
      const { success, error } = await updateSiteSettings(siteSettings)

      if (!success || error) {
        throw new Error(error || "Failed to update site settings")
      }

      setIsSettingsChanged(false)
      toast({
        title: "Success",
        description: "Site settings have been updated.",
      })
    } catch (error) {
      console.error("Error updating site settings:", error)
      toast({
        title: "Error",
        description: "Failed to update site settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsChange = (field: string, value: any) => {
    if (!siteSettings) return

    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setSiteSettings({
        ...siteSettings,
        [parent]: {
          ...siteSettings[parent as keyof SiteSettings],
          [child]: value,
        },
      })
    } else {
      setSiteSettings({
        ...siteSettings,
        [field]: value,
      })
    }

    setIsSettingsChanged(true)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (authLoading) {
    return <div className="container py-10 text-center">Loading...</div>
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Building2 className="h-6 w-6" />
              <span>Aricom Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                  <button>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activeTab === "plans"} onClick={() => setActiveTab("plans")}>
                  <button>
                    <Home className="h-4 w-4" />
                    <span>House Plans</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activeTab === "orders"} onClick={() => setActiveTab("orders")}>
                  <button>
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === "customers"}
                  onClick={() => setActiveTab("customers")}
                >
                  <button>
                    <Users className="h-4 w-4" />
                    <span>Customers</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
                  <button>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-6">
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.photoURL ||
                  `/placeholder.svg?height=32&width=32&text=${user?.email?.charAt(0).toUpperCase() || "A"}`
                }
                className="h-9 w-9 rounded-full"
                alt="Admin User"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.displayName || "Admin User"}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
            <SidebarTrigger />
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="plans">House Plans</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="ml-2">Loading dashboard data...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                          >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${dashboardStats.totalRevenue.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Sales</CardTitle>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                          >
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                          </svg>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{dashboardStats.totalSales}</div>
                          <p className="text-xs text-muted-foreground">Total orders</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                          >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{dashboardStats.activePlans}</div>
                          <p className="text-xs text-muted-foreground">Published house plans</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Customers</CardTitle>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                          <p className="text-xs text-muted-foreground">Registered users</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                      <Card className="col-span-4">
                        <CardHeader>
                          <CardTitle>Recent Sales</CardTitle>
                          <CardDescription>{dashboardStats.recentSales.length} sales this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {dashboardStats.recentSales.map((sale: any, i: number) => (
                              <div key={i} className="flex items-center">
                                <div className="mr-4 h-9 w-9 overflow-hidden rounded-full">
                                  <img
                                    src={`/placeholder.svg?height=36&width=36&text=${sale.customer.charAt(0)}`}
                                    alt={sale.customer}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium leading-none">{sale.customer}</p>
                                  <p className="text-sm text-muted-foreground">{sale.email}</p>
                                </div>
                                <div className="font-medium">${sale.amount}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="col-span-3">
                        <CardHeader>
                          <CardTitle>Popular Plans</CardTitle>
                          <CardDescription>Your most viewed house plans this month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {dashboardStats.popularPlans.map((plan: HousePlan, i: number) => (
                              <div key={i} className="flex items-center">
                                <div className="mr-4 h-9 w-9 overflow-hidden rounded-md">
                                  <img
                                    src={plan.images?.[0] || "/placeholder.svg?height=36&width=36"}
                                    alt={plan.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium leading-none">{plan.title}</p>
                                  <p className="text-sm text-muted-foreground">{plan.views || 0} views</p>
                                </div>
                                <div className="font-medium">${plan.price}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="plans" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>House Plans</CardTitle>
                      <CardDescription>Manage your house plan catalog.</CardDescription>
                    </div>
                    <Button asChild>
                      <Link href="/admin/add-plan">Add New Plan</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading house plans...</p>
                        </div>
                      ) : plansData.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-[1fr_200px_100px_100px_80px] gap-2 p-4 font-medium">
                            <div>Name</div>
                            <div>Style</div>
                            <div>Price</div>
                            <div>Status</div>
                            <div className="text-right">Actions</div>
                          </div>
                          <Separator />
                          {plansData.map((plan) => (
                            <div
                              key={plan.id}
                              className="grid grid-cols-[1fr_200px_100px_100px_80px] gap-2 p-4 items-center"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={plan.images?.[0] || "/placeholder.svg?height=40&width=60"}
                                  alt={plan.title}
                                  className="h-10 w-14 rounded object-cover"
                                />
                                <span className="font-medium">{plan.title}</span>
                              </div>
                              <div>{plan.style}</div>
                              <div>${plan.price}</div>
                              <div>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    plan.status === "published"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {plan.status}
                                </span>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/admin/edit-plan/${plan.id}`}>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      className="h-4 w-4"
                                    >
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeletePlan(plan.id!, plan.title)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">No house plans found.</p>
                          <Button asChild>
                            <Link href="/admin/add-plan">Add Your First Plan</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>Manage customer orders and track their status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
                        </div>
                      ) : ordersData.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-2 p-4 font-medium">
                            <div>Order ID</div>
                            <div>Customer</div>
                            <div>Date</div>
                            <div>Status</div>
                            <div className="text-right">Total</div>
                          </div>
                          <Separator />
                          {ordersData.map((order) => (
                            <div
                              key={order.id}
                              className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-2 p-4 items-center cursor-pointer hover:bg-gray-50"
                              onClick={() => handleViewOrder(order)}
                            >
                              <div className="font-medium">#{order.id?.substring(0, 6)}</div>
                              <div>{order.userName || order.userEmail || "Anonymous"}</div>
                              <div>{formatFirestoreTimestamp(order.createdAt)}</div>
                              <div>
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
                              </div>
                              <div className="text-right">${order.price}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No orders found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customers</CardTitle>
                    <CardDescription>Manage your customer database.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
                        </div>
                      ) : usersData.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-[1fr_200px_200px_100px] gap-2 p-4 font-medium">
                            <div>Name</div>
                            <div>Email</div>
                            <div>Joined</div>
                            <div className="text-right">Role</div>
                          </div>
                          <Separator />
                          {usersData.map((user) => (
                            <div
                              key={user.id}
                              className="grid grid-cols-[1fr_200px_200px_100px] gap-2 p-4 items-center cursor-pointer hover:bg-gray-50"
                              onClick={() => handleViewUser(user)}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={`/placeholder.svg?height=32&width=32&text=${
                                    user.firstName
                                      ? user.firstName.charAt(0).toUpperCase()
                                      : user.email
                                        ? user.email.charAt(0).toUpperCase()
                                        : "U"
                                  }`}
                                  alt={user.firstName || user.email || "User"}
                                  className="h-8 w-8 rounded-full"
                                />
                                <span className="font-medium">
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.email || "Anonymous"}
                                </span>
                              </div>
                              <div>{user.email}</div>
                              <div>{formatFirestoreTimestamp(user.createdAt)}</div>
                              <div className="text-right">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    user.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {user.role || "user"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No customers found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your website settings and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading settings...</p>
                      </div>
                    ) : siteSettings ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">General Settings</h3>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="siteName" className="text-right">
                                Site Name
                              </Label>
                              <Input
                                id="siteName"
                                value={siteSettings.siteName}
                                onChange={(e) => handleSettingsChange("siteName", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="siteDescription" className="text-right">
                                Site Description
                              </Label>
                              <Textarea
                                id="siteDescription"
                                value={siteSettings.siteDescription}
                                onChange={(e) => handleSettingsChange("siteDescription", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Contact Information</h3>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="contactEmail" className="text-right">
                                Contact Email
                              </Label>
                              <Input
                                id="contactEmail"
                                type="email"
                                value={siteSettings.contactEmail}
                                onChange={(e) => handleSettingsChange("contactEmail", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="phoneNumber" className="text-right">
                                Phone Number
                              </Label>
                              <Input
                                id="phoneNumber"
                                value={siteSettings.phoneNumber}
                                onChange={(e) => handleSettingsChange("phoneNumber", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="address" className="text-right">
                                Address
                              </Label>
                              <Textarea
                                id="address"
                                value={siteSettings.address}
                                onChange={(e) => handleSettingsChange("address", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">E-commerce Settings</h3>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="taxRate" className="text-right">
                                Tax Rate (%)
                              </Label>
                              <Input
                                id="taxRate"
                                type="number"
                                value={siteSettings.taxRate}
                                onChange={(e) => handleSettingsChange("taxRate", Number.parseFloat(e.target.value))}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="shippingFee" className="text-right">
                                Shipping Fee ($)
                              </Label>
                              <Input
                                id="shippingFee"
                                type="number"
                                value={siteSettings.shippingFee}
                                onChange={(e) => handleSettingsChange("shippingFee", Number.parseFloat(e.target.value))}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Social Media</h3>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="facebook" className="text-right">
                                Facebook
                              </Label>
                              <Input
                                id="facebook"
                                value={siteSettings.socialLinks?.facebook || ""}
                                onChange={(e) => handleSettingsChange("socialLinks.facebook", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="twitter" className="text-right">
                                Twitter
                              </Label>
                              <Input
                                id="twitter"
                                value={siteSettings.socialLinks?.twitter || ""}
                                onChange={(e) => handleSettingsChange("socialLinks.twitter", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="instagram" className="text-right">
                                Instagram
                              </Label>
                              <Input
                                id="instagram"
                                value={siteSettings.socialLinks?.instagram || ""}
                                onChange={(e) => handleSettingsChange("socialLinks.instagram", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="pinterest" className="text-right">
                                Pinterest
                              </Label>
                              <Input
                                id="pinterest"
                                value={siteSettings.socialLinks?.pinterest || ""}
                                onChange={(e) => handleSettingsChange("socialLinks.pinterest", e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleSaveSettings} disabled={!isSettingsChanged || loading}>
                            {loading ? "Saving..." : "Save Settings"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Failed to load settings. Please try again.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id?.substring(0, 6)} - {formatFirestoreTimestamp(selectedOrder?.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Customer Information</h3>
                  <p className="text-sm">{selectedOrder.userName || selectedOrder.userEmail || "Anonymous"}</p>
                  <p className="text-sm">{selectedOrder.userEmail || "No email provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Order Status</h3>
                  <Select
                    defaultValue={selectedOrder.status}
                    onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id!, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Product Information</h3>
                <div className="flex items-center gap-3">
                  {selectedOrder.planImage && (
                    <img
                      src={selectedOrder.planImage || "/placeholder.svg"}
                      alt={selectedOrder.planTitle}
                      className="h-16 w-24 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{selectedOrder.planTitle}</p>
                    <p className="text-sm text-gray-500">Plan ID: {selectedOrder.planId}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {selectedOrder.shippingAddress && (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                    </p>
                    <p className="text-sm">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                  </div>

                  <Separator />
                </>
              )}

              <div>
                <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                <div className="flex justify-between">
                  <p className="text-sm">Payment Method:</p>
                  <p className="text-sm font-medium">{selectedOrder.paymentMethod || "Not specified"}</p>
                </div>
                {selectedOrder.paymentId && (
                  <div className="flex justify-between">
                    <p className="text-sm">Payment ID:</p>
                    <p className="text-sm font-medium">{selectedOrder.paymentId}</p>
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <p className="text-sm font-medium">Total:</p>
                  <p className="text-sm font-bold">${selectedOrder.price}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>User information and order history</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={`/placeholder.svg?height=64&width=64&text=${
                    selectedUser.firstName
                      ? selectedUser.firstName.charAt(0).toUpperCase()
                      : selectedUser.email
                        ? selectedUser.email.charAt(0).toUpperCase()
                        : "U"
                  }`}
                  alt={selectedUser.firstName || selectedUser.email || "User"}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedUser.firstName && selectedUser.lastName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.email || "Anonymous"}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <p className="text-sm text-gray-500">Joined: {formatFirestoreTimestamp(selectedUser.createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                  <p className="text-sm">Email: {selectedUser.email || "Not provided"}</p>
                  <p className="text-sm">Phone: {selectedUser.phone || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Address</h3>
                  {selectedUser.address ? (
                    <>
                      <p className="text-sm">{selectedUser.address}</p>
                      <p className="text-sm">
                        {selectedUser.city}, {selectedUser.state} {selectedUser.zipCode}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm">No address provided</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Account Type</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedUser.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedUser.role || "user"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
