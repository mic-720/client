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
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react"

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
    workingDetails: any
    productionDetails: any
    totals: any
    userInfo: any
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
    <div className="space-y-6">
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
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedLogsheet(logsheet)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Logsheet Details</DialogTitle>
                              <DialogDescription>Review the complete logsheet submission</DialogDescription>
                            </DialogHeader>
                            {selectedLogsheet && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold">Asset Code</h4>
                                    <p>{selectedLogsheet.data.assetCode}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Operator Name</h4>
                                    <p>{selectedLogsheet.data.operatorName}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Date</h4>
                                    <p>{new Date(selectedLogsheet.data.date).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Submitted By</h4>
                                    <p>{selectedLogsheet.userId.email}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Asset Description</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedLogsheet.data.assetDescription || "No description provided"}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Working Details</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p>
                                        <strong>Commenced:</strong>{" "}
                                        {selectedLogsheet.data.workingDetails.commenced.time}
                                      </p>
                                      <p>
                                        <strong>Reading:</strong>{" "}
                                        {selectedLogsheet.data.workingDetails.commenced.hmrOrKmrReading}
                                      </p>
                                    </div>
                                    <div>
                                      <p>
                                        <strong>Completed:</strong>{" "}
                                        {selectedLogsheet.data.workingDetails.completed.time}
                                      </p>
                                      <p>
                                        <strong>Reading:</strong>{" "}
                                        {selectedLogsheet.data.workingDetails.completed.hmrOrKmrReading}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Production Details</h4>
                                  <div className="text-sm space-y-1">
                                    <p>
                                      <strong>Activity Code:</strong>{" "}
                                      {selectedLogsheet.data.productionDetails.activityCode}
                                    </p>
                                    <p>
                                      <strong>Quantity Produced:</strong>{" "}
                                      {selectedLogsheet.data.productionDetails.quantityProduced}
                                    </p>
                                    <p>
                                      <strong>Work Done:</strong> {selectedLogsheet.data.productionDetails.workDone}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Totals</h4>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <p>
                                      <strong>Working Hours:</strong> {selectedLogsheet.data.totals.workingHours}
                                    </p>
                                    <p>
                                      <strong>Idle Hours:</strong> {selectedLogsheet.data.totals.idleHours}
                                    </p>
                                    <p>
                                      <strong>Breakdown Hours:</strong> {selectedLogsheet.data.totals.breakdownHours}
                                    </p>
                                    <p>
                                      <strong>Production Qty:</strong> {selectedLogsheet.data.totals.productionQty}
                                    </p>
                                    <p>
                                      <strong>HMR/KMR Run:</strong> {selectedLogsheet.data.totals.hmrOrKmrRun}
                                    </p>
                                    <p>
                                      <strong>Fuel (Liters):</strong> {selectedLogsheet.data.totals.fuelInLiters}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">User Information</h4>
                                  <div className="text-sm">
                                    <p>
                                      <strong>Name:</strong> {selectedLogsheet.data.userInfo.userName}
                                    </p>
                                    <p>
                                      <strong>Signature:</strong> {selectedLogsheet.data.userInfo.userSignature}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => updateLogsheetStatus(selectedLogsheet!._id, "Accepted")}
                                disabled={actionLoading === selectedLogsheet?._id}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept
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
                                      Please provide a reason for rejecting this logsheet
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter rejection reason..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
