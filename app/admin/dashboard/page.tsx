"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Users, Eye, Check, X, Clock, Activity, User, Settings, Fuel } from "lucide-react"

interface Logsheet {
  _id: string
  userId: {
    _id: string
    email: string
  }
  data: {
    assetCode: string
    assetDescription: string
    operatorName: string
    date: string
    workingDetails: {
      commenced: {
        time: string
        hmrOrKmrReading: string
      }
      completed: {
        time: string
        hmrOrKmrReading: string
      }
    }
    productionDetails: {
      activityCode: string
      quantityProduced: number
      workDone: string
    }
    totals: {
      workingHours: number
      idleHours: number
      breakdownHours: number
      productionQty: number
      hmrOrKmrRun: string
      fuelInLiters: number
    }
    userInfo: {
      userName: string
      userSignature: string
    }
  }
  status: "Pending" | "Accepted" | "Rejected"
  submittedAt: string
  rejectionReason?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [logsheets, setLogsheets] = useState<Logsheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLogsheet, setSelectedLogsheet] = useState<Logsheet | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPendingLogsheets = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pending-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLogsheets(data)
      } else {
        setError("Failed to fetch logsheets")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleReviewLogsheet = (logsheet: Logsheet) => {
    setSelectedLogsheet(logsheet)
    setRejectionReason("")
    setShowReviewDialog(true)
  }

  const handleStatusUpdate = async (status: "Accepted" | "Rejected") => {
    if (!selectedLogsheet) return

    setActionLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/update-status/${selectedLogsheet._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            rejectionReason: status === "Rejected" ? rejectionReason : undefined,
          }),
        },
      )

      if (response.ok) {
        setShowReviewDialog(false)
        fetchPendingLogsheets()
        setSelectedLogsheet(null)
        setRejectionReason("")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update status")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingLogsheets()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="pt-20 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 px-6 pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Review and manage logsheet submissions</p>
          </div>
          <Button onClick={() => router.push("/admin/users")}>
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{logsheets.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logsheets.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(logsheets.map((l) => l.userId.email)).size}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Logsheets</CardTitle>
            <CardDescription>Review and approve or reject submitted logsheets</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsheets.map((logsheet) => (
                  <TableRow key={logsheet._id}>
                    <TableCell className="font-medium">{logsheet.data.assetCode}</TableCell>
                    <TableCell>{logsheet.data.operatorName}</TableCell>
                    <TableCell>{logsheet.data.date}</TableCell>
                    <TableCell>{logsheet.userId.email}</TableCell>
                    <TableCell>{formatDate(logsheet.submittedAt)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleReviewLogsheet(logsheet)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Review Logsheet
              </DialogTitle>
              <DialogDescription>Review the complete logsheet submission and approve or reject</DialogDescription>
            </DialogHeader>

            {selectedLogsheet && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Asset Code</p>
                      <p className="text-blue-900 dark:text-blue-100">{selectedLogsheet.data.assetCode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Operator Name</p>
                      <p className="text-blue-900 dark:text-blue-100">{selectedLogsheet.data.operatorName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Date</p>
                      <p className="text-blue-900 dark:text-blue-100">{selectedLogsheet.data.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Submitted By</p>
                      <p className="text-blue-900 dark:text-blue-100">{selectedLogsheet.userId.email}</p>
                    </div>
                  </div>
                  {selectedLogsheet.data.assetDescription && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Asset Description</p>
                      <p className="text-blue-900 dark:text-blue-100">{selectedLogsheet.data.assetDescription}</p>
                    </div>
                  )}
                </div>

                {/* Working Details */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Working Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Commenced</p>
                      <div className="space-y-1">
                        <p className="text-green-900 dark:text-green-100">
                          <span className="font-medium">Time:</span>{" "}
                          {selectedLogsheet.data.workingDetails.commenced.time}
                        </p>
                        <p className="text-green-900 dark:text-green-100">
                          <span className="font-medium">Reading:</span>{" "}
                          {selectedLogsheet.data.workingDetails.commenced.hmrOrKmrReading}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Completed</p>
                      <div className="space-y-1">
                        <p className="text-green-900 dark:text-green-100">
                          <span className="font-medium">Time:</span>{" "}
                          {selectedLogsheet.data.workingDetails.completed.time}
                        </p>
                        <p className="text-green-900 dark:text-green-100">
                          <span className="font-medium">Reading:</span>{" "}
                          {selectedLogsheet.data.workingDetails.completed.hmrOrKmrReading}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production Details */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Production Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Activity Code</p>
                      <p className="text-purple-900 dark:text-purple-100">
                        {selectedLogsheet.data.productionDetails.activityCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Quantity Produced</p>
                      <p className="text-purple-900 dark:text-purple-100">
                        {selectedLogsheet.data.productionDetails.quantityProduced}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Work Done</p>
                    <p className="text-purple-900 dark:text-purple-100">
                      {selectedLogsheet.data.productionDetails.workDone}
                    </p>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Totals
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Working Hours</p>
                      <p className="text-orange-900 dark:text-orange-100 font-semibold">
                        {selectedLogsheet.data.totals.workingHours}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Idle Hours</p>
                      <p className="text-orange-900 dark:text-orange-100 font-semibold">
                        {selectedLogsheet.data.totals.idleHours}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Breakdown Hours</p>
                      <p className="text-orange-900 dark:text-orange-100 font-semibold">
                        {selectedLogsheet.data.totals.breakdownHours}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Production Qty</p>
                      <p className="text-orange-900 dark:text-orange-100 font-semibold">
                        {selectedLogsheet.data.totals.productionQty}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">HMR/KMR Run</p>
                      <p className="text-orange-900 dark:text-orange-100 font-semibold">
                        {selectedLogsheet.data.totals.hmrOrKmrRun}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Fuel (Liters)</p>
                      <p className="text-orange-900 dark:text-orange-100 font-semibold flex items-center gap-1">
                        <Fuel className="h-4 w-4" />
                        {selectedLogsheet.data.totals.fuelInLiters}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</p>
                      <p className="text-gray-900 dark:text-gray-100">{selectedLogsheet.data.userInfo.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Signature</p>
                      <p className="text-gray-900 dark:text-gray-100">{selectedLogsheet.data.userInfo.userSignature}</p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div className="space-y-3">
                  <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowReviewDialog(false)} disabled={actionLoading}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => handleStatusUpdate("Rejected")} disabled={actionLoading}>
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button onClick={() => handleStatusUpdate("Accepted")} disabled={actionLoading}>
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Accept
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
