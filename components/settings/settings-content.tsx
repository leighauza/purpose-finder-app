"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react"
import { haptic } from "@/lib/haptic"
import { useToast } from "@/hooks/use-toast"

export function SettingsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isBirthDetailsExpanded, setIsBirthDetailsExpanded] = useState(true)

  const [userData, setUserData] = useState<{
    name: string
    email: string
    birthDate: string
    birthTime: string
    birthCity: string
    timezone: string
  }>({
    name: "",
    email: "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
    timezone: "",
  })

  const [isBirthDetailsLoading, setIsBirthDetailsLoading] = useState(true)

  // Load active/current birth details + user email
  useEffect(() => {
    async function loadSettingsData() {
      try {
        // 1) Birth details
        const bdRes = await fetch("/api/birth-details/current")
        let birthDetail = null
        if (bdRes.ok) {
          const bdData = await bdRes.json()
          birthDetail = bdData.birthDetail // Updated to match new API response
        }

        // 2) User email - for now empty, can add /api/me later
        const email = ""

        if (birthDetail) {
          setUserData({
            name: birthDetail.name || "",
            email,
            birthDate: birthDetail.birth_date || "",
            birthTime: birthDetail.birth_time || "",
            birthCity: birthDetail.birth_city || "",
            timezone: birthDetail.timezone || "",
          })
        } else {
          setUserData((prev) => ({
            ...prev,
            email,
          }))
        }
      } catch (e) {
        console.error("Failed to load settings data", e)
      } finally {
        setIsBirthDetailsLoading(false)
      }
    }

    loadSettingsData()
  }, [])

  const handleLogout = () => {
    haptic.medium()
    router.push("/login")
  }

  const handleCopyChartDetails = async () => {
    haptic.light()

    if (!userData.birthDate || !userData.birthTime || !userData.birthCity) {
      toast({
        title: "No birth details",
        description: "Please add your birth details first.",
        variant: "destructive",
      })
      return
    }

    const chartDetails = `Name: ${userData.name || "Unknown"}
Date of Birth: ${
      userData.birthDate
        ? new Date(userData.birthDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Unknown"
    }
Time of Birth: ${userData.birthTime || "Unknown"}
Place of Birth: ${userData.birthCity || "Unknown"}
Timezone: ${userData.timezone || "Unknown"}`

    try {
      await navigator.clipboard.writeText(chartDetails)
      toast({
        title: "Copied to clipboard",
        description: "Your birth chart details have been copied.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* COMMENTED OUT FOR BETA - RESTORE WHEN IMPLEMENTING PAID SUBSCRIPTIONS
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Trial Usage
          </CardTitle>
          <CardDescription>Track your free trial messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Messages remaining</span>
              <span className="font-semibold">
                {subscription.messagesLeft} of {subscription.maxMessages}
              </span>
            </div>
            <Progress
              value={trialProgress}
              className="h-3"
              indicatorClassName={
                trialProgress > 50 ? "bg-secondary" : trialProgress > 25 ? "bg-accent" : "bg-destructive"
              }
            />
            <p className="text-xs text-muted-foreground">
              {subscription.messagesLeft === 0
                ? "Your trial has ended. Upgrade to continue."
                : subscription.messagesLeft < 5
                  ? "You're running low on messages. Consider upgrading."
                  : "You're doing great! Keep exploring."}
            </p>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Birth Details - ACTIVE */}
      <Card className="border-border shadow-lg">
        <CardHeader
          className="cursor-pointer"
          onClick={() => {
            haptic.light()
            setIsBirthDetailsExpanded(!isBirthDetailsExpanded)
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Birth Details
              </CardTitle>
              <CardDescription>Your astrological birth information</CardDescription>
            </div>
            {isBirthDetailsExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {isBirthDetailsExpanded && (
          <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {isBirthDetailsLoading ? (
              <p className="text-sm text-muted-foreground">Loading birth details...</p>
            ) : !userData.birthDate ? (
              <p className="text-sm text-muted-foreground">
                No birth details saved yet. Click &quot;Edit Birth Details&quot; to add them.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{userData.name || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                      <p className="font-medium">
                        {new Date(userData.birthDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Time of Birth</Label>
                      <p className="font-medium">{userData.birthTime || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs text-muted-foreground">City of Birth</Label>
                      <p className="font-medium">{userData.birthCity || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 min-h-[48px] border-primary text-primary hover:bg-primary/10 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  haptic.light()
                  router.push("/settings/edit-birth-details")
                }}
              >
                Edit Birth Details
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-h-[48px] bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyChartDetails()
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Chart Details
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* COMMENTED OUT FOR BETA - RESTORE WHEN IMPLEMENTING PAID SUBSCRIPTIONS
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <Label className="text-xs text-muted-foreground">Current Plan</Label>
              <p className="font-medium text-lg">{subscription.plan}</p>
            </div>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {subscription.messagesLeft}/{subscription.maxMessages} messages
            </Badge>
          </div>

          <Button
            className="w-full min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              haptic.medium()
              router.push("/subscription/manage")
            }}
          >
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
      */}

      {/* COMMENTED OUT FOR BETA - RESTORE WHEN IMPLEMENTING PAYMENT METHODS
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Method
          </CardTitle>
          <CardDescription>Choose how you want to pay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full min-h-[48px] justify-start bg-transparent"
            onClick={() => {
              haptic.light()
              router.push("/payment/gcash")
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with GCash
          </Button>
          <Button
            variant="outline"
            className="w-full min-h-[48px] justify-start bg-transparent"
            onClick={() => {
              haptic.light()
              router.push("/payment/select")
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with Card (LemonSqueezy)
          </Button>
        </CardContent>
      </Card>
      */}

      {/* COMMENTED OUT FOR BETA - RESTORE WHEN IMPLEMENTING PAYMENT HISTORY
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif">Payment History</CardTitle>
          <CardDescription>View your past transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {new Date(payment.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>
                        {payment.status === "completed" ? (
                          <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : payment.status === "failed" ? (
                          <Badge variant="destructive" className="bg-destructive/20 text-destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock3 className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.receiptUrl && payment.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => handleDownloadReceipt(payment.receiptUrl!)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
      */}

      {/* Account Section - ACTIVE */}
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif">Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              disabled
              className="bg-muted/30 min-h-[48px]"
            />
          </div>

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full min-h-[48px] border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                onClick={() => haptic.light()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll need to login again to continue your astrological journey with Clarity.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => haptic.light()}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}