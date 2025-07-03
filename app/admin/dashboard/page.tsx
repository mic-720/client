"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, CheckCircle, XCircle, Eye, LayoutDashboard, Users } from "lucide-react"
import Link from "next/link"

interface PendingLogsheet {
  _id: string
  userId: {
    email: string
  }
  data: {
    assetCode: string
    operatorName: string
    date: string
    assetDescription: string
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
  submittedAt: string
}

export default function AdminDashboard() {
  const [pendingLogsheets, setPendingLogsheets] = useState<PendingLogsheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLogsheet, setSelectedLogsheet] = useState<PendingLogsheet | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState("")

  useEffect(() => {
    fetchPendingLogsheets()
  }, [])

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
        setPendingLogsheets(data)
      } else {
        setError("Failed to fetch pending logsheets")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const updateLogsheetStatus = async (id: string, status: "Accepted" | "Rejected", reason?: string) => {
    setActionLoading(id)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/update-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          rejectionReason: reason,
        }),
      })

      if (response.ok) {
        setPendingLogsheets((prev) => prev.filter((log) => log._id !== id))
        setRejectionReason("")
        setSelectedLogsheet(null)
      } else {
        setError("Failed to update logsheet status")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setActionLoading("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Manage Users</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and manage pending logsheets</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingLogsheets.length}</div>
            <p className="text-xs text-muted-foreground">Logsheets awaiting review</p>
          </CardContent>
        </Card>

        {/* Pending Logsheets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Logsheets</CardTitle>
            <CardDescription>Review and approve or reject submitted logsheets</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLogsheets.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No pending logsheets to review</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLogsheets.map((logsheet) => (
                    <TableRow key={logsheet._id}>
                      <TableCell className="font-medium">{logsheet.userId.email}</TableCell>
                      <TableCell>{logsheet.data.assetCode}</TableCell>
                      <TableCell>{logsheet.data.operatorName}</TableCell>
                      <TableCell>{new Date(logsheet.data.date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(logsheet.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedLogsheet(logsheet)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">Logsheet Review</DialogTitle>
                              <DialogDescription>
                                Carefully review all details before making a decision
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLogsheet && (
                              <div className="overflow-y-auto max-h-[70vh] pr-4">
                                {/* Header Information */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        Asset Code
                                      </h4>
                                      <p className="text-lg font-bold">{selectedLogsheet.data.assetCode}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        Operator
                                      </h4>
                                      <p className="text-lg font-bold">{selectedLogsheet.data.operatorName}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Date</h4>
                                      <p className="text-lg font-bold">
                                        {new Date(selectedLogsheet.data.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        Submitted By
                                      </h4>
                                      <p className="text-sm font-medium">{selectedLogsheet.userId.email}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Asset Description */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-2 flex items-center">
                                    <div className="w-2 h-6 bg-blue-600 rounded mr-3"></div>
                                    Asset Description
                                  </h4>
                                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-gray-700 dark:text-gray-300">
                                      {selectedLogsheet.data.assetDescription || "No description provided"}
                                    </p>
                                  </div>
                                </div>

                                {/* Working Details */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-green-600 rounded mr-3"></div>
                                    Working Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                      <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                                        Commenced
                                      </h5>
                                      <div className="space-y-1">
                                        <p>
                                          <span className="font-medium">Time:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.commenced.time}
                                        </p>
                                        <p>
                                          <span className="font-medium">HMR/KMR Reading:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.commenced.hmrOrKmrReading}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                      <h5 className="font-semibold text-red-700 dark:text-red-300 mb-2">Completed</h5>
                                      <div className="space-y-1">
                                        <p>
                                          <span className="font-medium">Time:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.completed.time}
                                        </p>
                                        <p>
                                          <span className="font-medium">HMR/KMR Reading:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.completed.hmrOrKmrReading}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Production Details */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-purple-600 rounded mr-3"></div>
                                    Production Details
                                  </h4>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                          Activity Code
                                        </p>
                                        <p className="text-lg font-bold">
                                          {selectedLogsheet.data.productionDetails.activityCode}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                          Quantity Produced
                                        </p>
                                        <p className="text-lg font-bold">
                                          {selectedLogsheet.data.productionDetails.quantityProduced}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                          Work Done
                                        </p>
                                        <p className="text-sm">{selectedLogsheet.data.productionDetails.workDone}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Totals */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-orange-600 rounded mr-3"></div>
                                    Summary Totals
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                        Working Hours
                                      </p>
                                      <p className="text-2xl font-bold text-orange-600">
                                        {selectedLogsheet.data.totals.workingHours}
                                      </p>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                        Idle Hours
                                      </p>
                                      <p className="text-2xl font-bold text-yellow-600">
                                        {selectedLogsheet.data.totals.idleHours}
                                      </p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                        Breakdown Hours
                                      </p>
                                      <p className="text-2xl font-bold text-red-600">
                                        {selectedLogsheet.data.totals.breakdownHours}
                                      </p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Production Qty
                                      </p>
                                      <p className="text-2xl font-bold text-green-600">
                                        {selectedLogsheet.data.totals.productionQty}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        HMR/KMR Run
                                      </p>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {selectedLogsheet.data.totals.hmrOrKmrRun}
                                      </p>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                        Fuel (Liters)
                                      </p>
                                      <p className="text-2xl font-bold text-indigo-600">
                                        {selectedLogsheet.data.totals.fuelInLiters}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* User Information */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-gray-600 rounded mr-3"></div>
                                    User Information
                                  </h4>
                                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</p>
                                        <p className="text-lg font-bold">{selectedLogsheet.data.userInfo.userName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Signature
                                        </p>
                                        <p className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                          {selectedLogsheet.data.userInfo.userSignature}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter className="flex gap-3 pt-4 border-t">
                              <Button
                                variant="outline"
                                onClick={() => updateLogsheetStatus(selectedLogsheet!._id, "Accepted")}
                                disabled={actionLoading === selectedLogsheet?._id}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {actionLoading === selectedLogsheet?._id ? "Processing..." : "Accept"}
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Logsheet</DialogTitle>
                                    <DialogDescription>
                                      Please provide a clear reason for rejecting this logsheet. This will help the user
                                      understand what needs to be corrected.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter detailed rejection reason (e.g., 'Incorrect working hours calculation', 'Missing HMR readings', etc.)..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                    className="min-h-[100px]"
                                  />
                                  <DialogFooter>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        updateLogsheetStatus(selectedLogsheet!._id, "Rejected", rejectionReason)
                                      }
                                      disabled={!rejectionReason.trim() || actionLoading === selectedLogsheet?._id}
                                    >
                                      {actionLoading === selectedLogsheet?._id ? "Rejecting..." : "Reject Logsheet"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
